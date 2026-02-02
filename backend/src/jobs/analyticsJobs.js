import prisma from "../models/prismaClient.js";

/**
 * Create daily category distribution snapshot
 */
export async function createCategoryDistributionSnapshot() {
  try {
    console.log("[ANALYTICS_JOB] Creating category distribution snapshot...");

    // Get current distribution
    const distribution = await prisma.manufacturer.groupBy({
      by: ["productCategory"],
      _count: {
        id: true,
      },
    });

    const snapshot = {
      drugs: 0,
      food: 0,
      cosmetics: 0,
      other: 0,
      totalCount: 0,
    };

    distribution.forEach((item) => {
      const category = item.productCategory || "other";
      snapshot[category] = item._count.id;
      snapshot.totalCount += item._count.id;
    });

    // Check if snapshot already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSnapshot =
      await prisma.categoryDistributionSnapshot.findUnique({
        where: { snapshotDate: today },
      });

    if (existingSnapshot) {
      // Update existing snapshot
      await prisma.categoryDistributionSnapshot.update({
        where: { snapshotDate: today },
        data: snapshot,
      });
      console.log("[ANALYTICS_JOB] Updated category distribution snapshot");
    } else {
      // Create new snapshot
      await prisma.categoryDistributionSnapshot.create({
        data: {
          snapshotDate: today,
          ...snapshot,
        },
      });
      console.log("[ANALYTICS_JOB] Created new category distribution snapshot");
    }

    return snapshot;
  } catch (error) {
    console.error("[ANALYTICS_JOB] Error creating snapshot:", error.message);
  }
}

/**
 * Create daily agency flag analytics
 */
export async function createAgencyFlagAnalytics() {
  try {
    console.log("[ANALYTICS_JOB] Creating agency flag analytics...");

    const agencies = ["NAFDAC", "FIRS", "NAFDAC-COSMETICS"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const agency of agencies) {
      // Get flags for this agency from today
      const alerts = await prisma.regulatoryAlert.findMany({
        where: {
          agenciesNotified: {
            has: agency,
          },
          createdAt: {
            gte: today,
          },
        },
        include: {
          flaggedCode: true,
        },
      });

      // Aggregate by severity
      const severityBreakdown = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };

      const reasonBreakdown = {};

      alerts.forEach((alert) => {
        const severity = alert.flaggedCode.severity || "low";
        severityBreakdown[severity]++;

        const reason = alert.reason || "Unknown";
        reasonBreakdown[reason] = (reasonBreakdown[reason] || 0) + 1;
      });

      // Check if record exists for today
      const existingAnalytics = await prisma.agencyFlagAnalytics.findFirst({
        where: {
          agency,
          date: today,
        },
      });

      if (existingAnalytics) {
        // Update
        await prisma.agencyFlagAnalytics.update({
          where: { id: existingAnalytics.id },
          data: {
            totalFlaggedCodes: alerts.length,
            severityBreakdown,
            reasonBreakdown,
          },
        });
      } else {
        // Create
        await prisma.agencyFlagAnalytics.create({
          data: {
            agency,
            date: today,
            totalFlaggedCodes: alerts.length,
            severityBreakdown,
            reasonBreakdown,
          },
        });
      }
    }

    console.log("[ANALYTICS_JOB] Agency flag analytics created");
  } catch (error) {
    console.error(
      "[ANALYTICS_JOB] Error creating agency analytics:",
      error.message,
    );
  }
}

/**
 * Run all analytics jobs
 */
export async function runAnalyticsJobs() {
  try {
    console.log("[ANALYTICS_JOB] Starting daily analytics jobs...");
    await createCategoryDistributionSnapshot();
    await createAgencyFlagAnalytics();
    console.log("[ANALYTICS_JOB] Daily analytics jobs complete");
  } catch (error) {
    console.error("[ANALYTICS_JOB] Error running jobs:", error.message);
  }
}
