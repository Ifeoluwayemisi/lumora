import prisma from "../models/prismaClient.js";
import {
  getManufacturerAnalytics,
  getHotspotPredictions,
  getExportData,
  getTopVerifications,
  getProductsWithRisk,
  getManufacturerTrustMetrics,
  getAuthenticityTrend,
  getAlertSummary,
} from "../services/analyticsService.js";
import {
  getRevenueData,
  getVerificationData,
  getProductData,
  getHotspotData,
  exportAsCSV,
} from "../services/analyticsExportService.js";
import { Parser } from "json2csv";

// Helper function to get manufacturerId from userId
async function getManufacturerIdFromUser(userId) {
  if (!userId) return null;
  const manufacturer = await prisma.manufacturer.findUnique({
    where: { userId },
    select: { id: true },
  });
  return manufacturer?.id;
}

/**
 * Get comprehensive analytics for manufacturer
 */
export async function getAnalytics(req, res) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    const userId = req.user?.id;

    console.log(
      `[ANALYTICS-${requestId}] Request started for userId: ${userId}`,
    );

    if (!userId) {
      console.warn(`[ANALYTICS-${requestId}] Unauthorized: No user ID`);
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Look up manufacturer from user
    console.log(`[ANALYTICS-${requestId}] Looking up manufacturer...`);
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      console.warn(
        `[ANALYTICS-${requestId}] Manufacturer not found for userId: ${userId}`,
      );
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;
    console.log(
      `[ANALYTICS-${requestId}] Found manufacturerId: ${manufacturerId}`,
    );

    console.log(`[ANALYTICS-${requestId}] Fetching analytics...`);
    const analytics = await getManufacturerAnalytics(manufacturerId);

    const duration = Date.now() - startTime;
    console.log(
      `[ANALYTICS-${requestId}] Analytics fetched successfully in ${duration}ms`,
    );
    console.log(`[ANALYTICS-${requestId}] Data structure:`, {
      hasVerificationTrends: !!analytics.verificationTrends,
      hasVerificationByStatus: !!analytics.verificationByStatus,
      hasLocationData: !!analytics.locationData,
      hasCodeMetrics: !!analytics.codeMetrics,
      hasSuspiciousTrends: !!analytics.suspiciousTrends,
      hasManufacturer: !!analytics.manufacturer,
    });

    res.status(200).json({
      data: analytics,
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[ANALYTICS-${requestId}] Error after ${duration}ms:`, {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
      fullError: err,
      manufacturerId: req.user?.id,
    });
    res.status(500).json({
      error: "Failed to fetch analytics",
      message:
        process.env.NODE_ENV === "development" ? err?.message : undefined,
      requestId,
    });
  }
}

/**
 * Get top verification products for dashboard
 */
export async function getTopVerificationsController(req, res) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    const userId = req.user?.id;
    const { limit = 10 } = req.query;

    console.log(
      `[TOP_VERIFICATIONS-${requestId}] Request started for userId: ${userId}`,
    );

    if (!userId) {
      console.warn(`[TOP_VERIFICATIONS-${requestId}] Unauthorized: No user ID`);
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Look up manufacturer from user
    console.log(`[TOP_VERIFICATIONS-${requestId}] Looking up manufacturer...`);
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      console.warn(
        `[TOP_VERIFICATIONS-${requestId}] Manufacturer not found for userId: ${userId}`,
      );
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;
    console.log(
      `[TOP_VERIFICATIONS-${requestId}] Found manufacturerId: ${manufacturerId}`,
    );

    console.log(
      `[TOP_VERIFICATIONS-${requestId}] Fetching top verifications with limit: ${limit}`,
    );
    const topVerifications = await getTopVerifications(
      manufacturerId,
      parseInt(limit),
    );

    const duration = Date.now() - startTime;
    console.log(
      `[TOP_VERIFICATIONS-${requestId}] Data fetched successfully in ${duration}ms`,
    );

    res.status(200).json({
      data: topVerifications,
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(
      `[TOP_VERIFICATIONS-${requestId}] Error after ${duration}ms:`,
      {
        message: err?.message,
        code: err?.code,
        stack: err?.stack,
      },
    );
    res.status(500).json({
      error: "Failed to fetch top verifications",
      message:
        process.env.NODE_ENV === "development" ? err?.message : undefined,
      requestId,
    });
  }
}

/**
 * Get products with risk metrics for dashboard
 */
export async function getProductsWithRiskController(req, res) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    const userId = req.user?.id;
    const { limit = 20 } = req.query;

    console.log(
      `[PRODUCTS_RISK-${requestId}] Request started for userId: ${userId}`,
    );

    if (!userId) {
      console.warn(`[PRODUCTS_RISK-${requestId}] Unauthorized: No user ID`);
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Look up manufacturer from user
    console.log(`[PRODUCTS_RISK-${requestId}] Looking up manufacturer...`);
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      console.warn(
        `[PRODUCTS_RISK-${requestId}] Manufacturer not found for userId: ${userId}`,
      );
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;
    console.log(
      `[PRODUCTS_RISK-${requestId}] Found manufacturerId: ${manufacturerId}`,
    );

    console.log(
      `[PRODUCTS_RISK-${requestId}] Fetching products with risk metrics (limit: ${limit})`,
    );
    const products = await getProductsWithRisk(manufacturerId, parseInt(limit));

    const duration = Date.now() - startTime;
    console.log(
      `[PRODUCTS_RISK-${requestId}] Data fetched successfully in ${duration}ms`,
    );

    res.status(200).json({
      data: products,
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[PRODUCTS_RISK-${requestId}] Error after ${duration}ms:`, {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });
    res.status(500).json({
      error: "Failed to fetch product risk metrics",
      message:
        process.env.NODE_ENV === "development" ? err?.message : undefined,
      requestId,
    });
  }
}

