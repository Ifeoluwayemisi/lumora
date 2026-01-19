import prisma from "../models/prismaClient.js";
import {
  getManufacturerAnalytics,
  getHotspotPredictions,
  getExportData,
} from "../services/analyticsService.js";
import {
  getRevenueData,
  getVerificationData,
  getProductData,
  getHotspotData,
  exportAsCSV,
} from "../services/analyticsExportService.js";
import { Parser } from "json2csv";

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
      message: err.message,
      code: err.code,
      stack: err.stack,
      manufacturerId: req.user?.id,
    });
    res.status(500).json({
      error: "Failed to fetch analytics",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
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
  try {
    const manufacturerId = req.user?.id;
    const { format = "csv" } = req.query;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const data = await getExportData(manufacturerId, format);

    if (format === "csv") {
      try {
        const csv = new Parser().parse(data.verifications);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=analytics.csv",
        );
        res.send(csv);
      } catch (err) {
        res.status(400).json({ error: "Failed to generate CSV" });
      }
    } else if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=analytics.json",
      );
      res.json(data);
    } else if (format === "pdf") {
      // For PDF, we'd typically use a library like puppeteer or pdfkit
      // For now, return the data as JSON that can be rendered to PDF on frontend
      res.status(400).json({ error: "PDF export requires frontend rendering" });
    } else {
      res.status(400).json({ error: "Invalid format" });
    }
  } catch (err) {
    console.error("[EXPORT_ANALYTICS] Error:", err);
    res.status(500).json({ error: "Failed to export analytics" });
  }
}

/**
 * Export revenue data as CSV
 */
export async function exportRevenueCSV(req, res) {
  try {
    const manufacturerId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
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
    const manufacturerId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
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
    const manufacturerId = req.user?.id;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
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
    const manufacturerId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
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
    const manufacturerId = req.user?.id;
    const { startDate, endDate } = req.query;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
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
