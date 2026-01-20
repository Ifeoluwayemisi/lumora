import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import prisma from "../models/prismaClient.js";
import {
  recalculateManufacturerRiskScore,
  recalculateAllManufacturerRiskScores,
} from "../services/aiRiskService.js";
import {
  calculateDynamicTrustScore,
  recalculateAllTrustScores,
  getTrustScoreTrend,
} from "../services/dynamicTrustScoreService.js";
import {
  checkWebsiteLegitimacy,
  getWebsiteCheckHistory,
  recheckAllManufacturerWebsites,
} from "../services/websiteLegitimacyService.js";
import {
  checkDocumentForForgery,
  checkAllManufacturerDocuments,
  getDocumentCheckHistory,
} from "../services/documentForgeryDetectionService.js";
import {
  getRateLimitStatus,
  resetRateLimit,
  getRateLimitStats,
} from "../services/rateLimitService.js";

const router = express.Router();

// Middleware to verify admin role
const verifyAdmin = roleMiddleware("ADMIN");

// ============================================
// RISK SCORE ENDPOINTS
// ============================================

/**
 * POST /api/admin/security/recalculate-risk/:manufacturerId
 * Recalculate risk score for a specific manufacturer
 */
router.post(
  "/recalculate-risk/:manufacturerId",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const { manufacturerId } = req.params;

      const manufacturer = await prisma.manufacturer.findUnique({
        where: { id: manufacturerId },
      });

      if (!manufacturer) {
        return res.status(404).json({ error: "Manufacturer not found" });
      }

      const result = await recalculateManufacturerRiskScore(manufacturerId);

      res.json({
        success: true,
        message: "Risk score recalculated",
        data: result,
      });
    } catch (err) {
      console.error("[ADMIN_API] Risk recalc error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

/**
 * POST /api/admin/security/recalculate-all-risks
 * Recalculate risk scores for all manufacturers (batch job)
 */
router.post(
  "/recalculate-all-risks",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const results = await recalculateAllManufacturerRiskScores();

      res.json({
        success: true,
        message: "Batch risk recalculation completed",
        count: results.length,
        data: results,
      });
    } catch (err) {
      console.error("[ADMIN_API] Batch risk recalc error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

// ============================================
// TRUST SCORE ENDPOINTS
// ============================================

/**
 * POST /api/admin/security/recalculate-trust/:manufacturerId
 * Recalculate trust score for a specific manufacturer
 */
router.post(
  "/recalculate-trust/:manufacturerId",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const { manufacturerId } = req.params;

      const manufacturer = await prisma.manufacturer.findUnique({
        where: { id: manufacturerId },
      });

      if (!manufacturer) {
        return res.status(404).json({ error: "Manufacturer not found" });
      }

      const result = await calculateDynamicTrustScore(manufacturerId);

      res.json({
        success: true,
        message: "Trust score recalculated",
        data: result,
      });
    } catch (err) {
      console.error("[ADMIN_API] Trust recalc error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

/**
 * POST /api/admin/security/recalculate-all-trust
 * Recalculate trust scores for all manufacturers
 */
router.post(
  "/recalculate-all-trust",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const results = await recalculateAllTrustScores();

      res.json({
        success: true,
        message: "Batch trust recalculation completed",
        count: results.length,
        data: results,
      });
    } catch (err) {
      console.error("[ADMIN_API] Batch trust recalc error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

/**
 * GET /api/admin/security/trust-trend/:manufacturerId
 * Get trust score trend for manufacturer
 */
router.get(
  "/trust-trend/:manufacturerId",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const { manufacturerId } = req.params;
      const { days = 90 } = req.query;

      const trend = await getTrustScoreTrend(manufacturerId, parseInt(days));

      res.json({
        success: true,
        data: trend,
      });
    } catch (err) {
      console.error("[ADMIN_API] Trust trend error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

// ============================================
// WEBSITE LEGITIMACY ENDPOINTS
// ============================================

/**
 * POST /api/admin/security/check-website/:manufacturerId
 * Check website legitimacy for a manufacturer
 */
router.post(
  "/check-website/:manufacturerId",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const { manufacturerId } = req.params;

      const manufacturer = await prisma.manufacturer.findUnique({
        where: { id: manufacturerId },
      });

      if (!manufacturer) {
        return res.status(404).json({ error: "Manufacturer not found" });
      }

      const result = await checkWebsiteLegitimacy(manufacturerId);

      res.json({
        success: true,
        message: "Website legitimacy check completed",
        data: result,
      });
    } catch (err) {
      console.error("[ADMIN_API] Website check error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

/**
 * GET /api/admin/security/website-history/:manufacturerId
 * Get website check history
 */
router.get(
  "/website-history/:manufacturerId",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const { manufacturerId } = req.params;
      const { limit = 10 } = req.query;

      const history = await getWebsiteCheckHistory(
        manufacturerId,
        parseInt(limit),
      );

      res.json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (err) {
      console.error("[ADMIN_API] Website history error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

/**
 * POST /api/admin/security/recheck-all-websites
 * Recheck all manufacturers' websites (batch job)
 */
router.post(
  "/recheck-all-websites",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const results = await recheckAllManufacturerWebsites();

      res.json({
        success: true,
        message: "Batch website recheck completed",
        count: results.length,
        data: results,
      });
    } catch (err) {
      console.error("[ADMIN_API] Batch website check error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

// ============================================
// DOCUMENT FORGERY ENDPOINTS
// ============================================

/**
 * POST /api/admin/security/check-document/:manufacturerId
 * Check a specific document for forgery
 */
router.post(
  "/check-document/:manufacturerId",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const { manufacturerId } = req.params;
      const { documentType, filePath } = req.body;

      if (!documentType || !filePath) {
        return res
          .status(400)
          .json({ error: "documentType and filePath required" });
      }

      const result = await checkDocumentForForgery(
        manufacturerId,
        documentType,
        filePath,
      );

      res.json({
        success: true,
        message: "Document forgery check completed",
        data: result,
      });
    } catch (err) {
      console.error("[ADMIN_API] Document check error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

/**
 * POST /api/admin/security/check-all-documents/:manufacturerId
 * Check all documents for a manufacturer
 */
router.post(
  "/check-all-documents/:manufacturerId",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const { manufacturerId } = req.params;

      const results = await checkAllManufacturerDocuments(manufacturerId);

      res.json({
        success: true,
        message: "All documents checked",
        count: results.length,
        data: results,
      });
    } catch (err) {
      console.error("[ADMIN_API] Batch document check error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

/**
 * GET /api/admin/security/document-history/:manufacturerId
 * Get document check history
 */
router.get(
  "/document-history/:manufacturerId",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const { manufacturerId } = req.params;
      const { limit = 10 } = req.query;

      const history = await getDocumentCheckHistory(
        manufacturerId,
        parseInt(limit),
      );

      res.json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (err) {
      console.error("[ADMIN_API] Document history error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

// ============================================
// RATE LIMITING ENDPOINTS
// ============================================

/**
 * GET /api/admin/security/rate-limit-status/:userId
 * Get rate limit status for a user
 */
router.get(
  "/rate-limit-status/:userId",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const status = await getRateLimitStatus(userId);

      res.json({
        success: true,
        data: status,
      });
    } catch (err) {
      console.error("[ADMIN_API] Rate limit status error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

/**
 * POST /api/admin/security/reset-rate-limit/:userId
 * Reset rate limits for a user
 */
router.post(
  "/reset-rate-limit/:userId",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { action } = req.body;

      resetRateLimit(userId, action);

      res.json({
        success: true,
        message: action
          ? `Reset ${action} limit for user ${userId}`
          : `Reset all limits for user ${userId}`,
      });
    } catch (err) {
      console.error("[ADMIN_API] Rate limit reset error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

/**
 * GET /api/admin/security/rate-limit-stats
 * Get rate limiting statistics
 */
router.get(
  "/rate-limit-stats",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const stats = getRateLimitStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (err) {
      console.error("[ADMIN_API] Rate limit stats error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

// ============================================
// COMBINED SECURITY CHECK
// ============================================

/**
 * POST /api/admin/security/full-check/:manufacturerId
 * Run all security checks for a manufacturer
 */
router.post(
  "/full-check/:manufacturerId",
  authMiddleware,
  verifyAdmin,
  async (req, res) => {
    try {
      const { manufacturerId } = req.params;

      // Run all checks in parallel
      const [riskData, trustData, websiteData, documentData] =
        await Promise.all([
          recalculateManufacturerRiskScore(manufacturerId).catch((e) => ({
            error: e.message,
          })),
          calculateDynamicTrustScore(manufacturerId).catch((e) => ({
            error: e.message,
          })),
          checkWebsiteLegitimacy(manufacturerId).catch((e) => ({
            error: e.message,
          })),
          checkAllManufacturerDocuments(manufacturerId).catch((e) => [
            { error: e.message },
          ]),
        ]);

      res.json({
        success: true,
        message: "Full security check completed",
        data: {
          riskScore: riskData,
          trustScore: trustData,
          websiteLegitimacy: websiteData,
          documents: documentData,
        },
      });
    } catch (err) {
      console.error("[ADMIN_API] Full check error:", err.message);
      res.status(400).json({ error: err.message });
    }
  },
);

export default router;
