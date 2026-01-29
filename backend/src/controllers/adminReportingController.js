import {
  getCategoryDistribution,
  getAgencyFlagReport,
  getAllAgenciesAnalytics,
  getCategoryDistributionHistory,
  getManufacturerCategoryBreakdown,
} from "../services/reportingService.js";
import {
  checkAgencyRateLimit,
  getAgencyRateLimitStatus,
  getAllAgenciesRateLimitStatus,
  updateAgencyRateLimit,
} from "../services/rateLimitService.js";
import { sendWebhookNotification } from "../services/webhookService.js";
import prisma from "../models/prismaClient.js";

/**
 * Get category distribution for dashboard
 */
export async function getCategoryDistributionDashboard(req, res) {
  try {
    const distribution = await getCategoryDistribution();
    res.json(distribution);
  } catch (error) {
    console.error("[ADMIN] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get category distribution history chart
 */
export async function getCategoryDistributionChart(req, res) {
  try {
    const { days = 30 } = req.query;
    const history = await getCategoryDistributionHistory(parseInt(days));
    res.json(history);
  } catch (error) {
    console.error("[ADMIN] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get manufacturer breakdown by category
 */
export async function getManufacturerBreakdown(req, res) {
  try {
    const breakdown = await getManufacturerCategoryBreakdown();
    res.json(breakdown);
  } catch (error) {
    console.error("[ADMIN] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get agency reporting dashboard
 */
export async function getAgencyReportingDashboard(req, res) {
  try {
    const { days = 30 } = req.query;
    const analytics = await getAllAgenciesAnalytics(parseInt(days));
    res.json(analytics);
  } catch (error) {
    console.error("[ADMIN] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get detailed report for specific agency
 */
export async function getAgencyDetailedReport(req, res) {
  try {
    const { agency } = req.params;
    const { days = 30 } = req.query;

    const report = await getAgencyFlagReport(agency, parseInt(days));
    res.json(report);
  } catch (error) {
    console.error("[ADMIN] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// ========== RATE LIMITING ENDPOINTS ==========

/**
 * Get rate limit status for all agencies
 */
export async function getRateLimitStatus(req, res) {
  try {
    const status = await getAllAgenciesRateLimitStatus();
    res.json(status);
  } catch (error) {
    console.error("[ADMIN] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get rate limit details for specific agency
 */
export async function getAgencyRateLimitDetails(req, res) {
  try {
    const { agency } = req.params;
    const status = await getAgencyRateLimitStatus(agency);
    res.json(status);
  } catch (error) {
    console.error("[ADMIN] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update rate limit configuration
 */
export async function updateRateLimitConfig(req, res) {
  try {
    const { agency } = req.params;
    const { alertsPerHour, alertsPerDay } = req.body;

    if (!alertsPerHour || !alertsPerDay) {
      return res.status(400).json({
        error: "alertsPerHour and alertsPerDay are required",
      });
    }

    const updated = await updateAgencyRateLimit(agency, {
      alertsPerHour,
      alertsPerDay,
    });

    res.json({
      success: true,
      message: `Rate limit updated for ${agency}`,
      config: updated,
    });
  } catch (error) {
    console.error("[ADMIN] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// ========== WEBHOOK ENDPOINTS ==========

/**
 * Get webhook configuration for agency
 */
export async function getWebhookConfig(req, res) {
  try {
    const { agency } = req.params;

    const webhook = await prisma.regulatoryWebhook.findUnique({
      where: { agency },
      select: {
        id: true,
        agency: true,
        isActive: true,
        retryAttempts: true,
        retryIntervalSeconds: true,
        timeoutSeconds: true,
        lastSuccessfulWebhook: true,
        lastFailedWebhook: true,
      },
    });

    if (!webhook) {
      return res.status(404).json({ error: `No webhook found for ${agency}` });
    }

    res.json(webhook);
  } catch (error) {
    console.error("[ADMIN] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Register or update webhook for agency
 */
export async function registerWebhookEndpoint(req, res) {
  try {
    const {
      agency,
      webhookUrl,
      customHeaders,
      retryAttempts,
      retryIntervalSeconds,
      timeoutSeconds,
    } = req.body;

    if (!agency || !webhookUrl) {
      return res.status(400).json({
        error: "agency and webhookUrl are required",
      });
    }

    // Validate URL
    try {
      new URL(webhookUrl);
    } catch {
      return res.status(400).json({ error: "Invalid webhookUrl format" });
    }

    const secret = require("crypto").randomBytes(32).toString("hex");

    const webhook = await prisma.regulatoryWebhook.upsert({
      where: { agency },
      create: {
        agency,
        webhookUrl,
        secret,
        headers: customHeaders ? JSON.stringify(customHeaders) : null,
        retryAttempts: retryAttempts || 3,
        retryIntervalSeconds: retryIntervalSeconds || 300,
        timeoutSeconds: timeoutSeconds || 30,
      },
      update: {
        webhookUrl,
        headers: customHeaders ? JSON.stringify(customHeaders) : null,
        retryAttempts: retryAttempts || undefined,
        retryIntervalSeconds: retryIntervalSeconds || undefined,
        timeoutSeconds: timeoutSeconds || undefined,
      },
    });

    res.json({
      success: true,
      message: `Webhook registered for ${agency}`,
      webhook: {
        id: webhook.id,
        agency: webhook.agency,
        webhookUrl: webhook.webhookUrl,
        secret: webhook.secret, // Only return once during registration
        retryAttempts: webhook.retryAttempts,
      },
    });
  } catch (error) {
    console.error("[ADMIN] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get webhook delivery logs
 */
export async function getWebhookLogs(req, res) {
  try {
    const { agency } = req.params;
    const { limit = 50, status } = req.query;

    const webhook = await prisma.regulatoryWebhook.findUnique({
      where: { agency },
    });

    if (!webhook) {
      return res.status(404).json({ error: `No webhook found for ${agency}` });
    }

    const logs = await prisma.webhookLog.findMany({
      where: {
        webhookId: webhook.id,
        ...(status ? { success: status === "success" } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
    });

    res.json(logs);
  } catch (error) {
    console.error("[ADMIN] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Toggle webhook active status
 */
export async function toggleWebhookStatus(req, res) {
  try {
    const { agency } = req.params;
    const { isActive } = req.body;

    const webhook = await prisma.regulatoryWebhook.update({
      where: { agency },
      data: { isActive },
    });

    res.json({
      success: true,
      message: `Webhook for ${agency} is now ${isActive ? "active" : "inactive"}`,
      webhook,
    });
  } catch (error) {
    console.error("[ADMIN] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}