/**
 * Get hotspot predictions for heatmap
 */
export async function getHotspots(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Look up manufacturer from user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;
    const hotspots = await getHotspotPredictions(manufacturerId);

    res.status(200).json({
      data: hotspots,
    });
  } catch (err) {
    console.error("[GET_HOTSPOTS] Error:", err);
    res.status(500).json({ error: "Failed to fetch hotspots" });
  }
}

/**
 * Export analytics data
 */
export async function exportAnalytics(req, res) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    const userId = req.user?.id;
    const { format = "csv" } = req.query;

    console.log(
      `[EXPORT-${requestId}] Export request: format=${format}, userId=${userId}`,
    );

    if (!userId) {
      console.warn(`[EXPORT-${requestId}] Unauthorized: No user ID`);
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Look up manufacturer from user
    console.log(`[EXPORT-${requestId}] Looking up manufacturer...`);
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      console.warn(
        `[EXPORT-${requestId}] Manufacturer not found for userId: ${userId}`,
      );
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;
    console.log(
      `[EXPORT-${requestId}] Found manufacturerId: ${manufacturerId}`,
    );

    console.log(`[EXPORT-${requestId}] Fetching export data...`);
    const data = await getExportData(manufacturerId, format);
    console.log(`[EXPORT-${requestId}] Got export data`, {
      hasVerifications: !!data?.verifications,
      verificationCount: data?.verifications?.length,
    });

    if (format === "csv") {
      try {
        console.log(`[EXPORT-${requestId}] Generating CSV...`);
        const csv = new Parser().parse(data.verifications);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=analytics.csv",
        );
        const duration = Date.now() - startTime;
        console.log(
          `[EXPORT-${requestId}] CSV exported successfully in ${duration}ms`,
        );
        res.send(csv);
      } catch (err) {
        console.error(`[EXPORT-${requestId}] CSV generation error:`, {
          message: err?.message,
          stack: err?.stack,
        });
        res.status(400).json({ error: "Failed to generate CSV" });
      }
    } else if (format === "json") {
      try {
        console.log(`[EXPORT-${requestId}] Generating JSON...`);
        const jsonString = JSON.stringify(data, null, 2);
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=analytics.json",
        );
        const duration = Date.now() - startTime;
        console.log(
          `[EXPORT-${requestId}] JSON exported successfully in ${duration}ms`,
        );
        res.send(jsonString);
      } catch (err) {
        console.error(`[EXPORT-${requestId}] JSON generation error:`, {
          message: err?.message,
          stack: err?.stack,
        });
        res.status(400).json({ error: "Failed to generate JSON" });
      }
    } else if (format === "pdf") {
      // For PDF, we'd typically use a library like puppeteer or pdfkit
      // For now, return the data as JSON that can be rendered to PDF on frontend
      res.status(400).json({ error: "PDF export requires frontend rendering" });
    } else {
      res.status(400).json({ error: "Invalid format" });
    }
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[EXPORT-${requestId}] Error after ${duration}ms:`, {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
      fullError: err,
    });
    res.status(500).json({
      error: "Failed to export analytics",
      message:
        process.env.NODE_ENV === "development" ? err?.message : undefined,
      requestId,
    });
  }
}

/**
 * Export revenue data as CSV
 */
export async function exportRevenueCSV(req, res) {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturerId = await getManufacturerIdFromUser(userId);
    if (!manufacturerId) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const { data, summary } = await getRevenueData(manufacturerId, start, end);
    const csv = await exportAsCSV(data, summary, "revenue");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=revenue-export.csv",
    );
    res.send(csv);
  } catch (error) {
    console.error("[EXPORT_REVENUE] Error:", error);
    res.status(500).json({ error: "Failed to export revenue data" });
  }
}

/**
 * Export verification data as CSV
 */
export async function exportVerificationCSV(req, res) {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturerId = await getManufacturerIdFromUser(userId);
    if (!manufacturerId) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const { data, summary } = await getVerificationData(
      manufacturerId,
      start,
      end,
    );
    const csv = await exportAsCSV(data, summary, "verifications");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=verification-export.csv",
    );
    res.send(csv);
  } catch (error) {
    console.error("[EXPORT_VERIFICATION] Error:", error);
    res.status(500).json({ error: "Failed to export verification data" });
  }
}

/**
 * Export product data as CSV
 */
export async function exportProductCSV(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturerId = await getManufacturerIdFromUser(userId);
    if (!manufacturerId) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const { data, summary } = await getProductData(manufacturerId);
    const csv = await exportAsCSV(data, summary, "products");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=products-export.csv",
    );
    res.send(csv);
  } catch (error) {
    console.error("[EXPORT_PRODUCTS] Error:", error);
    res.status(500).json({ error: "Failed to export product data" });
  }
}

/**
 * Export hotspot data as CSV
 */
export async function exportHotspotCSV(req, res) {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturerId = await getManufacturerIdFromUser(userId);
    if (!manufacturerId) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const { data, summary } = await getHotspotData(manufacturerId, start, end);
    const csv = await exportAsCSV(data, summary, "hotspots");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=hotspots-export.csv",
    );
    res.send(csv);
  } catch (error) {
    console.error("[EXPORT_HOTSPOTS] Error:", error);
    res.status(500).json({ error: "Failed to export hotspot data" });
  }
}

/**
 * Get all export data in JSON format (for frontend PDF generation)
 */
export async function getAllExportData(req, res) {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturerId = await getManufacturerIdFromUser(userId);
    if (!manufacturerId) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [revenue, verification, products, hotspots] = await Promise.all([
      getRevenueData(manufacturerId, start, end),
      getVerificationData(manufacturerId, start, end),
      getProductData(manufacturerId),
      getHotspotData(manufacturerId, start, end),
    ]);

    res.json({
      success: true,
      exportDate: new Date(),
      dateRange: {
        start: start.toLocaleDateString(),
        end: end.toLocaleDateString(),
      },
      revenue,
      verification,
      products,
      hotspots,
    });
  } catch (error) {
    console.error("[GET_EXPORT_DATA] Error:", error);
    res.status(500).json({ error: "Failed to fetch export data" });
  }
}

// ============================================
// NEW ADVANCED ANALYTICS ENDPOINTS
// ============================================

import {
  getRealTimeAnalytics,
  getProductPerformanceMetrics,
} from "../services/analyticsService.js";
import {
  generateAnalyticsReport,
  getManufacturerReports,
  exportReportToCSV,
  exportReportToJSON,
  createReportSchedule,
  getReportSchedules,
  updateReportSchedule,
  deleteReportSchedule,
} from "../services/reportingService.js";

/**
 * GET /manufacturer/analytics/real-time
 * Get real-time analytics with code authenticity and geo distribution
 */
export async function getRealTimeAnalyticsController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const analytics = await getRealTimeAnalytics(manufacturer.id);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("[GET_REAL_TIME_ANALYTICS] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /manufacturer/analytics/products
 * Get product performance metrics
 */
export async function getProductPerformanceController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const metrics = await getProductPerformanceMetrics(manufacturer.id);

    res.json({
      success: true,
      data: metrics,
      total: metrics.length,
    });
  } catch (error) {
    console.error("[PRODUCT_PERFORMANCE] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /manufacturer/reports/generate
 * Generate analytics report
 */
export async function generateReportController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const { title, period, startDate, endDate, format = "pdf" } = req.body;

    if (!title || !period || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, period, startDate, endDate",
      });
    }

    const report = await generateAnalyticsReport(
      manufacturer.id,
      title,
      period,
      new Date(startDate),
      new Date(endDate),
      [],
    );

    // Generate export if requested
    let exportFile = null;
    if (format === "csv") {
      exportFile = await exportReportToCSV(report.id, manufacturer.id);
    } else if (format === "json") {
      exportFile = await exportReportToJSON(report.id, manufacturer.id);
    }

    res.json({
      success: true,
      data: report,
      export: exportFile,
    });
  } catch (error) {
    console.error("[GENERATE_REPORT] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /manufacturer/reports
 * Get all reports for manufacturer
 */
export async function getReportsController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const { limit = 10 } = req.query;

    const reports = await getManufacturerReports(
      manufacturer.id,
      parseInt(limit),
    );

    res.json({
      success: true,
      data: reports,
      total: reports.length,
    });
  } catch (error) {
    console.error("[GET_REPORTS] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /manufacturer/reports/schedule
 * Create scheduled report
 */
export async function createScheduledReportController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const {
      name,
      frequency,
      format,
      recipients,
      metrics,
      dayOfWeek,
      dayOfMonth,
      hour,
    } = req.body;

    if (!name || !frequency || !format || !recipients || !metrics) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const schedule = await createReportSchedule(manufacturer.id, {
      name,
      frequency,
      format,
      recipients,
      metrics,
      dayOfWeek,
      dayOfMonth,
      hour,
    });

    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("[CREATE_SCHEDULE] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /manufacturer/reports/schedules
 * Get all report schedules
 */
export async function getSchedulesController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const schedules = await getReportSchedules(manufacturer.id);

    res.json({
      success: true,
      data: schedules,
      total: schedules.length,
    });
  } catch (error) {
    console.error("[GET_SCHEDULES] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PUT /manufacturer/reports/schedules/:scheduleId
 * Update report schedule
 */
export async function updateScheduleController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const { scheduleId } = req.params;
    const updates = req.body;

    const updated = await updateReportSchedule(
      scheduleId,
      manufacturer.id,
      updates,
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[UPDATE_SCHEDULE] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * DELETE /manufacturer/reports/schedules/:scheduleId
 * Delete report schedule
 */
export async function deleteScheduleController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const { scheduleId } = req.params;

    await deleteReportSchedule(scheduleId, manufacturer.id);

    res.json({
      success: true,
      message: "Schedule deleted",
    });
  } catch (error) {
    console.error("[DELETE_SCHEDULE] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PHASE 2: Get manufacturer trust metrics
 * Returns: overall authenticity %, trust badge, alert counts
 */
export async function getTrustMetrics(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const metrics = await getManufacturerTrustMetrics(manufacturer.id);

    res.status(200).json({
      data: metrics,
    });
  } catch (err) {
    console.error("[GET_TRUST_METRICS] Error:", err);
    res.status(500).json({ error: "Failed to fetch trust metrics" });
  }
}

/**
 * PHASE 2: Get authenticity trend for charts (30-day by default)
 */
export async function getAuthenticityTrendController(req, res) {
  try {
    const userId = req.user?.id;
    const { days = 30 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const trend = await getAuthenticityTrend(manufacturer.id, parseInt(days));

    res.status(200).json({
      data: trend,
      meta: {
        days: parseInt(days),
        count: trend.length,
      },
    });
  } catch (err) {
    console.error("[GET_AUTHENTICITY_TREND] Error:", err);
    res.status(500).json({ error: "Failed to fetch trend data" });
  }
}

/**
 * PHASE 2: Get alert summary
 */
export async function getAlertSummaryController(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const summary = await getAlertSummary(manufacturer.id);

    res.status(200).json({
      data: summary,
    });
  } catch (err) {
    console.error("[GET_ALERT_SUMMARY] Error:", err);
    res.status(500).json({ error: "Failed to fetch alert summary" });
  }
}
