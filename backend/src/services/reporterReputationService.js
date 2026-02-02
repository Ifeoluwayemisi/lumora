/**
 * Reporter Reputation Service
 * Tracks reporter reliability and accuracy
 */

import prisma from "../models/prismaClient.js";

/**
 * Calculate reporter reputation score
 * Based on: accuracy of reports, responsiveness, health alerts, etc.
 */
export async function calculateReporterReputation(reporterId) {
  if (!reporterId) return null;

  try {
    // Get all reports from this reporter
    const reports = await prisma.userReport.findMany({
      where: { reporterId },
      include: {
        caseFile: {
          select: {
            id: true,
            status: true,
            severity: true,
          },
        },
      },
    });

    if (reports.length === 0) {
      return {
        reporterId,
        totalReports: 0,
        confirmedCounterfeits: 0,
        accuracy: 0,
        trustScore: 0,
        level: "NEW",
      };
    }

    const totalReports = reports.length;
    const confirmedCounterfeits = reports.filter((r) => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL").length;
    const resolvedReports = reports.filter((r) => r.status === "RESOLVED").length;
    const accuracy = totalReports > 0 ? Math.round((confirmedCounterfeits / totalReports) * 100) : 0;

    // Calculate trust score (0-100)
    let trustScore = 50; // Base score

    // Accuracy bonus
    if (accuracy > 80) trustScore += 30;
    else if (accuracy > 60) trustScore += 20;
    else if (accuracy > 40) trustScore += 10;

    // Report count bonus
    if (totalReports >= 50) trustScore += 15;
    else if (totalReports >= 20) trustScore += 10;
    else if (totalReports >= 10) trustScore += 5;

    // Responsiveness bonus
    if (resolvedReports > totalReports * 0.7) trustScore += 10;

    // Cap at 100
    trustScore = Math.min(trustScore, 100);

    // Determine level
    let level = "NEW";
    if (totalReports >= 50 && trustScore >= 80) level = "TRUSTED";
    else if (totalReports >= 20 && trustScore >= 70) level = "VERIFIED";
    else if (totalReports >= 10) level = "ACTIVE";
    else if (totalReports >= 1) level = "CONTRIBUTOR";

    return {
      reporterId,
      totalReports,
      confirmedCounterfeits,
      accuracy,
      trustScore: Math.min(100, Math.max(0, trustScore)),
      level,
      lastReportDate: reports[reports.length - 1]?.reportedAt,
    };
  } catch (err) {
    console.error("[REPUTATION] Error calculating score:", err.message);
    return null;
  }
}

/**
 * Get or create reporter profile
 */
export async function getOrCreateReporterProfile(reporterId, email) {
  try {
    let profile = await prisma.reporterProfile?.findUnique({
      where: { reporterId },
    }).catch(() => null);

    if (!profile) {
      profile = await prisma.reporterProfile?.create({
        data: {
          reporterId,
          email: email || null,
          trustScore: 50,
          level: "NEW",
        },
      }).catch(() => null);
    }

    return profile;
  } catch (err) {
    console.error("[REPUTATION] Error getting reporter profile:", err.message);
    return null;
  }
}

/**
 * Update reporter reputation after investigation
 */
export async function updateReporterReputation(reporterId, reportAccuracy) {
  try {
    const reputation = await calculateReporterReputation(reporterId);
    if (!reputation) return null;

    // Update in database if ReporterProfile exists
    if (prisma.reporterProfile) {
      await prisma.reporterProfile.update({
        where: { reporterId },
        data: {
          trustScore: reputation.trustScore,
          level: reputation.level,
          lastAssessment: new Date(),
        },
      }).catch(() => null);
    }

    return reputation;
  } catch (err) {
    console.error("[REPUTATION] Error updating reputation:", err.message);
    return null;
  }
}

/**
 * Get top reporters (leaderboard)
 */
export async function getTopReporters(limit = 10) {
  try {
    const reports = await prisma.userReport.findMany({
      where: { reporterId: { not: null } },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Group by reporter and calculate stats
    const reporterStats = {};
    reports.forEach((report) => {
      const id = report.reporterId;
      if (!reporterStats[id]) {
        reporterStats[id] = {
          reporterId: id,
          reporterName: report.reporter?.name || "Unknown",
          totalReports: 0,
          confirmedCounterfeits: 0,
          lastReportDate: null,
        };
      }
      reporterStats[id].totalReports++;
      if (report.riskLevel === "HIGH" || report.riskLevel === "CRITICAL") {
        reporterStats[id].confirmedCounterfeits++;
      }
      if (!reporterStats[id].lastReportDate || new Date(report.reportedAt) > new Date(reporterStats[id].lastReportDate)) {
        reporterStats[id].lastReportDate = report.reportedAt;
      }
    });

    // Calculate accuracy and sort
    return Object.values(reporterStats)
      .map((stat) => ({
        ...stat,
        accuracy:
          stat.totalReports > 0
            ? Math.round((stat.confirmedCounterfeits / stat.totalReports) * 100)
            : 0,
      }))
      .sort((a, b) => b.accuracy - a.accuracy || b.totalReports - a.totalReports)
      .slice(0, limit);
  } catch (err) {
    console.error("[REPUTATION] Error getting top reporters:", err.message);
    return [];
  }
}

export default {
  calculateReporterReputation,
  getOrCreateReporterProfile,
  updateReporterReputation,
  getTopReporters,
};
