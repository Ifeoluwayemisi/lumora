import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
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
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST", "SUPPORT"),
  adminAuthController.getAdminProfileController,
);

router.post(
  "/auth/change-password",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST", "SUPPORT"),
  adminAuthController.changeAdminPasswordController,
);

router.post(
  "/auth/logout",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST", "SUPPORT"),
  adminAuthController.adminLogoutController,
);

router.get(
  "/auth/admins",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  adminAuthController.listAdminUsersController,
);

// ========== GLOBAL DASHBOARD ROUTES ==========

router.get(
  "/dashboard/metrics",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST"),
  adminDashboardController.getGlobalMetricsController,
);

router.get(
  "/dashboard/authenticity",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST"),
  adminDashboardController.getAuthenticityBreakdownController,
);

router.get(
  "/dashboard/trend",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST"),
  adminDashboardController.getVerificationTrendController,
);

router.get(
  "/dashboard/hotspots",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR", "ANALYST"),
  adminDashboardController.getHotspotClustersController,
);

router.get(
  "/dashboard/high-risk-manufacturers",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR"),
  adminDashboardController.getHighRiskManufacturersController,
);

router.get(
  "/dashboard/ai-health",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ANALYST"),
  adminDashboardController.getAIHealthScoreController,
);

router.get(
  "/dashboard/alerts",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "MODERATOR"),
  adminDashboardController.getCriticalAlertsController,
);

router.get(
  "/dashboard/export",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  adminDashboardController.exportDashboardDataController,
);

// ========== MANUFACTURER REVIEW ROUTES ==========

router.get(
  "/manufacturers/review-queue",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  manufacturerReviewController.getReviewQueueController,
);

// router.get(
//   "/manufacturers/review-queue/stats",
//   authMiddleware,
//   roleMiddleware("MODERATOR", "SUPER_ADMIN"),
//   manufacturerReviewController.getReviewQueueStatsController,
// );

router.get(
  "/manufacturers/:manufacturerId/review",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  manufacturerReviewController.getManufacturerApplication,
);

// router.get(
//   "/manufacturers/:manufacturerId/admin-view",
//   authMiddleware,
//   roleMiddleware("MODERATOR", "SUPER_ADMIN"),
//   manufacturerReviewController.getManufacturerAdminViewController,
// );

router.post(
  "/manufacturers/:manufacturerId/approve",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  manufacturerReviewController.approveManufacturer,
);

router.post(
  "/manufacturers/:manufacturerId/reject",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  manufacturerReviewController.rejectManufacturer,
);

router.post(
  "/manufacturers/:manufacturerId/request-docs",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  manufacturerReviewController.requestMoreInfo,
);

// router.post(
//   "/manufacturers/:manufacturerId/suspend",
//   authMiddleware,
//   roleMiddleware("SUPER_ADMIN"),
//   manufacturerReviewController.suspendManufacturerController,
// );

// ========== USER REPORTS ROUTES ==========

router.get(
  "/reports",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.getUserReportsController,
);

router.get(
  "/reports/stats",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.getReportStatsController,
);

router.get(
  "/reports/risk-breakdown",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.getReportsByRiskController,
);

router.get(
  "/reports/hotspots",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.getReportHotspotsController,
);

router.get(
  "/reports/:reportId",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.getReportDetailController,
);

router.post(
  "/reports/:reportId/review",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.markReportReviewedController,
);

router.post(
  "/reports/:reportId/link-case",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.linkReportToCaseController,
);

router.post(
  "/reports/:reportId/dismiss",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  userReportController.dismissReportController,
);

// ========== CASE MANAGEMENT ROUTES ==========

router.get(
  "/cases",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.getCaseFilesController,
);

router.post(
  "/cases",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.createCaseController,
);

router.get(
  "/cases/stats",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.getCaseStatsController,
);

router.get(
  "/cases/search",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.searchCasesController,
);

router.get(
  "/cases/:caseId",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.getCaseDetailController,
);

router.post(
  "/cases/:caseId/status",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.updateCaseStatusController,
);

router.post(
  "/cases/:caseId/notes",
  authMiddleware,
  roleMiddleware("MODERATOR", "SUPER_ADMIN"),
  caseManagementController.addCaseNoteController,
);

router.post(
  "/cases/:caseId/escalate-nafdac",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  caseManagementController.escalateCaseToNAFDACController,
);

// ========== AUDIT LOG ROUTES ==========

router.get(
  "/audit-logs",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  auditLogController.getAuditLogsController,
);

router.get(
  "/audit-logs/:resourceType/:resourceId",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  auditLogController.getResourceAuditLogsController,
);

router.get(
  "/audit-logs/admin/:adminId",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  auditLogController.getAdminHistoryController,
);

router.post(
  "/audit-logs/suspicious/:adminId",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  auditLogController.checkSuspiciousActivityController,
);

router.get(
  "/audit-logs/export",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  auditLogController.exportAuditLogsController,
);

export default router;
