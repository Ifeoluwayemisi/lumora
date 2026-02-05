/**
 * Reporter Reputation Routes
 * Endpoints for reputation tracking and leaderboard
 */

import express from "express";
import {
  calculateReporterReputation,
  getTopReporters,
  updateReporterReputation,
} from "../services/reporterReputationService.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /reputation/leaderboard
 * Get top reporters by accuracy and contributions
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topReporters = await getTopReporters(limit);

    res.json({
      success: true,
      data: topReporters,
      count: topReporters.length,
    });
  } catch (err) {
    console.error("[REPUTATION] Leaderboard error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch leaderboard",
    });
  }
});

/**
 * GET /reputation/reporter/:reporterId
 * Get reputation profile for specific reporter
 */
router.get("/reporter/:reporterId", async (req, res) => {
  try {
    const { reporterId } = req.params;

    const reputation = await calculateReporterReputation(reporterId);

    if (!reputation) {
      return res.status(404).json({
        success: false,
        error: "Reporter not found",
      });
    }

    res.json({
      success: true,
      data: reputation,
    });
  } catch (err) {
    console.error("[REPUTATION] Get reporter error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch reporter reputation",
    });
  }
});

/**
 * GET /reputation/me
 * Get current authenticated user's reputation
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    const reputation = await calculateReporterReputation(userId);

    res.json({
      success: true,
      data: reputation,
    });
  } catch (err) {
    console.error("[REPUTATION] Get me error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch your reputation",
    });
  }
});

/**
 * POST /reputation/update/:reporterId
 * Update reporter reputation (admin only)
 */
router.post("/update/:reporterId", authMiddleware, async (req, res) => {
  try {
    const { reporterId } = req.params;
    const { accuracy } = req.body;

    // Check admin role
    if (req.user?.role !== "SUPER_ADMIN" && req.user?.role !== "MODERATOR") {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const updated = await updateReporterReputation(reporterId, accuracy);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Failed to update reputation",
      });
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error("[REPUTATION] Update error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to update reputation",
    });
  }
});

export default router;
