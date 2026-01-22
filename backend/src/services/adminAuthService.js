import crypto from "crypto";
import prisma from "../models/prismaClient.js";
import {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
} from "../utils/twoFactorAuth.js";

/**
 * Create or register admin user
 */
export async function createAdminUser(
  email,
  password,
  firstName,
  lastName,
  role,
) {
  // Check if admin already exists
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    throw new Error("Admin user already exists");
  }

  // Hash password
  const passwordHash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  // Generate 2FA secret
  const twoFactorSecret = generateTwoFactorSecret();

  const admin = await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role, // SUPER_ADMIN, MODERATOR, ANALYST, SUPPORT
      twoFactorSecret,
      twoFactorEnabled: true,
      isActive: true,
    },
  });

  return {
    id: admin.id,
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    role: admin.role,
    twoFactorSecret, // Return for QR code display
    message: "Admin created. Please scan 2FA QR code.",
  };
}

/**
 * Verify admin login credentials
 */
export async function verifyAdminLogin(email, password) {
  const admin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new Error("Invalid credentials");
  }

  if (!admin.isActive) {
    throw new Error("Admin account is inactive");
  }

  // Hash input password and compare
  const inputHash = crypto.createHash("sha256").update(password).digest("hex");

  if (inputHash !== admin.passwordHash) {
    throw new Error("Invalid credentials");
  }

  return admin;
}

/**
 * Verify 2FA token
 */
export async function verify2FAToken(adminId, token) {
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
  });

  if (!admin || !admin.twoFactorSecret) {
    throw new Error("2FA not enabled");
  }

  const isValid = verifyTwoFactorToken(admin.twoFactorSecret, token);

  if (!isValid) {
    throw new Error("Invalid 2FA token");
  }

  return true;
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(adminId, ipAddress) {
  return prisma.adminUser.update({
    where: { id: adminId },
    data: {
      lastLogin: new Date(),
      lastLoginIp: ipAddress,
    },
  });
}

/**
 * Get admin user with role
 */
export async function getAdminUser(adminId) {
  return prisma.adminUser.findUnique({
    where: { id: adminId },
  });
}

/**
 * Change admin password
 */
export async function changeAdminPassword(adminId, oldPassword, newPassword) {
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  // Verify old password
  const oldHash = crypto.createHash("sha256").update(oldPassword).digest("hex");
  if (oldHash !== admin.passwordHash) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const newHash = crypto.createHash("sha256").update(newPassword).digest("hex");

  return prisma.adminUser.update({
    where: { id: adminId },
    data: { passwordHash: newHash },
  });
}

/**
 * Disable admin user
 */
export async function disableAdminUser(adminId, reason) {
  return prisma.adminUser.update({
    where: { id: adminId },
    data: { isActive: false },
  });
}

/**
 * List all admin users
 */
export async function listAdminUsers(role = null) {
  const where = {};
  if (role) where.role = role;

  return prisma.adminUser.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      lastLogin: true,
      lastLoginIp: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
