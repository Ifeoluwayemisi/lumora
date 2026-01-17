import prisma from "../models/prismaClient.js";
import { startOfDay, endOfDay } from "date-fns";

/**
 * Get today's code quota usage for a manufacturer
 */
export async function getTodayQuotaUsage(manufacturerId) {
  try {
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    const codesCreatedToday = await prisma.code.count({
      where: {
        manufacturerId,
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    return codesCreatedToday;
  } catch (error) {
    console.error("[QUOTA] Error getting usage:", error.message);
    throw error;
  }
}

/**
 * Get manufacturer quota limit based on plan
 */
export function getQuotaLimit(plan) {
  const limits = {
    BASIC: 50,
    PREMIUM: 10000, // Effectively unlimited
  };
  return limits[plan] || 50;
}

/**
 * Check if manufacturer can create more codes today
 */
export async function canCreateCode(manufacturerId) {
  try {
    // Get manufacturer plan
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { plan: true },
    });

    if (!manufacturer) {
      throw new Error("Manufacturer not found");
    }

    const limit = getQuotaLimit(manufacturer.plan);
    const used = await getTodayQuotaUsage(manufacturerId);

    return {
      canCreate: used < limit,
      used,
      limit,
      remaining: Math.max(0, limit - used),
      plan: manufacturer.plan,
    };
  } catch (error) {
    console.error("[QUOTA] Error checking quota:", error.message);
    throw error;
  }
}

/**
 * Get quota info for dashboard display
 */
export async function getQuotaInfo(manufacturerId) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { plan: true, createdAt: true },
    });

    if (!manufacturer) {
      throw new Error("Manufacturer not found");
    }

    const used = await getTodayQuotaUsage(manufacturerId);
    const limit = getQuotaLimit(manufacturer.plan);
    const remaining = Math.max(0, limit - used);
    const percentage = (used / limit) * 100;

    return {
      plan: manufacturer.plan,
      used,
      limit,
      remaining,
      percentage,
      quotaExceeded: used >= limit,
    };
  } catch (error) {
    console.error("[QUOTA] Error getting info:", error.message);
    throw error;
  }
}
