import express from "express";
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

// Import admin controllers
import * as adminAuthController from "../controllers/adminAuthController.js";
import * as adminDashboardController from "../controllers/adminDashboardController.js";
import * as manufacturerReviewController from "../controllers/manufacturerReviewController.js";
import * as userReportController from "../controllers/userReportController.js";
import * as caseManagementController from "../controllers/caseManagementController.js";
import * as auditLogController from "../controllers/auditLogController.js";

const router = express.Router();

// ========== ADMIN AUTHENTICATION ROUTES ==========

// Public routes (no auth required)
router.post("/auth/register", adminAuthController.registerAdminController);
router.post("/auth/login/step1", adminAuthController.adminLoginStep1Controller);
router.post("/auth/login/step2", adminAuthController.adminLoginStep2Controller);

// Protected routes
router.get(
  "/auth/profile",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST", "SUPPORT"),
  adminAuthController.getAdminProfileController,
);

router.post(
  "/auth/change-password",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST", "SUPPORT"),
  adminAuthController.changeAdminPasswordController,
);

router.post(
  "/auth/logout",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST", "SUPPORT"),
  adminAuthController.adminLogoutController,
);

router.get(
  "/auth/admins",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  adminAuthController.listAdminUsersController,
);

// ========== GLOBAL DASHBOARD ROUTES ==========

router.get(
  "/dashboard/metrics",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST"),
  adminDashboardController.getGlobalMetricsController,
);

router.get(
  "/dashboard/authenticity",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST"),
  adminDashboardController.getAuthenticityBreakdownController,
);

router.get(
  "/dashboard/trend",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST"),
  adminDashboardController.getVerificationTrendController,
);

router.get(
  "/dashboard/hotspots",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST"),
  adminDashboardController.getHotspotClustersController,
);

router.get(
  "/dashboard/high-risk-manufacturers",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR"),
  adminDashboardController.getHighRiskManufacturersController,
);

router.get(
  "/dashboard/ai-health",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN", "ANALYST"),
  adminDashboardController.getAIHealthScoreController,
);

router.get(
  "/dashboard/alerts",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR"),
  adminDashboardController.getCriticalAlertsController,
);

router.get(
  "/dashboard/export",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  adminDashboardController.exportDashboardDataController,
);

router.get(
  "/dashboard/false-positives",
  adminAuthMiddleware,
  roleMiddleware("ADMIN", "MODERATOR", "SUPER_ADMIN"),
  adminDashboardController.getFalsePositivesController,
);

router.get(
  "/dashboard/flagged-results",
  adminAuthMiddleware,
  roleMiddleware("ADMIN", "MODERATOR", "SUPER_ADMIN"),
  adminDashboardController.getFlaggedResultsController,
);

// ========== MANUFACTURER REVIEW ROUTES ==========

router.get(
  "/manufacturers/review-queue",
  adminAuthMiddleware,
  roleMiddleware("ADMIN", "NAFDAC", "SUPER_ADMIN"),
  manufacturerReviewController.getReviewQueueController,
);

router.get(
  "/manufacturers/review-queue/stats",
  adminAuthMiddleware,
  roleMiddleware("ADMIN", "NAFDAC", "SUPER_ADMIN"),
  manufacturerReviewController.getReviewQueueStatsController,
);

router.get(
  "/manufacturers/:manufacturerId/review",
  adminAuthMiddleware,
  roleMiddleware("ADMIN", "NAFDAC", "SUPER_ADMIN"),
  manufacturerReviewController.getManufacturerApplication,
);

// router.get(
//   "/manufacturers/:manufacturerId/admin-view",
//   adminAuthMiddleware,
//   roleMiddleware("MODERATOR", "SUPER_ADMIN"),
//   manufacturerReviewController.getManufacturerAdminViewController,
// );

router.post(
  "/manufacturers/:manufacturerId/approve",
  adminAuthMiddleware,
  roleMiddleware("ADMIN", "NAFDAC", "SUPER_ADMIN"),
  manufacturerReviewController.approveManufacturer,
);

router.post(
  "/manufacturers/:manufacturerId/reject",
  adminAuthMiddleware,
  roleMiddleware("ADMIN", "NAFDAC", "SUPER_ADMIN"),
  manufacturerReviewController.rejectManufacturer,
);

router.post(
  "/manufacturers/:manufacturerId/request-docs",
  adminAuthMiddleware,
  roleMiddleware("ADMIN", "NAFDAC", "SUPER_ADMIN"),
  manufacturerReviewController.requestMoreInfo,
);

router.post(
  "/manufacturers/:manufacturerId/audit",
  adminAuthMiddleware,
  roleMiddleware("ADMIN", "MODERATOR", "SUPER_ADMIN"),
  manufacturerReviewController.forceAuditController,
);

// router.post(
//   "/manufacturers/:manufacturerId/suspend",
//   adminAuthMiddleware,
//   roleMiddleware("SUPER_ADMIN"),
//   manufacturerReviewController.suspendManufacturerController,
// );

// ========== USER REPORTS ROUTES ==========

router.get(
  "/reports",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.getUserReportsController,
);

router.get(
  "/reports/stats",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.getReportStatsController,
);

router.get(
  "/reports/risk-breakdown",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.getReportsByRiskController,
);

router.get(
  "/reports/hotspots",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.getReportHotspotsController,
);

router.get(
  "/reports/:reportId",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.getReportDetailController,
);

router.post(
  "/reports/:reportId/review",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.markReportReviewedController,
);

router.post(
  "/reports/:reportId/link-case",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.linkReportToCaseController,
);

router.post(
  "/reports/:reportId/dismiss",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.dismissReportController,
);

// ========== CASE MANAGEMENT ROUTES ==========

router.get(
  "/cases",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.getCaseFilesController,
);

router.post(
  "/cases",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.createCaseController,
);

router.get(
  "/cases/stats",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.getCaseStatsController,
);

router.get(
  "/cases/search",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.searchCasesController,
);

router.get(
  "/cases/:caseId",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.getCaseDetailController,
);

router.post(
  "/cases/:caseId/status",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.updateCaseStatusController,
);

router.post(
  "/cases/:caseId/notes",
  adminAuthMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.addCaseNoteController,
);

router.post(
  "/cases/:caseId/escalate-nafdac",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  caseManagementController.escalateCaseToNAFDACController,
);

// ========== AUDIT LOG ROUTES ==========

router.get(
  "/audit-logs",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  auditLogController.getAuditLogsController,
);

router.get(
  "/audit-logs/:resourceType/:resourceId",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  auditLogController.getResourceAuditLogsController,
);

router.get(
  "/audit-logs/admin/:adminId",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  auditLogController.getAdminHistoryController,
);

router.post(
  "/audit-logs/suspicious/:adminId",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  auditLogController.checkSuspiciousActivityController,
);

router.get(
  "/audit-logs/export",
  adminAuthMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  auditLogController.exportAuditLogsController,
);

export default router;
