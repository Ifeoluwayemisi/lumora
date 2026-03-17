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

    // Get optional role parameter for signup flow
    const { role } = req.query;
    const validRoles = ["CONSUMER", "MANUFACTURER"];
    const finalRole = validRoles.includes(role?.toUpperCase())
      ? role.toUpperCase()
      : "CONSUMER";

    // Encode state as JSON to pass both intent and role
    const state = JSON.stringify({ intent: finalIntent, role: finalRole });

    const scopes = [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "online",
      scope: scopes,
      prompt: "consent", // Force consent dialog
      state: state, // Pass intent and role as encoded state
    });

    console.log("[GOOGLE_AUTH_URL] Generated auth URL");
    res.json({ authUrl, intent: finalIntent, role: finalRole });
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
  let capturedError = null;

  try {
    const { code, state } = req.query;

    // Parse state which contains both intent and role as JSON
    let intent = "signin";
    let role = "CONSUMER";

    if (state) {
      try {
        const parsedState = JSON.parse(state);
        intent = parsedState.intent || "signin";
        role = parsedState.role || "CONSUMER";
      } catch (e) {
        // If state is not valid JSON, try treating it as intent directly (backward compatibility)
        intent = state;
      }
    }

    console.log(
      "[GOOGLE_CALLBACK] Parsed state - Intent:",
      intent,
      "Role:",
      role,
    );
    if (!code) {
      return res.status(400).json({ error: "Authorization code not provided" });
    }

    // Validate credentials
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error("[GOOGLE_CALLBACK] Missing Google OAuth credentials");
      return res.status(503).json({
        error: "Google OAuth not configured",
        message: "Server is missing Google OAuth credentials",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("[GOOGLE_CALLBACK] Missing JWT_SECRET");
      return res.status(503).json({
        error: "Server configuration error",
        message: "JWT_SECRET not configured",
      });
    }

    console.log("[GOOGLE_CALLBACK] Processing OAuth callback");
    console.log("[GOOGLE_CALLBACK] Intent:", intent);

    // Exchange code for tokens
    let tokens;
    try {
      const response = await oauth2Client.getToken(code);
      tokens = response.tokens;
      console.log("[GOOGLE_CALLBACK] ✓ Tokens obtained from Google");
    } catch (tokenErr) {
      console.error(
        "[GOOGLE_CALLBACK] Failed to exchange code:",
        tokenErr.message,
      );
      capturedError = "Failed to verify Google authentication code";
      throw tokenErr;
    }

    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    let userInfo;
    try {
      const oauth2 = google.oauth2("v2");
      const response = await oauth2.userinfo.get({ auth: oauth2Client });
      userInfo = response.data;
      console.log("[GOOGLE_CALLBACK] ✓ User info retrieved:", userInfo.email);
    } catch (userErr) {
      console.error(
        "[GOOGLE_CALLBACK] Failed to fetch user info:",
        userErr.message,
      );
      capturedError = "Failed to retrieve Google user information";
      throw userErr;
    }

    const { email, name, picture, given_name, family_name } = userInfo;

    if (!email) {
      console.error("[GOOGLE_CALLBACK] No email in Google response");
      capturedError = "No email address found in Google account";
      throw new Error(capturedError);
    }

    // Check if user exists
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          fullName: true,
          role: true,
          verified: true,
        },
      });
      console.log("[GOOGLE_CALLBACK] ✓ User lookup complete");
    } catch (dbErr) {
      console.error(
        "[GOOGLE_CALLBACK] Database error (user lookup):",
        dbErr.message,
      );
      capturedError = "Database error while checking user";
      throw dbErr;
    }

    // If user exists and intent is "signup", show error
    if (user && intent === "signup") {
      console.log("[GOOGLE_CALLBACK] User exists + signup intent = blocked");
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const errorUrl = new URL(`${frontendUrl}/auth/register`);
      errorUrl.searchParams.set("error", "account_exists");
      errorUrl.searchParams.set(
        "message",
        `Account with ${email} already exists. Please sign in instead.`,
      );
      return res.redirect(errorUrl.toString());
    }

    // Create or update user
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            email,
            name: given_name || name?.split(" ")[0] || "User",
            fullName: family_name || name?.split(" ").slice(1).join(" ") || "",
            password: "",
            role: role, // Use role from OAuth state
            verified: true,
            profilePicture: picture || null,
          },
          select: {
            id: true,
            email: true,
            name: true,
            fullName: true,
            role: true,
            verified: true,
          },
        });
        console.log(
          "[GOOGLE_CALLBACK] ✓ New user created:",
          user.id,
          "Role:",
          role,
        );

        // If user is manufacturer, create manufacturer profile
        if (role === "MANUFACTURER") {
          try {
            await prisma.manufacturer.create({
              data: {
                userId: user.id,
                name: user.fullName || user.name || "Manufacturer",
                email: user.email,
                country: "NG", // Default to Nigeria
                accountStatus: "pending_verification",
                trustScore: 0,
                riskLevel: "MEDIUM",
              },
            });
            console.log(
              "[GOOGLE_CALLBACK] ✓ Manufacturer profile created for user:",
              user.id,
            );
          } catch (manufacturerErr) {
            console.error(
              "[GOOGLE_CALLBACK] Failed to create manufacturer profile:",
              manufacturerErr.message,
            );
            // Don't fail the whole OAuth flow, but log it
          }
        }
      } catch (createErr) {
        console.error(
          "[GOOGLE_CALLBACK] Failed to create user:",
          createErr.message,
        );
        capturedError = "Failed to create user account";
        throw createErr;
      }
    } else {
      try {
        user = await prisma.user.update({
          where: { email },
          data: {
            name: given_name || name?.split(" ")[0] || user.name,
            fullName:
              family_name ||
              name?.split(" ").slice(1).join(" ") ||
              user.fullName,
            profilePicture: picture || user.profilePicture,
            verified: true,
          },
          select: {
            id: true,
            email: true,
            name: true,
            fullName: true,
            role: true,
            verified: true,
          },
        });
        console.log("[GOOGLE_CALLBACK] ✓ Existing user updated:", user.id);

        // If user is manufacturer, ensure manufacturer profile exists
        if (user.role === "MANUFACTURER") {
          try {
            const existingManufacturer = await prisma.manufacturer.findUnique({
              where: { userId: user.id },
            });

            if (!existingManufacturer) {
              await prisma.manufacturer.create({
                data: {
                  userId: user.id,
                  name: user.fullName || user.name || "Manufacturer",
                  email: user.email,
                  country: "NG", // Default to Nigeria
                  accountStatus: "pending_verification",
                  trustScore: 0,
                  riskLevel: "MEDIUM",
                },
              });
              console.log(
                "[GOOGLE_CALLBACK] ✓ Manufacturer profile created for existing user:",
                user.id,
              );
            }
          } catch (manufacturerErr) {
            console.error(
              "[GOOGLE_CALLBACK] Failed to ensure manufacturer profile:",
              manufacturerErr.message,
            );
            // Don't fail the whole OAuth flow
          }
        }
      } catch (updateErr) {
        console.error(
          "[GOOGLE_CALLBACK] Failed to update user:",
          updateErr.message,
        );
        capturedError = "Failed to update user profile";
        throw updateErr;
      }
    }

    // Generate JWT
    if (!user.id || !user.email || !user.role) {
      console.error("[GOOGLE_CALLBACK] Invalid user data:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });
      capturedError = "Invalid user data after creation/update";
      throw new Error(capturedError);
    }

    let token;
    try {
      token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
      );
      console.log("[GOOGLE_CALLBACK] ✓ JWT token generated");
    } catch (jwtErr) {
      console.error(
        "[GOOGLE_CALLBACK] Failed to generate JWT:",
        jwtErr.message,
      );
      capturedError = "Failed to generate authentication token";
      throw jwtErr;
    }

    // Build redirect URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set(
      "user",
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        fullName: user.fullName,
        role: user.role,
      }),
    );

    const finalUrl = redirectUrl.toString();
    console.log(
      "[GOOGLE_CALLBACK] ✓ Redirect URL size:",
      finalUrl.length,
      "chars",
    );
    console.log("[GOOGLE_CALLBACK] ✓ Redirecting to dashboard callback");

    res.redirect(finalUrl);
  } catch (err) {
    console.error("[GOOGLE_CALLBACK] ❌ Error:", err.message);
    console.error("[GOOGLE_CALLBACK] Stack:", err.stack);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const errorUrl = new URL(`${frontendUrl}/auth/login`);
    errorUrl.searchParams.set("error", "google_auth_failed");
    errorUrl.searchParams.set(
      "message",
      capturedError || err.message || "Authentication failed",
    );

    console.log(
      "[GOOGLE_CALLBACK] Redirecting to error page:",
      errorUrl.toString(),
    );
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
        name: true,
        fullName: true,
        role: true,
        verified: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: given_name || name?.split(" ")[0] || "User",
          fullName: family_name || name?.split(" ").slice(1).join(" ") || "",
          password: "",
          role: "CONSUMER",
          verified: true,
          profilePicture: picture || null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          fullName: true,
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
