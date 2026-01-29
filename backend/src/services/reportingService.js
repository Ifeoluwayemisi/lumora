import prisma from "../models/prismaClient.js";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

/**
 * Generate analytics report
 */
export async function generateAnalyticsReport(
  manufacturerId,
  title,
  period,
  startDate,
  endDate,
  metrics = [],
) {
  const analyticsData = await calculateAnalyticsMetrics(
    manufacturerId,
    startDate,
    endDate,
  );

  const report = await prisma.analyticsReport.create({
    data: {
      manufacturerId,
      title,
      period,
      startDate,
      endDate,
      metrics: analyticsData,
      authenticity: analyticsData.authenticityRate,
      geoDistribution: analyticsData.geoDistribution,
      expiredBatches: analyticsData.expiredBatches,
      suspiciousActivity: analyticsData.suspiciousCount,
    },
  });

  return report;
}

/**
 * Calculate comprehensive analytics metrics
 */
export async function calculateAnalyticsMetrics(
  manufacturerId,
  startDate,
  endDate,
) {
  const verifications = await prisma.verificationLog.findMany({
    where: {
      manufacturerId,
      createdAt: { gte: startDate, lte: endDate },
    },
    include: { batch: true },
  });

  // Code authenticity rate
  const genuine = verifications.filter(
    (v) => v.verificationState === "GENUINE",
  ).length;
  const suspicious = verifications.filter(
    (v) => v.verificationState === "SUSPICIOUS_PATTERN",
  ).length;
  const invalid = verifications.filter(
    (v) => v.verificationState === "INVALID",
  ).length;
  const used = verifications.filter(
    (v) => v.verificationState === "CODE_ALREADY_USED",
  ).length;

  const totalVerifications = verifications.length;
  const authenticityRate =
    totalVerifications > 0 ? (genuine / totalVerifications) * 100 : 0;

  // Geographic distribution
  const geoDistribution = {};
  verifications.forEach((v) => {
    if (v.location) {
      geoDistribution[v.location] = (geoDistribution[v.location] || 0) + 1;
    }
  });

  // Expired batches
  const expiredBatches = await prisma.batch.count({
    where: {
      manufacturerId,
      expirationDate: { lt: new Date() },
    },
  });

  // Verify batch count
  const totalBatches = await prisma.batch.count({
    where: { manufacturerId },
  });

  // Code counts
  const totalCodes = await prisma.code.count({
    where: { manufacturerId },
  });

  const usedCodes = await prisma.code.count({
    where: {
      manufacturerId,
      isUsed: true,
    },
  });

  // Risk analysis
  const highRiskVerifications = verifications.filter(
    (v) => (v.riskScore || 0) > 70,
  ).length;
  const mediumRiskVerifications = verifications.filter(
    (v) => (v.riskScore || 0) >= 40 && (v.riskScore || 0) <= 70,
  ).length;

  return {
    period: {
      startDate,
      endDate,
    },
    verifications: {
      total: totalVerifications,
      genuine,
      suspicious,
      invalid,
      alreadyUsed: used,
      authenticityRate: Math.round(authenticityRate * 100) / 100,
    },
    batches: {
      total: totalBatches,
      expired: expiredBatches,
      active: totalBatches - expiredBatches,
    },
    codes: {
      total: totalCodes,
      used: usedCodes,
      unused: totalCodes - usedCodes,
      utilizationRate:
        totalCodes > 0 ? Math.round((usedCodes / totalCodes) * 100) : 0,
    },
    riskAnalysis: {
      highRisk: highRiskVerifications,
      mediumRisk: mediumRiskVerifications,
      lowRisk:
        totalVerifications - highRiskVerifications - mediumRiskVerifications,
    },
    geoDistribution,
    averageVerificationsPerDay:
      Math.round(totalVerifications / getDaysDifference(startDate, endDate)) ||
      0,
  };
}

/**
 * Create scheduled report
 */
