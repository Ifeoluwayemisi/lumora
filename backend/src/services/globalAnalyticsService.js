/**
 * Global Analytics Service
 * Provides system-wide analytics for admin dashboards
 */

import prisma from "../models/prismaClient.js";

/**
 * Get overall analytics dashboard data
 */
export async function getAnalyticsDashboard() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total reports in last 30 days
    const totalReports = await prisma.userReport.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Counterfeit rate
    const counterfeitReports = await prisma.userReport.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        riskLevel: { in: ["HIGH", "CRITICAL"] },
      },
    });

    const counterfeitRate =
      totalReports > 0
        ? Math.round((counterfeitReports / totalReports) * 100)
        : 0;

    // Top risk categories (based on reports)
    const topCategories = await prisma.userReport.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { productName: true, riskLevel: true },
      take: 100,
    });

    const categoryMap = {};
    topCategories.forEach((report) => {
      const category = report.productName || "Unknown";
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          count: 0,
          riskScore: 0,
        };
      }
      categoryMap[category].count++;
      if (report.riskLevel === "CRITICAL") {
        categoryMap[category].riskScore += 10;
      } else if (report.riskLevel === "HIGH") {
        categoryMap[category].riskScore += 5;
      }
    });

    const topRiskCategories = Object.values(categoryMap)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);

    // Total verifications
    const totalVerifications = await prisma.verificationLog.count();

    // Reporter count
    const totalReporters = await prisma.user.count({
      where: { role: "CONSUMER" },
    });

    // Manufacturers
    const totalManufacturers = await prisma.manufacturer.count();

    return {
      success: true,
      totalReports,
      counterfeitRate,
      topRiskCategories,
      totalVerifications,
      totalReporters,
      totalManufacturers,
      period: "30 days",
    };
  } catch (err) {
    console.error("[GLOBAL_ANALYTICS_DASHBOARD] Error:", err);
    throw err;
  }
}

/**
 * Get counterfeit hotspots by location
 */
export async function getCounterfeitHotspots(limit = 10) {
  try {
    const hotspots = await prisma.userReport.findMany({
      where: {
        location: { not: null },
        riskLevel: { in: ["HIGH", "CRITICAL"] },
      },
      select: {
        location: true,
        riskLevel: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit * 3,
    });

    const locationMap = {};
    hotspots.forEach((report) => {
      const location = report.location || "Unknown";
      if (!locationMap[location]) {
        locationMap[location] = {
          location,
          count: 0,
          riskScore: 0,
        };
      }
      locationMap[location].count++;
      locationMap[location].riskScore +=
        report.riskLevel === "CRITICAL" ? 10 : 5;
    });

    return Object.values(locationMap)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit);
  } catch (err) {
    console.error("[COUNTERFEIT_HOTSPOTS] Error:", err);
    throw err;
  }
}

/**
 * Get counterfeit rate by product
 */
export async function getCounterfeitRateByProduct(limit = 15) {
  try {
    const reports = await prisma.userReport.findMany({
      select: {
        productName: true,
        riskLevel: true,
      },
      take: limit * 3,
    });

    const productMap = {};
    reports.forEach((report) => {
      const product = report.productName || "Unknown";
      if (!productMap[product]) {
        productMap[product] = {
          name: product,
          total: 0,
          counterfeit: 0,
        };
      }
      productMap[product].total++;
      if (report.riskLevel === "HIGH" || report.riskLevel === "CRITICAL") {
        productMap[product].counterfeit++;
      }
    });

    return Object.values(productMap)
      .map((p) => ({
        ...p,
        rate: p.total > 0 ? Math.round((p.counterfeit / p.total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, limit);
  } catch (err) {
    console.error("[COUNTERFEIT_RATE_BY_PRODUCT] Error:", err);
    throw err;
  }
}

/**
 * Get counterfeit rate by manufacturer
 */
export async function getCounterfeitRateByManufacturer(limit = 15) {
  try {
    // Get all manufacturers with their code verification stats
    const manufacturers = await prisma.manufacturer.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            batches: true,
          },
        },
      },
      take: limit,
    });

    const results = await Promise.all(
      manufacturers.map(async (mfg) => {
        // Count verifications for this manufacturer
        const verifications = await prisma.verificationLog.count({
          where: { manufacturerId: mfg.id },
        });

        // Count suspicious/invalid verifications
        const counterfeitVerifications = await prisma.verificationLog.count({
          where: {
            manufacturerId: mfg.id,
            verificationState: {
              in: ["SUSPICIOUS", "INVALID", "CODE_ALREADY_USED"],
            },
          },
        });

        const rate =
          verifications > 0
            ? Math.round((counterfeitVerifications / verifications) * 100)
            : 0;

        return {
          name: mfg.name,
          totalVerifications: verifications,
          counterfeitCount: counterfeitVerifications,
          rate,
          batches: mfg._count.batches,
        };
      }),
    );

    return results.sort((a, b) => b.rate - a.rate);
  } catch (err) {
    console.error("[COUNTERFEIT_RATE_BY_MANUFACTURER] Error:", err);
    throw err;
  }
}

/**
 * Get report trends over time
 */
export async function getReportTrends(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reports = await prisma.userReport.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        riskLevel: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by day
    const dailyData = {};
    reports.forEach((report) => {
      const dateKey = new Date(report.createdAt).toISOString().split("T")[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          total: 0,
          high: 0,
          critical: 0,
        };
      }
      dailyData[dateKey].total++;
      if (report.riskLevel === "CRITICAL") {
        dailyData[dateKey].critical++;
      } else if (report.riskLevel === "HIGH") {
        dailyData[dateKey].high++;
      }
    });

    return Object.values(dailyData).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
  } catch (err) {
    console.error("[REPORT_TRENDS] Error:", err);
    throw err;
  }
}

/**
 * Get risk level distribution
 */
export async function getRiskDistribution() {
  try {
    const distribution = await prisma.userReport.groupBy({
      by: ["riskLevel"],
      _count: { id: true },
    });

    return distribution.map((item) => ({
      level: item.riskLevel || "UNKNOWN",
      count: item._count.id,
    }));
  } catch (err) {
    console.error("[RISK_DISTRIBUTION] Error:", err);
    throw err;
  }
}

/**
 * Get status distribution
 */
export async function getStatusDistribution() {
  try {
    const distribution = await prisma.userReport.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    return distribution.map((item) => ({
      status: item.status || "UNKNOWN",
      count: item._count.id,
    }));
  } catch (err) {
    console.error("[STATUS_DISTRIBUTION] Error:", err);
    throw err;
  }
}
