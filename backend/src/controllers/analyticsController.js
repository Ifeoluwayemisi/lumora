import {
  getManufacturerAnalytics,
  getHotspotPredictions,
  getExportData,
} from "../services/analyticsService.js";
import { Parser } from "json2csv";

/**
 * Get comprehensive analytics for manufacturer
 */
export async function getAnalytics(req, res) {
  try {
    const manufacturerId = req.user?.id;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const analytics = await getManufacturerAnalytics(manufacturerId);

    res.status(200).json({
      data: analytics,
    });
  } catch (err) {
    console.error("[GET_ANALYTICS] Error:", err);
    res.status(500).json({
      error: "Failed to fetch analytics",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}

/**
 * Get hotspot predictions for heatmap
 */
export async function getHotspots(req, res) {
  try {
    const manufacturerId = req.user?.id;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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
          "attachment; filename=analytics.csv"
        );
        res.send(csv);
      } catch (err) {
        res.status(400).json({ error: "Failed to generate CSV" });
      }
    } else if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=analytics.json"
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
