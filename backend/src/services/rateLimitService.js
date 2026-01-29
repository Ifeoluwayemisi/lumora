import prisma from "../models/prismaClient.js";

const RATE_LIMITS = {
  CODE_GENERATION: { limit: 100, window: 60 * 60 * 1000 }, // 100 per hour
  VERIFICATION: { limit: 1000, window: 60 * 60 * 1000 }, // 1000 per hour
  API: { limit: 10000, window: 60 * 60 * 1000 }, // 10000 per hour
  BATCH_CREATION: { limit: 50, window: 24 * 60 * 60 * 1000 }, // 50 per day
  TEAM_INVITE: { limit: 10, window: 60 * 60 * 1000 }, // 10 per hour
};

// In-memory rate limit tracker (in production, use Redis)
const rateLimitTracker = new Map();

/**
 * Check if request should be rate limited
 * @param {string} key - Unique identifier (userId, apiKey, IP, etc.)
 * @param {string} action - Action type (CODE_GENERATION, VERIFICATION, etc.)
 * @returns {{ allowed: boolean, remaining: number, resetTime: Date }}
 */
export function checkRateLimit(key, action) {
  const limit = RATE_LIMITS[action];
  if (!limit) {
    return { allowed: true, remaining: Infinity };
  }

  const trackingKey = `${action}:${key}`;
  const now = Date.now();

  // Get or create tracking entry
  let entry = rateLimitTracker.get(trackingKey);

  if (!entry || now > entry.resetTime) {
    // Create new window
    entry = {
      count: 0,
      resetTime: now + limit.window,
    };
  }

  // Check if limit exceeded
  const allowed = entry.count < limit.limit;

  if (allowed) {
    entry.count++;
  }

  rateLimitTracker.set(trackingKey, entry);

  return {
    allowed,
    remaining: Math.max(0, limit.limit - entry.count),
    resetTime: new Date(entry.resetTime),
    limit: limit.limit,
  };
}

/**
 * Get rate limit status for user
 */
export async function getRateLimitStatus(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { manufacturer: true },
    });

    if (!user) throw new Error("User not found");

    const statuses = {};
    for (const [action] of Object.entries(RATE_LIMITS)) {
      const status = checkRateLimit(userId, action);
      statuses[action] = status;
    }

    return statuses;
  } catch (err) {
    console.error("[RATE_LIMIT] Error getting status:", err.message);
    throw err;
  }
}

/**
 * Record rate limit event (for analytics/abuse detection)
 */
export async function recordRateLimitEvent(userId, action, allowed) {
  try {
    // This would write to a separate table for rate limit monitoring
    // For now, just log
    if (!allowed) {
      console.warn(`[RATE_LIMIT] ${action} exceeded for user ${userId}`);

      // Could trigger alert/ban logic here
      const recentAttempts = rateLimitTracker.get(`${action}:${userId}`);
      if (
        recentAttempts &&
        recentAttempts.count > RATE_LIMITS[action].limit * 1.5
      ) {
        // User is aggressively trying to exceed limit
        console.warn(`[ABUSE_ALERT] Potential abuse from ${userId}`);
      }
    }
  } catch (err) {
    console.error("[RATE_LIMIT_EVENT] Error recording:", err.message);
  }
}

/**
 * Reset rate limit for user (admin action)
 */
export function resetRateLimit(key, action = null) {
  if (action) {
    const trackingKey = `${action}:${key}`;
    rateLimitTracker.delete(trackingKey);
  } else {
    // Reset all actions for this key
    for (const action of Object.keys(RATE_LIMITS)) {
      const trackingKey = `${action}:${key}`;
      rateLimitTracker.delete(trackingKey);
    }
  }
  console.log(
    `[RATE_LIMIT] Reset ${action ? `${action} ` : ""}limits for ${key}`,
  );
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats() {
  const stats = {};
  for (const [key, value] of rateLimitTracker.entries()) {
    const [action, userId] = key.split(":");
    if (!stats[action]) {
      stats[action] = { total: 0, active: 0 };
    }
    stats[action].total++;
    if (value.count > 0) {
      stats[action].active++;
    }
  }
  return stats;
}

/**
 * Middleware for Express/Fastify to enforce rate limits
 */
export function createRateLimitMiddleware(action, options = {}) {
  return async (req, res, next) => {
    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : req.user?.id || req.ip;

    const status = checkRateLimit(key, action);
    await recordRateLimitEvent(key, action, status.allowed);

    // Add headers
    res.setHeader("X-RateLimit-Limit", status.limit);
    res.setHeader("X-RateLimit-Remaining", status.remaining);
    res.setHeader("X-RateLimit-Reset", status.resetTime.toISOString());

    if (!status.allowed) {
      return res.status(429).json({
        error: "Too many requests",
        message: `Rate limit exceeded for ${action}. Try again in ${Math.ceil((status.resetTime - new Date()) / 1000)} seconds.`,
        retryAfter: Math.ceil((status.resetTime - new Date()) / 1000),
      });
    }

    next();
  };
}

/**
 * Clean up old rate limit entries (periodic cleanup)
 */
export function cleanupOldEntries() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of rateLimitTracker.entries()) {
    if (now > entry.resetTime) {
      rateLimitTracker.delete(key);
      cleaned++;
    }
  }

  console.log(`[RATE_LIMIT_CLEANUP] Removed ${cleaned} expired entries`);
  return cleaned;
}

