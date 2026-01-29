import prisma from "../models/prismaClient.js";
import crypto from "crypto";

// Logging utilities
function logInfo(tag, data = {}) {
  console.log(`${tag}`, data);
}

function logError(tag, error) {
  console.error(`${tag}`, error.message);
}

// ============================================
// CATEGORY DISTRIBUTION ENDPOINTS
// ============================================

/**
 * GET /admin/analytics/category-distribution
 * Get current manufacturer category distribution
 */
async function getCategoryDistribution(req, res) {
  try {
    logInfo("[ANALYTICS] Fetching category distribution", {
      timestamp: new Date().toISOString(),
    });

    const distribution = await prisma.manufacturer.groupBy({
      by: ["productCategory"],
      _count: {
        id: true,
      },
    });

    const result = {
      drugs: 0,
      food: 0,
      cosmetics: 0,
      other: 0,
      total: 0,
    };

    distribution.forEach((item) => {
      const category = item.productCategory || "other";
      result[category] = item._count.id;
      result.total += item._count.id;
    });

    logInfo("[ANALYTICS] Category distribution retrieved", result);
    res.json(result);
  } catch (error) {
    logError("[ANALYTICS] Error fetching category distribution", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /admin/analytics/category-history?days=30
 * Get historical category distribution
 */
async function getCategoryDistributionHistory(req, res) {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    logInfo("[ANALYTICS] Fetching category distribution history", {
      days,
      startDate: startDate.toISOString(),
    });

    const history = await prisma.categoryDistributionSnapshot.findMany({
      where: {
        snapshotDate: {
          gte: startDate,
        },
      },
      orderBy: {
        snapshotDate: "asc",
      },
    });

    res.json(history);
  } catch (error) {
    logError("[ANALYTICS] Error fetching category history", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /admin/analytics/manufacturers
 * Get manufacturers breakdown by category
 */
async function getManufacturersByCategory(req, res) {
  try {
    logInfo("[ANALYTICS] Fetching manufacturers by category");

    const manufacturers = await prisma.manufacturer.findMany({
      select: {
        id: true,
        name: true,
        productCategory: true,
        verified: true,
      },
      orderBy: {
        productCategory: "asc",
      },
    });

    const byCategory = {
      drugs: [],
      food: [],
      cosmetics: [],
      other: [],
    };

    let totalVerified = 0;
    let totalUnverified = 0;

    manufacturers.forEach((mfg) => {
      const category = mfg.productCategory || "other";
      byCategory[category].push({
        id: mfg.id,
        name: mfg.name,
        verified: mfg.verified,
      });
      if (mfg.verified) totalVerified++;
      else totalUnverified++;
    });

    res.json({
      byCategory,
      totalVerified,
      totalUnverified,
      total: manufacturers.length,
    });
  } catch (error) {
    logError("[ANALYTICS] Error fetching manufacturers", error);
    res.status(500).json({ error: error.message });
  }
}

// ============================================
// AGENCY REPORTING ENDPOINTS
// ============================================

/**
 * GET /admin/analytics/agencies?days=30
 * Get all agencies analytics
 */
async function getAllAgenciesAnalytics(req, res) {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    logInfo("[ANALYTICS] Fetching all agencies analytics", {
      days,
      startDate: startDate.toISOString(),
    });

    const allFlags = await prisma.flaggedCode.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        regulatoryAlert: {
          select: {
            agenciesNotified: true,
          },
        },
      },
    });

    const totalFlaggedCodes = allFlags.length;
    let totalCritical = 0,
      totalHigh = 0,
      totalMedium = 0,
      totalLow = 0;

    allFlags.forEach((flag) => {
      switch (flag.severity) {
        case "critical":
          totalCritical++;
          break;
        case "high":
          totalHigh++;
          break;
        case "medium":
          totalMedium++;
          break;
        default:
          totalLow++;
      }
    });

    res.json({
      totalFlaggedCodes,
      totalCritical,
      totalHigh,
      totalMedium,
      totalLow,
      days,
    });
  } catch (error) {
    logError("[ANALYTICS] Error fetching agencies analytics", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /admin/analytics/agencies/:agency?days=30
 * Get specific agency report
 */
async function getAgencyReport(req, res) {
  try {
    const { agency } = req.params;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    logInfo("[ANALYTICS] Fetching agency report", {
      agency,
      days,
      startDate: startDate.toISOString(),
    });

    const alerts = await prisma.regulatoryAlert.findMany({
      where: {
        agenciesNotified: {
          has: agency,
        },
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        flaggedCode: {
          include: {
            manufacturer: true,
          },
        },
      },
    });

    // Aggregate data
    const severityBreakdown = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const reasonBreakdown = {};
    const manufacturerCounts = {};
    let totalAlerts = 0;

    alerts.forEach((alert) => {
      totalAlerts++;
      const severity = alert.flaggedCode.severity || "low";
      severityBreakdown[severity]++;

      const reason = alert.reason || "Unknown";
      reasonBreakdown[reason] = (reasonBreakdown[reason] || 0) + 1;

      const mfgName = alert.flaggedCode.manufacturer?.name || "Unknown";
      if (!manufacturerCounts[mfgName]) {
        manufacturerCounts[mfgName] = {
          count: 0,
          category: alert.flaggedCode.manufacturer?.productCategory || "other",
        };
      }
      manufacturerCounts[mfgName].count++;
    });

    // Format data for charts
    const severityData = Object.entries(severityBreakdown)
      .map(([severity, count]) => ({ severity, count }))
      .filter((item) => item.count > 0);

    const reasonData = Object.entries(reasonBreakdown)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    const topManufacturers = Object.entries(manufacturerCounts)
      .map(([name, data]) => ({
        manufacturerName: name,
        count: data.count,
        category: data.category,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const avgDailyAlerts = totalAlerts / days;
    const uniqueManufacturers = Object.keys(manufacturerCounts).length;

    res.json({
      agency,
      totalFlagsForAgency: totalAlerts,
      severityBreakdown: severityData,
      reasonBreakdown: reasonData,
      topFlaggedManufacturers: topManufacturers,
      uniqueManufacturers,
      avgDailyAlerts,
      days,
    });
  } catch (error) {
    logError("[ANALYTICS] Error fetching agency report", error);
    res.status(500).json({ error: error.message });
  }
}

// ============================================
// RATE LIMITING MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /admin/management/rate-limits
 * Get all agencies rate limit status
 */
async function getAllRateLimits(req, res) {
  try {
    logInfo("[RATE_LIMIT] Fetching all rate limits");

    const agencies = ["NAFDAC", "FIRS", "NAFDAC-COSMETICS"];
    const result = {};

    for (const agency of agencies) {
      const rateLimitRecord = await prisma.agencyRateLimit.findUnique({
        where: { agency },
      });

      if (rateLimitRecord) {
        result[agency] = {
          alertsPerHour: rateLimitRecord.alertsPerHour,
          alertsPerDay: rateLimitRecord.alertsPerDay,
          currentHourCount: rateLimitRecord.currentHourCount,
          currentDayCount: rateLimitRecord.currentDayCount,
          isThrottled: rateLimitRecord.isThrottled,
        };
      }
    }

    res.json(result);
  } catch (error) {
    logError("[RATE_LIMIT] Error fetching all limits", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /admin/management/rate-limits/:agency
 * Get specific agency rate limit status
 */
async function getAgencyRateLimit(req, res) {
  try {
    const { agency } = req.params;
    logInfo("[RATE_LIMIT] Fetching agency rate limit", { agency });

    const rateLimitRecord = await prisma.agencyRateLimit.findUnique({
      where: { agency },
    });

    if (!rateLimitRecord) {
      return res.status(404).json({ error: "Rate limit not found" });
    }

    res.json({
      agency,
      alertsPerHour: rateLimitRecord.alertsPerHour,
      alertsPerDay: rateLimitRecord.alertsPerDay,
      currentHourCount: rateLimitRecord.currentHourCount,
      currentDayCount: rateLimitRecord.currentDayCount,
      isThrottled: rateLimitRecord.isThrottled,
      hourlyResetAt: rateLimitRecord.hourlyResetAt,
      dailyResetAt: rateLimitRecord.dailyResetAt,
    });
  } catch (error) {
    logError("[RATE_LIMIT] Error fetching agency rate limit", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * PUT /admin/management/rate-limits/:agency
 * Update agency rate limits
 */
async function updateAgencyRateLimit(req, res) {
  try {
    const { agency } = req.params;
    const { alertsPerHour, alertsPerDay } = req.body;

    logInfo("[RATE_LIMIT] Updating agency rate limit", {
      agency,
      alertsPerHour,
      alertsPerDay,
    });

    if (!alertsPerHour || !alertsPerDay) {
      return res
        .status(400)
        .json({ error: "alertsPerHour and alertsPerDay are required" });
    }

    const updated = await prisma.agencyRateLimit.update({
      where: { agency },
      data: {
        alertsPerHour: parseInt(alertsPerHour),
        alertsPerDay: parseInt(alertsPerDay),
      },
    });

    logInfo("[RATE_LIMIT] Agency rate limit updated", {
      agency,
      updated,
    });

    res.json({
      success: true,
      message: "Rate limits updated",
      data: updated,
    });
  } catch (error) {
    logError("[RATE_LIMIT] Error updating rate limit", error);
    res.status(500).json({ error: error.message });
  }
}

// ============================================
// WEBHOOK MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /admin/management/webhooks/:agency/config
 * Get webhook configuration for agency
 */
async function getWebhookConfig(req, res) {
  try {
    const { agency } = req.params;
    logInfo("[WEBHOOK] Fetching webhook config", { agency });

    const webhook = await prisma.regulatoryWebhook.findUnique({
      where: { agency },
    });

    if (!webhook) {
      return res.status(404).json({ webhookConfigured: false });
    }

    res.json({
      webhookConfigured: true,
      webhookUrl: webhook.webhookUrl,
      isActive: webhook.isActive,
      lastDeliveryAt: webhook.lastDeliveryAt,
      successRate: webhook.successRate || 0,
    });
  } catch (error) {
    logError("[WEBHOOK] Error fetching config", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /admin/management/webhooks/:agency/register
 * Register or update webhook for agency
 */
async function registerWebhook(req, res) {
  try {
    const { agency } = req.params;
    const { webhookUrl, customHeaders } = req.body;

    logInfo("[WEBHOOK] Registering webhook", { agency, webhookUrl });

    if (!webhookUrl) {
      return res.status(400).json({ error: "webhookUrl is required" });
    }

    const webhook = await prisma.regulatoryWebhook.upsert({
      where: { agency },
      update: {
        webhookUrl,
        customHeaders: customHeaders || {},
        isActive: true,
      },
      create: {
        agency,
        webhookUrl,
        customHeaders: customHeaders || {},
        isActive: true,
        secret: crypto.randomBytes(32).toString("hex"),
      },
    });

    logInfo("[WEBHOOK] Webhook registered", { agency });

    res.json({
      success: true,
      message: "Webhook registered successfully",
      webhookUrl: webhook.webhookUrl,
    });
  } catch (error) {
    logError("[WEBHOOK] Error registering webhook", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /admin/management/webhooks/:agency/logs?limit=50&status=success
 * Get webhook delivery logs
 */
async function getWebhookLogs(req, res) {
  try {
    const { agency } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status;

    logInfo("[WEBHOOK] Fetching webhook logs", { agency, limit, status });

    const where = {
      webhook: {
        agency,
      },
    };

    if (status) {
      where.status = status;
    }

    const logs = await prisma.webhookLog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        status: true,
        deliveredAt: true,
        createdAt: true,
        attemptNumber: true,
        responseStatus: true,
      },
    });

    res.json(logs);
  } catch (error) {
    logError("[WEBHOOK] Error fetching logs", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * PATCH /admin/management/webhooks/:agency/toggle
 * Toggle webhook active/inactive
 */
async function toggleWebhook(req, res) {
  try {
    const { agency } = req.params;

    logInfo("[WEBHOOK] Toggling webhook", { agency });

    const current = await prisma.regulatoryWebhook.findUnique({
      where: { agency },
    });

    if (!current) {
      return res.status(404).json({ error: "Webhook not found" });
    }

    const updated = await prisma.regulatoryWebhook.update({
      where: { agency },
      data: {
        isActive: !current.isActive,
      },
    });

    logInfo("[WEBHOOK] Webhook toggled", {
      agency,
      isActive: updated.isActive,
    });

    res.json({
      success: true,
      isActive: updated.isActive,
    });
  } catch (error) {
    logError("[WEBHOOK] Error toggling webhook", error);
    res.status(500).json({ error: error.message });
  }
}

export {
  getCategoryDistribution,
  getCategoryDistributionHistory,
  getManufacturersByCategory,
  getAllAgenciesAnalytics,
  getAgencyReport,
  getAllRateLimits,
  getAgencyRateLimit,
  updateAgencyRateLimit,
  getWebhookConfig,
  registerWebhook,
  getWebhookLogs,
  toggleWebhook,
};
