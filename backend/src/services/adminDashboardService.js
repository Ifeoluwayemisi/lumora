import prisma from "../models/prismaClient.js";

/**
 * Get global dashboard metrics
 */
export async function getGlobalMetrics() {
  console.log("[DASHBOARD] Fetching global metrics...");

  // Today's verifications (UTC)
  const today = new Date();
  const todayUTC = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  const todayVerifications = await prisma.verificationLog.count({
    where: {
      createdAt: { gte: todayUTC },
    },
  });
  console.log(
    "[DASHBOARD] Today verifications:",
    todayVerifications,
    "since",
    todayUTC,
  );

  // 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sevenDayVerifications = await prisma.verificationLog.count({
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
  });
  console.log("[DASHBOARD] 7-day verifications:", sevenDayVerifications);

  // All time
  const totalVerifications = await prisma.verificationLog.count();
  console.log(
    "[DASHBOARD] Total verifications (all time):",
    totalVerifications,
  );

  // Verification breakdown
  const verificationBreakdown = await prisma.verificationLog.groupBy({
    by: ["verificationState"],
    _count: {
      id: true,
    },
  });
  console.log("[DASHBOARD] Verification breakdown:", verificationBreakdown);

  // Manufacturer stats
  const [manufacturersPending, manufacturersApproved, manufacturersRejected] =
    await Promise.all([
      prisma.manufacturerReview.count({ where: { status: "pending" } }),
      prisma.manufacturerReview.count({ where: { status: "approved" } }),
      prisma.manufacturerReview.count({ where: { status: "rejected" } }),
    ]);

  // Case stats
  const [openCases, escalatedCases] = await Promise.all([
    prisma.caseFile.count({ where: { status: "open" } }),
    prisma.caseFile.count({ where: { status: "escalated" } }),
  ]);

  // Report stats
  const newReports = await prisma.userReport.count({
    where: { status: "NEW" },
  });

  // Calculate breakdown percentages
  let genuineCount = 0;
  let suspiciousCount = 0;
  let counterfeitCount = 0;

  verificationBreakdown.forEach((item) => {
    if (item.verificationState === "GENUINE") {
      genuineCount = item._count.id;
    } else if (item.verificationState === "SUSPICIOUS") {
      suspiciousCount = item._count.id;
    } else if (
      item.verificationState === "INVALID" ||
      item.verificationState === "COUNTERFEIT"
    ) {
      counterfeitCount += item._count.id;
    }
  });

  const suspiciousPercentage =
    totalVerifications > 0
      ? ((suspiciousCount / totalVerifications) * 100).toFixed(1)
      : 0;
  const counterfeitPercentage =
    totalVerifications > 0
      ? ((counterfeitCount / totalVerifications) * 100).toFixed(1)
      : 0;
  const genuinePercentage =
    totalVerifications > 0
      ? ((genuineCount / totalVerifications) * 100).toFixed(1)
      : 0;

  return {
    totalVerifications,
    todayVerifications,
    sevenDayVerifications,
    genuineCount,
    suspiciousCount,
    counterfeits: counterfeitCount,
    suspiciousPercentage: parseFloat(suspiciousPercentage),
    counterfeitPercentage: parseFloat(counterfeitPercentage),
    genuinePercentage: parseFloat(genuinePercentage),
    verificationBreakdown,
    manufacturers: {
      pending: manufacturersPending,
      approved: manufacturersApproved,
      rejected: manufacturersRejected,
      total:
        manufacturersPending + manufacturersApproved + manufacturersRejected,
    },
    cases: {
      open: openCases,
      escalated: escalatedCases,
      active: openCases + escalatedCases,
    },
    reports: {
      new: newReports,
    },
  };
}

/**
 * Get verification breakdown by status
 */
export async function getVerificationBreakdown() {
  return prisma.verificationLog.groupBy({
    by: ["verificationState"],
    _count: {
      id: true,
    },
  });
}

/**
 * Get authentic vs suspicious vs invalid
 */
export async function getAuthenticityBreakdown() {
  const verifications = await prisma.verificationLog.findMany({
    select: {
      verificationState: true,
    },
  });

  const breakdown = {
    genuine: 0,
    suspicious: 0,
    invalid: 0,
    unverified: 0,
  };

  verifications.forEach((v) => {
    if (v.verificationState === "GENUINE") breakdown.genuine++;
    else if (v.verificationState === "SUSPICIOUS_PATTERN")
      breakdown.suspicious++;
    else if (v.verificationState === "INVALID") breakdown.invalid++;
    else breakdown.unverified++;
  });

  const total = verifications.length;
  return {
    genuine: {
      count: breakdown.genuine,
      percentage:
        total > 0 ? ((breakdown.genuine / total) * 100).toFixed(2) : 0,
    },
    suspicious: {
      count: breakdown.suspicious,
      percentage:
        total > 0 ? ((breakdown.suspicious / total) * 100).toFixed(2) : 0,
    },
    invalid: {
      count: breakdown.invalid,
      percentage:
        total > 0 ? ((breakdown.invalid / total) * 100).toFixed(2) : 0,
    },
    unverified: {
      count: breakdown.unverified,
      percentage:
        total > 0 ? ((breakdown.unverified / total) * 100).toFixed(2) : 0,
    },
    total,
  };
}

