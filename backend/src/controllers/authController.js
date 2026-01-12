import prisma from "../models/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const BCRYPT_SALT = parseInt(process.env.BCRYPT_SALT);

export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
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

    // 1️⃣ Create the User
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: normalizedRole },
    });

    // 2️⃣ If role is MANUFACTURER, auto-create a Manufacturer record
    if (normalizedRole === "MANUFACTURER") {
      await prisma.manufacturer.create({
        data: {
          id: user.id, // match the User ID
          userId: user.id, // link back to User
          name: user.name, // company name or user name
        },
      });
    }

    res.status(201).json({ message: "User Created", userId: user.id });
  } catch (error) {
    console.error("Prisma Signup Error:", error);
    res.status(500).json({ error: "Signup Failed", details: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Return user object with token (matching frontend expectations)
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(), // Convert CONSUMER -> consumer for frontend
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(200)
        .json({ message: "If user exists, resent link sent." });

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600 * 1000); //1hour

    await prisma.user.update({
      where: { email },
      data: { passwordResetToken: resetToken, passwordResetExpiry: expiry },
    });

    // send email
    const resetUrl = `${process.env.Frontend_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: `"Lumora" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Lumora Password",
      html: `<p>Click the link to reset your your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json({ message: "If user exists, reset link sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Forgot password failed" });
  }
};

export const resetPassword = async (req, res) => {
  // Read token & new password from POST body
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token and new password are required" });
  }

  try {
    // Find the user with valid token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gte: new Date() }, // token not expired
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT || 10);

    // Update user password and clear reset token + expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Reset password failed" });
  }
};
