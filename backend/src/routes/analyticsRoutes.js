/**
 * Analytics Routes
 * Endpoints for analytics and reporting dashboard
 */

import express from "express";
import {
  getCounterfeitHotspots,
  getCounterfeitRateByProduct,
  getCounterfeitRateByManufacturer,
  getReportTrends,
  getAnalyticsDashboard,
  getRiskDistribution,
  getStatusDistribution,
} from "../services/analyticsService.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * GET /analytics/dashboard
 * Get overall analytics dashboard data
 */
router.get("/dashboard", authenticateToken, adminOnly, async (req, res) => {
  try {
    const dashboard = await getAnalyticsDashboard();

    if (!dashboard) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch dashboard data",
      });
    }

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (err) {
    console.error("[ANALYTICS] Dashboard error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard",
    });
  }
});

/**
 * GET /analytics/hotspots
 * Get counterfeit hotspots by location
 */
router.get("/hotspots", authenticateToken, adminOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const hotspots = await getCounterfeitHotspots(limit);

    res.json({
      success: true,
      data: hotspots,
      count: hotspots.length,
    });
  } catch (err) {
    console.error("[ANALYTICS] Hotspots error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch hotspots",
    });
  }
});

/**
 * GET /analytics/products
 * Get counterfeit rate by product
 */
router.get("/products", authenticateToken, adminOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const products = await getCounterfeitRateByProduct(limit);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (err) {
    console.error("[ANALYTICS] Products error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product analytics",
    });
  }
});

/**
 * GET /analytics/manufacturers
 * Get counterfeit rate by manufacturer
 */
router.get(
  "/manufacturers",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 15;
      const manufacturers = await getCounterfeitRateByManufacturer(limit);

      res.json({
        success: true,
        data: manufacturers,
        count: manufacturers.length,
      });
    } catch (err) {
      console.error("[ANALYTICS] Manufacturers error:", err.message);
      res.status(500).json({
        success: false,
        error: "Failed to fetch manufacturer analytics",
      });
    }
  },
);

/**
 * GET /analytics/trends
 * Get report trends over time
 */
router.get("/trends", authenticateToken, adminOnly, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const trends = await getReportTrends(days);

    res.json({
      success: true,
      data: trends,
      count: trends.length,
    });
  } catch (err) {
    console.error("[ANALYTICS] Trends error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trends",
    });
  }
});

/**
 * GET /analytics/risk-distribution
 * Get risk level distribution
 */
router.get(
  "/risk-distribution",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      const distribution = await getRiskDistribution();

      if (!distribution) {
        return res.status(500).json({
          success: false,
          error: "Failed to fetch risk distribution",
        });
      }

      res.json({
        success: true,
        data: distribution,
      });
    } catch (err) {
      console.error("[ANALYTICS] Risk distribution error:", err.message);
      res.status(500).json({
        success: false,
        error: "Failed to fetch risk distribution",
      });
    }
  },
);

/**
 * GET /analytics/status-distribution
 * Get status distribution
 */
router.get(
  "/status-distribution",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      const distribution = await getStatusDistribution();

      if (!distribution) {
        return res.status(500).json({
          success: false,
          error: "Failed to fetch status distribution",
        });
      }

      res.json({
        success: true,
        data: distribution,
      });
    } catch (err) {
      console.error("[ANALYTICS] Status distribution error:", err.message);
      res.status(500).json({
        success: false,
        error: "Failed to fetch status distribution",
      });
    }
  },
);

export default router;