/**
 * Get verification trend (last 30 days)
 */
export async function getVerificationTrend() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const verifications = await prisma.verificationLog.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      createdAt: true,
      verificationState: true,
    },
  });

  // Group by day
  const trendByDay = {};
  verifications.forEach((v) => {
    const day = v.createdAt.toISOString().split("T")[0];
    if (!trendByDay[day]) {
      trendByDay[day] = {
        date: day,
        genuine: 0,
        suspicious: 0,
        invalid: 0,
        total: 0,
      };
    }
    if (v.verificationState === "GENUINE") {
      trendByDay[day].genuine++;
    } else if (v.verificationState === "SUSPICIOUS_PATTERN") {
      trendByDay[day].suspicious++;
    } else if (v.verificationState === "INVALID") {
      trendByDay[day].invalid++;
    }
    trendByDay[day].total++;
  });

  return Object.values(trendByDay).sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
}

/**
 * Get hotspot clusters (locations with many suspicious verifications)
 */
export async function getHotspotClusters(minSuspicious = 5) {
  const verifications = await prisma.verificationLog.findMany({
    where: {
      verificationState: "SUSPICIOUS_PATTERN",
    },
    select: {
      location: true,
      latitude: true,
      longitude: true,
    },
  });

  // Group by location
  const hotspots = {};
  verifications.forEach((v) => {
    if (!hotspots[v.location]) {
      hotspots[v.location] = {
        location: v.location,
        latitude: v.latitude,
        longitude: v.longitude,
        count: 0,
      };
    }
    hotspots[v.location].count++;
  });

  // Filter by min count
  return Object.values(hotspots)
    .filter((h) => h.count >= minSuspicious)
    .sort((a, b) => b.count - a.count);
}

/**
 * Get high-risk brands/manufacturers
 */
export async function getHighRiskManufacturers(limit = 10) {
  return prisma.manufacturer.findMany({
    where: {
      riskLevel: { in: ["HIGH", "CRITICAL"] },
    },
    select: {
      id: true,
      name: true,
      riskLevel: true,
      trustScore: true,
      createdAt: true,
    },
    orderBy: { riskScore: "desc" },
    take: limit,
  });
}

/**
 * Get AI confidence/system health score
 */
export async function getAIHealthScore() {
  // Calculate based on verified results
  const genuineVerifications = await prisma.verificationLog.count({
    where: { verificationState: "GENUINE" },
  });

  const suspiciousVerifications = await prisma.verificationLog.count({
    where: { verificationState: "SUSPICIOUS_PATTERN" },
  });

  const totalVerifications = await prisma.verificationLog.count();

  // Simple health metric
  const healthScore =
    totalVerifications > 0
      ? ((genuineVerifications / totalVerifications) * 100).toFixed(2)
      : 0;

  return {
    healthScore: parseFloat(healthScore),
    totalVerifications,
    genuineCount: genuineVerifications,
    suspiciousCount: suspiciousVerifications,
    status:
      healthScore > 70
        ? "healthy"
        : healthScore > 50
          ? "moderate"
          : "concerning",
  };
}

/**
 * Get critical alerts
 */
export async function getCriticalAlerts() {
  const [criticalCases, unreadReports, highRiskManufacturers] =
    await Promise.all([
      prisma.caseFile.findMany({
        where: { severity: "critical", status: { not: "closed" } },
        select: {
          id: true,
          caseNumber: true,
          title: true,
          createdAt: true,
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.userReport.findMany({
        where: { status: "NEW", riskLevel: { in: ["HIGH", "CRITICAL"] } },
        select: {
          id: true,
          reason: true,
          location: true,
          reportedAt: true,
        },
        take: 5,
        orderBy: { reportedAt: "desc" },
      }),
      prisma.manufacturer.findMany({
        where: { riskLevel: "CRITICAL" },
        select: {
          id: true,
          name: true,
          riskLevel: true,
        },
        take: 5,
      }),
    ]);

  return {
    criticalCases: {
      count: criticalCases.length,
      items: criticalCases,
    },
    unreadReports: {
      count: unreadReports.length,
      items: unreadReports,
    },
    highRiskManufacturers: {
      count: highRiskManufacturers.length,
      items: highRiskManufacturers,
    },
  };
}

/**
 * Export dashboard data as JSON
 */
export async function exportDashboardData() {
  const [metrics, hotspots, healthScore, alerts] = await Promise.all([
    getGlobalMetrics(),
    getHotspotClusters(),
    getAIHealthScore(),
    getCriticalAlerts(),
  ]);

  return {
    exportDate: new Date().toISOString(),
    metrics,
    hotspots,
    healthScore,
    alerts,
  };
}
