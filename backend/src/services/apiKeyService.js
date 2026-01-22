import crypto from "crypto";
import prisma from "../models/prismaClient.js";

const HASH_ALGORITHM = "sha256";

/**
 * Generate a secure API key
 */
export function generateApiKey() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(key) {
  return crypto.createHash(HASH_ALGORITHM).update(key).digest("hex");
}

/**
 * Create a new API key for manufacturer
 */
export async function createApiKey(
  manufacturerId,
  name,
  scope,
  rateLimit = 1000,
) {
  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);

  const apiKey = await prisma.apiKey.create({
    data: {
      manufacturerId,
      keyHash,
      name,
      scope, // e.g., "read,generate,revoke"
      rateLimit,
      isActive: true,
    },
  });

  return {
    ...apiKey,
    rawKey, // Only return raw key on creation
  };
}

/**
 * Get all API keys for manufacturer (hashed only)
 */
export async function getManufacturerApiKeys(manufacturerId) {
  return prisma.apiKey.findMany({
    where: { manufacturerId },
    select: {
      id: true,
      name: true,
      scope: true,
      rateLimit: true,
      usageCount: true,
      isActive: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Verify API key and return details
 */
export async function verifyApiKey(keyHash) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { manufacturer: true },
  });

  if (!apiKey || !apiKey.isActive) {
    return null;
  }

  // Check expiration
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  return apiKey;
}

/**
 * Update API key usage
 */
export async function recordApiKeyUsage(keyId, action = "api_call") {
  return prisma.apiKey.update({
    where: { id: keyId },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });
}

/**
 * Check rate limit for API key
 */
export async function checkRateLimit(apiKey) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usageToday = await prisma.analyticsAudit.count({
    where: {
      manufacturerId: apiKey.manufacturerId,
      actionType: "api_call",
      timestamp: { gte: today },
    },
  });

  return {
    allowed: usageToday < apiKey.rateLimit,
    used: usageToday,
    limit: apiKey.rateLimit,
    remaining: Math.max(0, apiKey.rateLimit - usageToday),
  };
}

/**
 * Revoke API key
 */
export async function revokeApiKey(keyId, manufacturerId) {
  const apiKey = await prisma.apiKey.findFirst({
    where: { id: keyId, manufacturerId },
  });

  if (!apiKey) {
    throw new Error("API key not found");
  }

  return prisma.apiKey.update({
    where: { id: keyId },
    data: { isActive: false },
  });
}

/**
 * Update API key scope
 */
export async function updateApiKeyScope(keyId, manufacturerId, newScope) {
  const apiKey = await prisma.apiKey.findFirst({
    where: { id: keyId, manufacturerId },
  });

  if (!apiKey) {
    throw new Error("API key not found");
  }

  return prisma.apiKey.update({
    where: { id: keyId },
    data: { scope: newScope },
  });
}

/**
 * Update API key rate limit
 */
export async function updateApiKeyRateLimit(keyId, manufacturerId, newLimit) {
  const apiKey = await prisma.apiKey.findFirst({
    where: { id: keyId, manufacturerId },
  });

  if (!apiKey) {
    throw new Error("API key not found");
  }

  return prisma.apiKey.update({
    where: { id: keyId },
    data: { rateLimit: newLimit },
  });
}

/**
 * Delete API key
 */
export async function deleteApiKey(keyId, manufacturerId) {
  const apiKey = await prisma.apiKey.findFirst({
    where: { id: keyId, manufacturerId },
  });

  if (!apiKey) {
    throw new Error("API key not found");
  }

  return prisma.apiKey.delete({
    where: { id: keyId },
  });
}

/**
 * Log API audit
 */
export async function logApiAudit(
  manufacturerId,
  actionType,
  details,
  ipAddress = null,
) {
  return prisma.analyticsAudit.create({
    data: {
      manufacturerId,
      actionType,
      details,
      ipAddress,
    },
  });
}

/**
 * Get audit logs for manufacturer
 */
export async function getAuditLogs(manufacturerId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return prisma.analyticsAudit.findMany({
    where: {
      manufacturerId,
      timestamp: { gte: startDate },
    },
    orderBy: { timestamp: "desc" },
    take: 1000,
  });
}
