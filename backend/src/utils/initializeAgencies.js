import prisma from "../models/prismaClient.js";

/**
 * Initialize rate limit and webhook records for all agencies
 * Call this once on server startup to ensure all agencies have records
 */
export async function initializeAgencies() {
  try {
    console.log("[INIT] Initializing agency records...");

    const agencies = [
      {
        name: "NAFDAC",
        displayName: "National Agency for Food & Drug Administration",
        alertsPerHour: 100,
        alertsPerDay: 1000,
      },
      {
        name: "FIRS",
        displayName: "Federal Inland Revenue Service",
        alertsPerHour: 100,
        alertsPerDay: 1000,
      },
      {
        name: "NAFDAC-COSMETICS",
        displayName: "NAFDAC - Cosmetics Division",
        alertsPerHour: 100,
        alertsPerDay: 1000,
      },
    ];

    for (const agency of agencies) {
      // Initialize rate limit record if it doesn't exist
      const existingRateLimit = await prisma.agencyRateLimit.findUnique({
        where: { agency: agency.name },
      });

      if (!existingRateLimit) {
        await prisma.agencyRateLimit.create({
          data: {
            agency: agency.name,
            alertsPerHour: agency.alertsPerHour,
            alertsPerDay: agency.alertsPerDay,
            currentHourCount: 0,
            currentDayCount: 0,
            isThrottled: false,
            hourlyResetAt: getNextHourReset(),
            dailyResetAt: getNextDayReset(),
          },
        });
        console.log(`[INIT] Created rate limit record for ${agency.name}`);
      }

      // Initialize webhook record if it doesn't exist (optional - webhook can be registered later)
      const existingWebhook = await prisma.regulatoryWebhook.findUnique({
        where: { agency: agency.name },
      });

      if (!existingWebhook) {
        console.log(
          `[INIT] Webhook not configured for ${agency.name} (will be registered manually)`,
        );
      }
    }

    console.log("[INIT] Agency initialization complete");
  } catch (error) {
    console.error("[INIT] Error initializing agencies:", error.message);
    // Don't throw - let server continue even if init fails
  }
}

/**
 * Get next hour reset time
 */
function getNextHourReset() {
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  nextHour.setMinutes(0);
  nextHour.setSeconds(0);
  nextHour.setMilliseconds(0);
  return nextHour;
}

/**
 * Get next day reset time (midnight)
 */
function getNextDayReset() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(0);
  tomorrow.setMinutes(0);
  tomorrow.setSeconds(0);
  tomorrow.setMilliseconds(0);
  return tomorrow;
}

/**
 * Reset hourly counters if needed
 */
export async function resetHourlyCounters() {
  try {
    const now = new Date();
    const agencies = await prisma.agencyRateLimit.findMany({
      where: {
        hourlyResetAt: {
          lte: now,
        },
      },
    });

    for (const record of agencies) {
      await prisma.agencyRateLimit.update({
        where: { agency: record.agency },
        data: {
          currentHourCount: 0,
          hourlyResetAt: getNextHourReset(),
        },
      });
    }

    if (agencies.length > 0) {
      console.log(
        `[RATE_LIMIT] Reset hourly counters for ${agencies.length} agencies`,
      );
    }
  } catch (error) {
    console.error(
      "[RATE_LIMIT] Error resetting hourly counters:",
      error.message,
    );
  }
}

/**
 * Reset daily counters if needed
 */
export async function resetDailyCounters() {
  try {
    const now = new Date();
    const agencies = await prisma.agencyRateLimit.findMany({
      where: {
        dailyResetAt: {
          lte: now,
        },
      },
    });

    for (const record of agencies) {
      await prisma.agencyRateLimit.update({
        where: { agency: record.agency },
        data: {
          currentDayCount: 0,
          dailyResetAt: getNextDayReset(),
        },
      });
    }

    if (agencies.length > 0) {
      console.log(
        `[RATE_LIMIT] Reset daily counters for ${agencies.length} agencies`,
      );
    }
  } catch (error) {
    console.error(
      "[RATE_LIMIT] Error resetting daily counters:",
      error.message,
    );
  }
}