/**
 * Schedule periodic cleanup
 */
export function scheduleRateLimitCleanup(intervalHours = 24) {
  setInterval(
    () => {
      cleanupOldEntries();
    },
    intervalHours * 60 * 60 * 1000,
  );

  console.log(`[RATE_LIMIT] Cleanup scheduled every ${intervalHours} hours`);
}

/**
 * Legacy function - kept for backward compatibility
 */
export async function checkRateLimitLegacy(userId, ipAddress) {
  // Disabled for development - set ENABLE_RATE_LIMIT=true in .env to enable
  if (process.env.ENABLE_RATE_LIMIT !== "true") {
    return; // Skip rate limiting in dev
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await prisma.verificationLog.count({
    where: {
      createdAt: { gte: today },
      OR: [userId ? { userId } : {}],
    },
  });

  const limit = userId ? 30 : 5;

  if (count >= limit) {
    throw new Error("Rate limit exceeded");
  }
}

// ========== AGENCY RATE LIMITING ==========

/**
 * Check if an agency can receive a new alert
 * Returns { canSend, reason, throttleUntil }
 */
export async function checkAgencyRateLimit(agency) {
  try {
    let rateLimit = await prisma.agencyRateLimit.findUnique({
      where: { agency },
    });

    // Initialize if doesn't exist
    if (!rateLimit) {
      rateLimit = await prisma.agencyRateLimit.create({
        data: {
          agency,
          hourlyResetAt: new Date(Date.now() + 3600000),
          dailyResetAt: new Date(Date.now() + 86400000),
        },
      });
    }

    const now = new Date();

    // Reset hourly counter if needed
    if (now > rateLimit.hourlyResetAt) {
      rateLimit = await prisma.agencyRateLimit.update({
        where: { agency },
        data: {
          currentHourlyCount: 0,
          hourlyResetAt: new Date(now.getTime() + 3600000),
        },
      });
    }

    // Reset daily counter if needed
    if (now > rateLimit.dailyResetAt) {
      rateLimit = await prisma.agencyRateLimit.update({
        where: { agency },
        data: {
          currentDailyCount: 0,
          dailyResetAt: new Date(now.getTime() + 86400000),
        },
      });
    }

    // Check if throttled
    if (rateLimit.isThrottled && now < rateLimit.throttleUntil) {
      return {
        canSend: false,
        reason: "Agency is currently throttled",
        throttleUntil: rateLimit.throttleUntil,
      };
    }

    // Clear throttle if expired
    if (rateLimit.isThrottled && now >= rateLimit.throttleUntil) {
      rateLimit = await prisma.agencyRateLimit.update({
        where: { agency },
        data: {
          isThrottled: false,
          throttleUntil: null,
        },
      });
    }

    // Check hourly limit
    if (rateLimit.currentHourlyCount >= rateLimit.alertsPerHour) {
      // Throttle for 1 hour
      await activateThrottling(agency, 3600);
      return {
        canSend: false,
        reason: `Hourly limit (${rateLimit.alertsPerHour}) exceeded`,
        throttleUntil: new Date(now.getTime() + 3600000),
      };
    }

    // Check daily limit
    if (rateLimit.currentDailyCount >= rateLimit.alertsPerDay) {
      // Throttle for 24 hours
      await activateThrottling(agency, 86400);
      return {
        canSend: false,
        reason: `Daily limit (${rateLimit.alertsPerDay}) exceeded`,
        throttleUntil: new Date(now.getTime() + 86400000),
      };
    }

    return {
      canSend: true,
      hourlyRemaining: rateLimit.alertsPerHour - rateLimit.currentHourlyCount,
      dailyRemaining: rateLimit.alertsPerDay - rateLimit.currentDailyCount,
    };
  } catch (error) {
    console.error("[RATE_LIMIT] Error checking rate limit:", error.message);
    // Allow on error (fail open)
    return { canSend: true, reason: "Rate limit check failed" };
  }
}

/**
 * Increment alert count for agency
 */
export async function incrementAgencyAlertCount(agency) {
  try {
    await prisma.agencyRateLimit.upsert({
      where: { agency },
      update: {
        currentHourlyCount: { increment: 1 },
        currentDailyCount: { increment: 1 },
      },
      create: {
        agency,
        currentHourlyCount: 1,
        currentDailyCount: 1,
        hourlyResetAt: new Date(Date.now() + 3600000),
        dailyResetAt: new Date(Date.now() + 86400000),
      },
    });
    console.log(`[RATE_LIMIT] Incremented count for ${agency}`);
  } catch (error) {
    console.error(
      "[RATE_LIMIT] Error incrementing alert count:",
      error.message,
    );
  }
}

/**
 * Activate throttling for an agency
 */
export async function activateThrottling(agency, durationSeconds) {
  try {
    const throttleUntil = new Date(Date.now() + durationSeconds * 1000);
    await prisma.agencyRateLimit.update({
      where: { agency },
      data: {
        isThrottled: true,
        throttleUntil,
      },
    });
    console.log(
      `[RATE_LIMIT] Throttled ${agency} until ${throttleUntil.toISOString()}`,
    );
  } catch (error) {
    console.error("[RATE_LIMIT] Error activating throttling:", error.message);
  }
}

/**
 * Get current rate limit status for agency
 */
export async function getAgencyRateLimitStatus(agency) {
  try {
    let rateLimit = await prisma.agencyRateLimit.findUnique({
      where: { agency },
    });

    if (!rateLimit) {
      return {
        agency,
        status: "not_configured",
      };
    }

    const now = new Date();
    const hourlyPercentage =
      (rateLimit.currentHourlyCount / rateLimit.alertsPerHour) * 100;
    const dailyPercentage =
      (rateLimit.currentDailyCount / rateLimit.alertsPerDay) * 100;

    return {
      agency,
      isThrottled: rateLimit.isThrottled && now < rateLimit.throttleUntil,
      throttleUntil: rateLimit.throttleUntil,
      hourly: {
        current: rateLimit.currentHourlyCount,
        limit: rateLimit.alertsPerHour,
        remaining: Math.max(
          0,
          rateLimit.alertsPerHour - rateLimit.currentHourlyCount,
        ),
        percentage: hourlyPercentage,
        resetsAt: rateLimit.hourlyResetAt,
      },
      daily: {
        current: rateLimit.currentDailyCount,
        limit: rateLimit.alertsPerDay,
        remaining: Math.max(
          0,
          rateLimit.alertsPerDay - rateLimit.currentDailyCount,
        ),
        percentage: dailyPercentage,
        resetsAt: rateLimit.dailyResetAt,
      },
    };
  } catch (error) {
    console.error(
      "[RATE_LIMIT] Error getting rate limit status:",
      error.message,
    );
    return null;
  }
}

/**
 * Update rate limit configuration for agency
 */
export async function updateAgencyRateLimit(agency, config) {
  try {
    const updated = await prisma.agencyRateLimit.update({
      where: { agency },
      data: {
        alertsPerHour: config.alertsPerHour || undefined,
        alertsPerDay: config.alertsPerDay || undefined,
      },
    });
    console.log(`[RATE_LIMIT] Updated configuration for ${agency}`);
    return updated;
  } catch (error) {
    console.error("[RATE_LIMIT] Error updating configuration:", error.message);
    throw error;
  }
}

/**
 * Get all agencies rate limit status
 */
export async function getAllAgenciesRateLimitStatus() {
  try {
    const rateLimits = await prisma.agencyRateLimit.findMany();
    return rateLimits.map((rl) => ({
      agency: rl.agency,
      isThrottled: rl.isThrottled && new Date() < rl.throttleUntil,
      hourlyUsage:
        ((rl.currentHourlyCount / rl.alertsPerHour) * 100).toFixed(1) + "%",
      dailyUsage:
        ((rl.currentDailyCount / rl.alertsPerDay) * 100).toFixed(1) + "%",
    }));
  } catch (error) {
    console.error("[RATE_LIMIT] Error getting all statuses:", error.message);
    return [];
  }
}
