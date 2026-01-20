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
