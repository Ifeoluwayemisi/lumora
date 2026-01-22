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
