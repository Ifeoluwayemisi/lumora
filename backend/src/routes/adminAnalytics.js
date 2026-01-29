import express from "express";
import * as adminAnalyticsController from "../controllers/adminAnalyticsController.js";
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Middleware: Verify admin access for all routes
router.use(adminAuthMiddleware);
router.use(roleMiddleware("SUPER_ADMIN", "ANALYST", "MODERATOR"));

// ============================================
// CATEGORY DISTRIBUTION ROUTES
// ============================================

/**
 * GET /admin/analytics/category-distribution
 * Get current manufacturer category distribution
 */
router.get(
  "/analytics/category-distribution",
  adminAnalyticsController.getCategoryDistribution,
);

/**
 * GET /admin/analytics/category-history
 * Get historical category distribution
 */
router.get(
  "/analytics/category-history",
  adminAnalyticsController.getCategoryDistributionHistory,
);

/**
 * GET /admin/analytics/manufacturers
 * Get manufacturers breakdown by category
 */
router.get(
  "/analytics/manufacturers",
  adminAnalyticsController.getManufacturersByCategory,
);

// ============================================
// AGENCY REPORTING ROUTES
// ============================================

/**
 * GET /admin/analytics/agencies
 * Get all agencies analytics
 */
router.get(
  "/analytics/agencies",
  adminAnalyticsController.getAllAgenciesAnalytics,
);

/**
 * GET /admin/analytics/agencies/:agency
 * Get specific agency report
 */
router.get(
  "/analytics/agencies/:agency",
  adminAnalyticsController.getAgencyReport,
);

// ============================================
// RATE LIMITING MANAGEMENT ROUTES
// ============================================

/**
 * GET /admin/management/rate-limits
 * Get all agencies rate limit status
 */
router.get(
  "/management/rate-limits",
  adminAnalyticsController.getAllRateLimits,
);

/**
 * GET /admin/management/rate-limits/:agency
 * Get specific agency rate limit status
 */
router.get(
  "/management/rate-limits/:agency",
  adminAnalyticsController.getAgencyRateLimit,
);

/**
 * PUT /admin/management/rate-limits/:agency
 * Update agency rate limits
 */
router.put(
  "/management/rate-limits/:agency",
  adminAnalyticsController.updateAgencyRateLimit,
);

// ============================================
// WEBHOOK MANAGEMENT ROUTES
// ============================================

/**
 * GET /admin/management/webhooks/:agency/config
 * Get webhook configuration
 */
router.get(
  "/management/webhooks/:agency/config",
  adminAnalyticsController.getWebhookConfig,
);

/**
 * POST /admin/management/webhooks/:agency/register
 * Register or update webhook
 */
router.post(
  "/management/webhooks/:agency/register",
  adminAnalyticsController.registerWebhook,
);

/**
 * GET /admin/management/webhooks/:agency/logs
 * Get webhook delivery logs
 */
router.get(
  "/management/webhooks/:agency/logs",
  adminAnalyticsController.getWebhookLogs,
);

/**
 * PATCH /admin/management/webhooks/:agency/toggle
 * Toggle webhook active/inactive
 */
router.patch(
  "/management/webhooks/:agency/toggle",
  adminAnalyticsController.toggleWebhook,
);

export default router;
