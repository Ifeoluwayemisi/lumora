import prisma from "../models/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import * as manufacturerReviewService from "../services/manufacturerReviewService.js";

// Validate email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn(
    "⚠️  Email service not configured - password reset emails will not be sent",
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const BCRYPT_SALT = parseInt(process.env.BCRYPT_SALT || "10");

/**
 * Signup endpoint
 * Creates a new user account (consumer or manufacturer)
 *
 * For manufacturers:
 * - Requires: name, email, password, companyName, country, phone
 * - Creates both User and Manufacturer records
 * - Sets accountStatus to 'pending_verification'
 */
export const signup = async (req, res) => {
  const { name, email, password, role, companyName, country, phone } = req.body;

  console.log(
    "[SIGNUP] Received payload - role:",
    role,
    "companyName:",
    companyName,
    "country:",
    country,
  );

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name", "email", "password"],
    });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT);

    // Map frontend roles to Prisma enum values
    const roleMap = {
      user: "CONSUMER",
      consumer: "CONSUMER",
      manufacturer: "MANUFACTURER",
      admin: "ADMIN",
      nafdac: "NAFDAC",
    };

    const normalizedRole = roleMap[role?.toLowerCase()] || "CONSUMER";
    console.log("[SIGNUP] Role mapping:", {
      input: role,
      normalized: normalizedRole,
      companyName,
      country,
    });

    // Create the User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: normalizedRole,
      },
    });

    console.log("[SIGNUP] User created with role:", user.role);

    // If role is MANUFACTURER, create Manufacturer record with pending verification
    if (normalizedRole === "MANUFACTURER") {
      if (!companyName || !country) {
        // Clean up created user if manufacturer data is incomplete
        await prisma.user.delete({ where: { id: user.id } });
        return res.status(400).json({
          error: "Missing manufacturer required fields",
          required: ["companyName", "country"],
        });
      }

      try {
        // Create manufacturer with all fields
        const manufacturerRecord = await prisma.manufacturer.create({
          data: {
            id: user.id,
            userId: user.id,
            name: companyName,
            email: email,
            phone: phone || null,
            country: country,
            accountStatus: "pending_verification",
            verified: false,
            trustScore: 0,
            riskLevel: "MEDIUM",
            plan: "BASIC",
          },
        });

        console.log(
          "[SIGNUP] Manufacturer record created:",
          manufacturerRecord.id,
        );

        // Create manufacturer review record for admin dashboard
        const reviewRecord =
          await manufacturerReviewService.createManufacturerReview(user.id);

        console.log("[SIGNUP] Manufacturer review created:", reviewRecord.id);
        console.log(
          "[SIGNUP] Manufacturer created successfully with all fields",
        );
      } catch (manufacturerErr) {
        // Log detailed error for debugging
        console.error("[SIGNUP] Manufacturer/Review creation failed:", {
          message: manufacturerErr.message,
          code: manufacturerErr.code,
          stack: manufacturerErr.stack,
        });

        // Always clean up the user if manufacturer creation fails
        await prisma.user.delete({ where: { id: user.id } });

        // If it's a schema mismatch, provide clear message
        if (manufacturerErr.message.includes("Unknown argument")) {
          console.log(
            "[SIGNUP] Database schema mismatch - new fields not deployed yet",
          );
          return res.status(503).json({
            error: "Service temporarily unavailable",
            message:
              "The manufacturer system is being updated. Please try again in 1-2 minutes.",
            retryAfter: 120,
          });
        }

        // For other errors, throw
        throw manufacturerErr;
      }
    }

    return res.status(201).json({
      message:
        normalizedRole === "MANUFACTURER"
          ? "Manufacturer account created. Please upload verification documents."
          : "User created successfully",
      userId: user.id,
      role: normalizedRole.toLowerCase(),
    });
  } catch (error) {
    console.error("[SIGNUP] Error:", error.message);

    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email already registered" });
    }

    return res.status(500).json({
      error: "Signup failed",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again later",
    });
  }
};

/**
 * Login endpoint
 * Authenticates user and returns JWT token
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["email", "password"],
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(
      "[LOGIN] User lookup for email:",
      email,
      "Found:",
      !!user,
      "Role:",
      user?.role,
    );
    if (!user) {
      // Don't reveal if email exists
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    // Return user object with token (matching frontend expectations)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      verified: user.verified,
    };
    console.log("[LOGIN] Returning user with role:", userResponse.role);
    return res.status(200).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("[LOGIN] Error:", error.message);
    return res.status(500).json({
      error: "Login failed",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again later",
    });
  }
};

/**
 * Forgot Password endpoint
 * Initiates password reset flow
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return the same message for security (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, a reset link has been sent",
      });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiry = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Save hashed token to database
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpiry: expiry,
      },
    });

    console.log("[FORGOT_PASSWORD] Reset token generated for:", email);
    const frontendUrl =
      process.env.FRONTEND_URL || "https://lumora-gold.vercel.app";
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;
    console.log("[FORGOT_PASSWORD] Reset URL:", resetUrl);

    // Try to send email if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: `"Lumora Support" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Reset Your Lumora Password",
          html: `
            <p>You requested a password reset. Click the link below to continue:</p>
            <a href="${resetUrl}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          `,
        });
        console.log("[FORGOT_PASSWORD] Email sent successfully to:", email);
      } catch (emailError) {
        console.error(
          "[FORGOT_PASSWORD] Email send failed:",
          emailError.message,
        );
        // Continue anyway - token is still valid in database
      }
    } else {
      console.warn(
        "[FORGOT_PASSWORD] Email service not configured - reset link must be provided to user through other means",
      );
    }

    return res.status(200).json({
      message:
        "If an account with that email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("[FORGOT_PASSWORD] Error:", error.message);
    return res.status(500).json({
      error: "Request failed",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again later",
    });
  }
};

/**
 * Reset Password endpoint
 * Completes password reset with valid token
 */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["token", "newPassword"],
    });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: "New password must be at least 8 characters long" });
  }

  try {
    // Hash the provided token to compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user with valid token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpiry: { gte: new Date() }, // token not expired
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("[RESET_PASSWORD] Error:", error.message);
    return res.status(500).json({
      error: "Reset password failed",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again later",
    });
  }
};
