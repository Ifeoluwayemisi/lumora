/**
 * Google OAuth Authentication Controller
 * Handles sign-in with Google account
 *
 * Setup:
 * 1. Go to https://console.cloud.google.com
 * 2. Create a new project or select existing
 * 3. Enable "Google+ API"
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add redirect URI: http://localhost:5000/api/auth/google/callback (for dev)
 * 6. Copy Client ID and Secret to .env:
 *    GOOGLE_CLIENT_ID="your_client_id"
 *    GOOGLE_CLIENT_SECRET="your_client_secret"
 */

import prisma from "../models/prismaClient.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`,
);

/**
 * Generate Google OAuth URL for frontend redirect
 *
 * Query Parameters:
 * - intent: "signin" or "signup" (determines behavior for existing users)
 *
 * Usage:
 * 1. Frontend calls GET /api/auth/google/url?intent=signin
 * 2. Backend returns OAuth URL
 * 3. Frontend redirects user to this URL
 * 4. Google handles login dialog
 * 5. User approved, redirected to callback with code
 */
export async function getGoogleAuthUrl(req, res) {
  try {
    console.log("[GOOGLE_AUTH_URL] Received request");
    console.log("[GOOGLE_AUTH_URL] CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
    console.log(
      "[GOOGLE_AUTH_URL] CLIENT_SECRET:",
      process.env.GOOGLE_CLIENT_SECRET,
    );

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error("[GOOGLE_AUTH_URL] Missing credentials!");
      return res.status(503).json({
        error: "Google OAuth not configured",
        message:
          "Google authentication is not available. Please contact admin to set up Google OAuth credentials.",
      });
    }

    const { intent } = req.query;
    const validIntents = ["signin", "signup"];
    const finalIntent = validIntents.includes(intent) ? intent : "signin";

    console.log("[GOOGLE_AUTH_URL] Intent:", finalIntent);

    const scopes = [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "online",
      scope: scopes,
      prompt: "consent", // Force consent dialog
      state: finalIntent, // Pass intent as state for callback
    });

    console.log("[GOOGLE_AUTH_URL] Generated auth URL");
    res.json({ authUrl, intent: finalIntent });
  } catch (err) {
    console.error("[GOOGLE_AUTH_URL] Error:", err.message);
    res.status(500).json({
      error: "Failed to generate auth URL",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Google OAuth Callback Handler
 *
 * Called after user approves Google sign-in
 * Exchanges authorization code for tokens
 * Creates or updates user in database
 * Returns JWT token for frontend
 *
 * Behavior:
 * - Sign-in (intent=signin): Existing users log in, new users are created
 * - Sign-up (intent=signup): New users created, existing users shown error asking to sign in with email
 */
export async function googleCallback(req, res) {
  try {
    const { code, state } = req.query;
    const intent = state || "signin"; // Default to signin if not provided

    if (!code) {
      return res.status(400).json({ error: "Authorization code not provided" });
    }

    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      process.env.GOOGLE_CLIENT_ID === "your_google_client_id_here"
    ) {
      return res.status(503).json({
        error: "Google OAuth not configured",
      });
    }

    console.log("[GOOGLE_CALLBACK] Intent:", intent);
    console.log("[GOOGLE_CALLBACK] Exchanging code for tokens...");

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    console.log("[GOOGLE_CALLBACK] Fetching user info from Google...");
    const oauth2 = google.oauth2("v2");
    const userInfo = await oauth2.userinfo.get({
      auth: oauth2Client,
    });

    const { email, name, picture, given_name, family_name } = userInfo.data;

    console.log("[GOOGLE_CALLBACK] User info received:", email);

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
      },
    });

    // If user exists and intent is "signup", return error
    if (user && intent === "signup") {
      console.log(
        "[GOOGLE_CALLBACK] User already exists, signup attempt blocked",
      );

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const errorUrl = new URL(`${frontendUrl}/auth/register`);
      errorUrl.searchParams.set("error", "account_exists");
      errorUrl.searchParams.set(
        "message",
        `An account with ${email} already exists. Please sign in with your email instead, or link this Google account after logging in.`,
      );

      return res.redirect(errorUrl.toString());
    }

    if (!user) {
      console.log("[GOOGLE_CALLBACK] Creating new user from Google...");

      // Create new user from Google info
      user = await prisma.user.create({
        data: {
          email,
          firstName: given_name || name?.split(" ")[0] || "User",
          lastName: family_name || name?.split(" ").slice(1).join(" ") || "",
          password: null, // OAuth users don't have password
          role: "user", // Default role
          verified: true, // Google accounts are pre-verified
          profilePicture: picture || null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          verified: true,
        },
      });

      console.log("[GOOGLE_CALLBACK] New user created:", user.id);
    } else {
      console.log("[GOOGLE_CALLBACK] User found, updating profile...");

      // Update user with latest Google info
      user = await prisma.user.update({
        where: { email },
        data: {
          firstName: given_name || name?.split(" ")[0] || user.firstName,
          lastName:
            family_name || name?.split(" ").slice(1).join(" ") || user.lastName,
          profilePicture: picture || user.profilePicture,
          verified: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          verified: true,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    console.log("[GOOGLE_CALLBACK] JWT token generated for:", user.email);

    // Redirect to frontend with token and minimal user data
    // Keep URL short to avoid browser length limits
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
    redirectUrl.searchParams.set("token", token);
    // Send only essential user data to keep URL short
    const minimalUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
    redirectUrl.searchParams.set("user", JSON.stringify(minimalUser));

    const finalUrl = redirectUrl.toString();
    console.log(
      "[GOOGLE_CALLBACK] Redirect URL length:",
      finalUrl.length,
      "chars",
    );
    console.log("[GOOGLE_CALLBACK] Redirecting to:", finalUrl);

    res.redirect(finalUrl);
  } catch (err) {
    console.error("[GOOGLE_CALLBACK] Error:", err.message);
    console.error("[GOOGLE_CALLBACK] Stack:", err.stack);

    // Redirect to frontend with error
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const errorUrl = new URL(`${frontendUrl}/auth/login`);
    errorUrl.searchParams.set("error", "google_auth_failed");
    errorUrl.searchParams.set("message", err.message);

    res.redirect(errorUrl.toString());
  }
}

/**
 * Verify Google ID Token (alternative method for mobile apps)
 * If frontend has its own Google SDK, it can verify token server-side
 */
export async function verifyGoogleToken(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "ID token not provided" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({
        error: "Google OAuth not configured",
      });
    }

    console.log("[VERIFY_GOOGLE] Verifying token...");

    // Verify the token
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, given_name, family_name } =
      ticket.getPayload();

    console.log("[VERIFY_GOOGLE] Token verified for:", email);

    // Check or create user
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName: given_name || name?.split(" ")[0] || "User",
          lastName: family_name || name?.split(" ").slice(1).join(" ") || "",
          password: null,
          role: "user",
          verified: true,
          profilePicture: picture || null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          verified: true,
        },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    console.log("[VERIFY_GOOGLE] Returning user and token");

    res.json({
      success: true,
      user,
      token,
    });
  } catch (err) {
    console.error("[VERIFY_GOOGLE] Error:", err.message);
    res.status(401).json({
      error: "Invalid token",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Token verification failed",
    });
  }
}