export async function createReportSchedule(manufacturerId, config) {
  return prisma.reportSchedule.create({
    data: {
      manufacturerId,
      name: config.name,
      frequency: config.frequency, // daily, weekly, monthly
      format: config.format, // pdf, csv, json
      recipients: config.recipients, // array of emails
      metrics: config.metrics, // selected metrics
      dayOfWeek: config.dayOfWeek, // 0-6
      dayOfMonth: config.dayOfMonth, // 1-31
      hour: config.hour || 9,
      isActive: true,
    },
  });
}

/**
 * Get report schedules for manufacturer
 */
export async function getReportSchedules(manufacturerId) {
  return prisma.reportSchedule.findMany({
    where: { manufacturerId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Update report schedule
 */
export async function updateReportSchedule(scheduleId, manufacturerId, config) {
  const schedule = await prisma.reportSchedule.findFirst({
    where: { id: scheduleId, manufacturerId },
  });

  if (!schedule) {
    throw new Error("Report schedule not found");
  }

  return prisma.reportSchedule.update({
    where: { id: scheduleId },
    data: config,
  });
}

/**
 * Delete report schedule
 */
export async function deleteReportSchedule(scheduleId, manufacturerId) {
  const schedule = await prisma.reportSchedule.findFirst({
    where: { id: scheduleId, manufacturerId },
  });

  if (!schedule) {
    throw new Error("Report schedule not found");
  }

  return prisma.reportSchedule.delete({
    where: { id: scheduleId },
  });
}

/**
 * Export report to CSV
 */
export async function exportReportToCSV(reportId, manufacturerId) {
  const report = await prisma.analyticsReport.findFirst({
    where: { id: reportId, manufacturerId },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  const metrics = report.metrics;
  const rows = [];

  // Add report header
  rows.push(`Analytics Report: ${report.title}`);
  rows.push(
    `Period: ${report.startDate.toISOString()} to ${report.endDate.toISOString()}`,
  );
  rows.push("");

  // Verification metrics
  rows.push("Verification Metrics");
  rows.push(`Total Verifications,${metrics.verifications.total}`);
  rows.push(`Genuine,${metrics.verifications.genuine}`);
  rows.push(`Suspicious,${metrics.verifications.suspicious}`);
  rows.push(`Invalid,${metrics.verifications.invalid}`);
  rows.push(`Authenticity Rate (%),${metrics.verifications.authenticityRate}`);
  rows.push("");

  // Batch metrics
  rows.push("Batch Metrics");
  rows.push(`Total Batches,${metrics.batches.total}`);
  rows.push(`Expired,${metrics.batches.expired}`);
  rows.push(`Active,${metrics.batches.active}`);
  rows.push("");

  // Code metrics
  rows.push("Code Metrics");
  rows.push(`Total Codes,${metrics.codes.total}`);
  rows.push(`Used Codes,${metrics.codes.used}`);
  rows.push(`Utilization Rate (%),${metrics.codes.utilizationRate}`);
  rows.push("");

  // Risk analysis
  rows.push("Risk Analysis");
  rows.push(`High Risk,${metrics.riskAnalysis.highRisk}`);
  rows.push(`Medium Risk,${metrics.riskAnalysis.mediumRisk}`);
  rows.push(`Low Risk,${metrics.riskAnalysis.lowRisk}`);

  const csv = rows.join("\n");
  return {
    filename: `report_${reportId}.csv`,
    data: csv,
    mimeType: "text/csv",
  };
}

/**
 * Export report to JSON
 */
export async function exportReportToJSON(reportId, manufacturerId) {
  const report = await prisma.analyticsReport.findFirst({
    where: { id: reportId, manufacturerId },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  return {
    filename: `report_${reportId}.json`,
    data: JSON.stringify(report, null, 2),
    mimeType: "application/json",
  };
}

/**
 * Get recent reports
 */
export async function getManufacturerReports(manufacturerId, limit = 10) {
  return prisma.analyticsReport.findMany({
    where: { manufacturerId },
    orderBy: { generatedAt: "desc" },
    take: limit,
  });
}

/**
 * Helper to get days between dates
 */
function getDaysDifference(startDate, endDate) {
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

// ========== ADMIN REPORTING ==========

/**
 * Get category distribution snapshot
 */
export async function getCategoryDistribution() {
  try {
    const categories = await prisma.manufacturer.groupBy({
      by: ["productCategory"],
      _count: true,
    });

    const distribution = {
      drugs: 0,
      food: 0,
      cosmetics: 0,
      other: 0,
      total: 0,
    };

    categories.forEach((cat) => {
      const category = cat.productCategory || "other";
      distribution[category] = cat._count;
      distribution.total += cat._count;
    });

    return distribution;
  } catch (error) {
    console.error(
      "[REPORTING] Error getting category distribution:",
      error.message,
    );
    throw error;
  }
}

/**
 * Update category distribution snapshot (call daily)
 */
export async function updateCategoryDistributionSnapshot() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const distribution = await getCategoryDistribution();

    await prisma.categoryDistributionSnapshot.upsert({
      where: { snapshotDate: today },
      create: {
        snapshotDate: today,
        drugs: distribution.drugs,
        food: distribution.food,
        cosmetics: distribution.cosmetics,
        other: distribution.other,
        totalCount: distribution.total,
      },
      update: {
        drugs: distribution.drugs,
        food: distribution.food,
        cosmetics: distribution.cosmetics,
        other: distribution.other,
        totalCount: distribution.total,
      },
    });

    console.log("[REPORTING] Updated category distribution snapshot");
    return distribution;
  } catch (error) {
    console.error("[REPORTING] Error updating snapshot:", error.message);
    throw error;
  }
}

/**
 * Get agency-specific flagged codes report
 */
export async function getAgencyFlagReport(agency, dateRange = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    // Get all codes flagged in this period that should go to this agency
    const flaggedCodes = await prisma.code.findMany({
      where: {
        isFlagged: true,
        flaggedAt: { gte: startDate },
        manufacturer: {
          productCategory: getAgencyCategoryMapping(agency),
        },
      },
      include: {
        manufacturer: {
          select: { name: true, id: true },
        },
      },
    });

    const bySeverity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const byReason = {};
    const manufacturerCounts = {};

    flaggedCodes.forEach((code) => {
      // Count by severity
      if (code.flagSeverity) {
        bySeverity[code.flagSeverity]++;
      }

      // Count by reason
      byReason[code.flagReason] = (byReason[code.flagReason] || 0) + 1;

      // Count by manufacturer
      const mfgName = code.manufacturer?.name || "Unknown";
      manufacturerCounts[mfgName] = (manufacturerCounts[mfgName] || 0) + 1;
    });

    return {
      agency,
      period: `Last ${dateRange} days`,
      totalFlaggedCodes: flaggedCodes.length,
      bySeverity,
      byReason,
      topManufacturers: Object.entries(manufacturerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
    };
  } catch (error) {
    console.error("[REPORTING] Error getting agency report:", error.message);
    throw error;
  }
}

/**
 * Update agency flag analytics (call daily)
 */
export async function updateAgencyFlagAnalytics(agency) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count flagged codes for this agency yesterday
    const flaggedCodes = await prisma.code.findMany({
      where: {
        isFlagged: true,
        flaggedAt: {
          gte: yesterday,
          lt: today,
        },
        manufacturer: {
          productCategory: getAgencyCategoryMapping(agency),
        },
      },
    });

    const analytics = {
      totalFlaggedCodes: flaggedCodes.length,
      criticalSeverity: flaggedCodes.filter(
        (c) => c.flagSeverity === "critical",
      ).length,
      highSeverity: flaggedCodes.filter((c) => c.flagSeverity === "high")
        .length,
      mediumSeverity: flaggedCodes.filter((c) => c.flagSeverity === "medium")
        .length,
      lowSeverity: flaggedCodes.filter((c) => c.flagSeverity === "low").length,
      uniqueManufacturers: new Set(flaggedCodes.map((c) => c.manufacturerId))
        .size,
    };

    await prisma.agencyFlagAnalytics.upsert({
      where: {
        agency_date: {
          agency,
          date: yesterday,
        },
      },
      create: {
        agency,
        date: yesterday,
        ...analytics,
      },
      update: analytics,
    });

    console.log(`[REPORTING] Updated analytics for ${agency}`);
    return analytics;
  } catch (error) {
    console.error("[REPORTING] Error updating analytics:", error.message);
    throw error;
  }
}

/**
 * Get all agencies analytics for admin dashboard
 */
export async function getAllAgenciesAnalytics(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const analytics = await prisma.agencyFlagAnalytics.findMany({
      where: {
        date: { gte: startDate },
      },
      orderBy: [{ agency: "asc" }, { date: "desc" }],
    });

    // Aggregate by agency
    const byAgency = {};

    analytics.forEach((record) => {
      if (!byAgency[record.agency]) {
        byAgency[record.agency] = {
          agency: record.agency,
          totalFlagged: 0,
          criticalSeverity: 0,
          highSeverity: 0,
          mediumSeverity: 0,
          lowSeverity: 0,
          averageDaily: 0,
          dailyRecords: [],
        };
      }

      const agency = byAgency[record.agency];
      agency.totalFlagged += record.totalFlaggedCodes;
      agency.criticalSeverity += record.criticalSeverity;
      agency.highSeverity += record.highSeverity;
      agency.mediumSeverity += record.mediumSeverity;
      agency.lowSeverity += record.lowSeverity;
      agency.dailyRecords.push(record);
    });

    // Calculate averages
    Object.values(byAgency).forEach((agency) => {
      const recordCount = agency.dailyRecords.length;
      agency.averageDaily = (agency.totalFlagged / recordCount).toFixed(2);
      delete agency.dailyRecords; // Remove for response
    });

    return byAgency;
  } catch (error) {
    console.error(
      "[REPORTING] Error getting all agencies analytics:",
      error.message,
    );
    throw error;
  }
}

/**
 * Get category distribution history
 */
export async function getCategoryDistributionHistory(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const snapshots = await prisma.categoryDistributionSnapshot.findMany({
      where: {
        snapshotDate: { gte: startDate },
      },
      orderBy: { snapshotDate: "asc" },
    });

    return snapshots;
  } catch (error) {
    console.error(
      "[REPORTING] Error getting distribution history:",
      error.message,
    );
    throw error;
  }
}

/**
 * Helper: Map agency name to product categories they handle
 */
function getAgencyCategoryMapping(agency) {
  const mapping = {
    NAFDAC: "drugs",
    "NAFDAC Cosmetics": "cosmetics",
    "FIRS Food Safety": "food",
  };
  return mapping[agency] || "other";
}

/**
 * Get manufacturer category breakdown for admin dashboard
 */
export async function getManufacturerCategoryBreakdown() {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      select: {
        id: true,
        name: true,
        productCategory: true,
        verified: true,
        accountStatus: true,
      },
    });

    const breakdown = {
      byCategory: {
        drugs: [],
        food: [],
        cosmetics: [],
        other: [],
      },
      totalVerified: 0,
      totalUnverified: 0,
    };

    manufacturers.forEach((mfg) => {
      const category = mfg.productCategory || "other";
      breakdown.byCategory[category].push({
        id: mfg.id,
        name: mfg.name,
        verified: mfg.verified,
        status: mfg.accountStatus,
      });

      if (mfg.verified) {
        breakdown.totalVerified++;
      } else {
        breakdown.totalUnverified++;
      }
    });

    return breakdown;
  } catch (error) {
    console.error(
      "[REPORTING] Error getting category breakdown:",
      error.message,
    );
    throw error;
  }
}
