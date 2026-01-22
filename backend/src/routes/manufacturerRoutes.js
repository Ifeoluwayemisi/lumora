import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  getDashboard,
  getProfile,
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  addBatch,
  getBatches,
  getManufacturerHistory,
  getBatchDetail,
  downloadBatchCodes,
  downloadBatchPDF,
  updateProfile,
} from "../controllers/manufacturerController.js";
import {
  flagCode,
  unflagCode,
  getFlaggedCodes,
} from "../controllers/codeController.js";
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../controllers/documentController.js";
import {
  getAnalytics,
  getHotspots,
  exportAnalytics,
  exportRevenueCSV,
  exportVerificationCSV,
  exportProductCSV,
  exportHotspotCSV,
  getAllExportData,
  getRealTimeAnalyticsController,
  getProductPerformanceController,
  generateReportController,
  getReportsController,
  createScheduledReportController,
  getSchedulesController,
  updateScheduleController,
  deleteScheduleController,
} from "../controllers/analyticsController.js";
import {
  initiatePayment,
  verifyAndUpgradePlan,
  getPaymentConfig,
  getBillingHistory,
} from "../controllers/paymentController.js";
import {
  getQuotaStatus,
  checkCanCreateCode,
} from "../controllers/quotaController.js";
import {
  getAllTeamMembers,
  getPendingTeamInvites,
  sendTeamInvite,
  updateTeamMemberRole,
  deleteTeamMember,
  cancelTeamInvite,
  acceptTeamInvite,
} from "../controllers/teamController.js";
import {
  createApiKeyController,
  getApiKeysController,
  updateApiKeyScopeController,
  updateApiKeyRateLimitController,
  revokeApiKeyController,
  deleteApiKeyController,
  getAuditLogsController,
} from "../controllers/apiKeyController.js";
import {
  createBatchRecallController,
  getBatchRecallsController,
  updateBatchRecallStatusController,
  getBatchExpirationMetricsController,
  getExpiringBatchesController,
  sendBatchExpirationAlertsController,
  getBatchPerformanceController,
  getAllBatchPerformanceController,
} from "../controllers/batchManagementController.js";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Allow PDF, images, and documents
    const allowed = /\.(pdf|jpg|jpeg|png|doc|docx)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

const router = express.Router();

// Only authenticated manufacturers
router.use(authMiddleware, roleMiddleware("MANUFACTURER"));

// Dashboard
router.get("/dashboard", getDashboard);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

// Analytics
router.get("/analytics", getAnalytics);
router.get("/analytics/hotspots", getHotspots);
router.get(
  "/analytics/export",
  authMiddleware,
  roleMiddleware("manufacturer"),
  exportAnalytics,
);
router.get(
  "/analytics/export/data",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getAllExportData,
);
router.get(
  "/analytics/export/revenue",
  authMiddleware,
  roleMiddleware("manufacturer"),
  exportRevenueCSV,
);
router.get(
  "/analytics/export/verification",
  authMiddleware,
  roleMiddleware("manufacturer"),
  exportVerificationCSV,
);
router.get(
  "/analytics/export/products",
  authMiddleware,
  roleMiddleware("manufacturer"),
  exportProductCSV,
);
router.get(
  "/analytics/export/hotspots",
  authMiddleware,
  roleMiddleware("manufacturer"),
  exportHotspotCSV,
);

// Products CRUD
router.get(
  "/products",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getProducts,
);
router.post(
  "/products",
  authMiddleware,
  roleMiddleware("manufacturer"),
  addProduct,
);
router.get(
  "/products/:id",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getProduct,
);
router.patch(
  "/products/:id",
  authMiddleware,
  roleMiddleware("manufacturer"),
  updateProduct,
);
router.delete(
  "/products/:id",
  authMiddleware,
  roleMiddleware("manufacturer"),
  deleteProduct,
);

// Batches & History
router.get(
  "/batches",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getBatches,
);
router.get(
  "/batch/:id",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getBatchDetail,
);
router.get(
  "/batch/:id/download",
  authMiddleware,
  roleMiddleware("manufacturer"),
  downloadBatchCodes,
);
router.get(
  "/batch/:id/download-pdf",
  authMiddleware,
  roleMiddleware("manufacturer"),
  downloadBatchPDF,
);
router.post("/batch", authMiddleware, roleMiddleware("manufacturer"), addBatch);
router.get(
  "/history",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getManufacturerHistory,
);

// Document Management
router.post(
  "/documents/upload",
  authMiddleware,
  roleMiddleware("manufacturer"),
  upload.single("file"),
  uploadDocument,
);
router.get(
  "/documents",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getDocuments,
);
router.delete(
  "/documents/:documentId",
  authMiddleware,
  roleMiddleware("manufacturer"),
  deleteDocument,
);

// Billing & Payment
router.get("/billing/config", getPaymentConfig);
router.post(
  "/billing/initiate-payment",
  authMiddleware,
  roleMiddleware("manufacturer"),
  initiatePayment,
);
router.post(
  "/billing/verify-payment",
  authMiddleware,
  roleMiddleware("manufacturer"),
  verifyAndUpgradePlan,
);
router.get(
  "/billing/history",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getBillingHistory,
);

// Quota management routes
router.get(
  "/quota",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getQuotaStatus,
);

router.get(
  "/can-create",
  authMiddleware,
  roleMiddleware("manufacturer"),
  checkCanCreateCode,
);
// Notifications endpoint - for manufacturer dashboard
router.get(
  "/notifications",
  authMiddleware,
  roleMiddleware("manufacturer"),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Import prisma dynamically to avoid circular dependencies
      const prismaModule = await import("../models/prismaClient.js");
      const prisma = prismaModule.default;

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return res.status(200).json({
        notifications,
      });
    } catch (err) {
      console.error("[GET_NOTIFICATIONS] Error:", err.message);
      return res.status(500).json({
        error: "Failed to fetch notifications",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Please try again later",
      });
    }
  },
);
// Team Management (with and without manufacturerId for flexibility)
router.get(
  "/:manufacturerId/team",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getAllTeamMembers,
);

router.get(
  "/:manufacturerId/team/invites",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getPendingTeamInvites,
);

router.post(
  "/:manufacturerId/team/invite",
  authMiddleware,
  roleMiddleware("manufacturer"),
  sendTeamInvite,
);

router.patch(
  "/:manufacturerId/team/:memberId/role",
  authMiddleware,
  roleMiddleware("manufacturer"),
  updateTeamMemberRole,
);

router.delete(
  "/:manufacturerId/team/:memberId",
  authMiddleware,
  roleMiddleware("manufacturer"),
  deleteTeamMember,
);

router.delete(
  "/:manufacturerId/team/invites/:inviteId",
  authMiddleware,
  roleMiddleware("manufacturer"),
  cancelTeamInvite,
);

// Simplified team routes (without manufacturerId in path)
router.get(
  "/team",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getAllTeamMembers,
);

router.get(
  "/team/pending-invites",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getPendingTeamInvites,
);

router.post(
  "/team/invite",
  authMiddleware,
  roleMiddleware("manufacturer"),
  sendTeamInvite,
);

router.patch(
  "/team/:memberId/role",
  authMiddleware,
  roleMiddleware("manufacturer"),
  updateTeamMemberRole,
);

router.delete(
  "/team/:memberId",
  authMiddleware,
  roleMiddleware("manufacturer"),
  deleteTeamMember,
);

router.delete(
  "/team/invites/:inviteId",
  authMiddleware,
  roleMiddleware("manufacturer"),
  cancelTeamInvite,
);

// Public endpoint for accepting invites
router.post("/team/invite/:token/accept", acceptTeamInvite);

// Code Flagging Routes
router.post(
  "/codes/:codeId/flag",
  authMiddleware,
  roleMiddleware("manufacturer"),
  flagCode,
);

router.post(
  "/codes/:codeId/unflag",
  authMiddleware,
  roleMiddleware("manufacturer"),
  unflagCode,
);

router.get(
  "/codes/flagged",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getFlaggedCodes,
);

// ========== NEW ADVANCED ANALYTICS ROUTES ==========

// Real-time analytics
router.get(
  "/analytics/real-time",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getRealTimeAnalyticsController,
);

// Product performance
router.get(
  "/analytics/products",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getProductPerformanceController,
);

// Reporting
router.post(
  "/reports/generate",
  authMiddleware,
  roleMiddleware("manufacturer"),
  generateReportController,
);

router.get(
  "/reports",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getReportsController,
);

// Report schedules
router.post(
  "/reports/schedule",
  authMiddleware,
  roleMiddleware("manufacturer"),
  createScheduledReportController,
);

router.get(
  "/reports/schedules",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getSchedulesController,
);

router.put(
  "/reports/schedules/:scheduleId",
  authMiddleware,
  roleMiddleware("manufacturer"),
  updateScheduleController,
);

router.delete(
  "/reports/schedules/:scheduleId",
  authMiddleware,
  roleMiddleware("manufacturer"),
  deleteScheduleController,
);

// ========== API KEY MANAGEMENT ROUTES ==========

router.post(
  "/api-keys",
  authMiddleware,
  roleMiddleware("manufacturer"),
  createApiKeyController,
);

router.get(
  "/api-keys",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getApiKeysController,
);

router.put(
  "/api-keys/:keyId/scope",
  authMiddleware,
  roleMiddleware("manufacturer"),
  updateApiKeyScopeController,
);

router.put(
  "/api-keys/:keyId/rate-limit",
  authMiddleware,
  roleMiddleware("manufacturer"),
  updateApiKeyRateLimitController,
);

router.delete(
  "/api-keys/:keyId",
  authMiddleware,
  roleMiddleware("manufacturer"),
  revokeApiKeyController,
);

router.delete(
  "/api-keys/:keyId/delete",
  authMiddleware,
  roleMiddleware("manufacturer"),
  deleteApiKeyController,
);

// ========== BATCH MANAGEMENT ROUTES ==========

// Batch recalls
router.post(
  "/batches/:batchId/recall",
  authMiddleware,
  roleMiddleware("manufacturer"),
  createBatchRecallController,
);

router.get(
  "/batches/recalls",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getBatchRecallsController,
);

router.put(
  "/batches/recalls/:recallId",
  authMiddleware,
  roleMiddleware("manufacturer"),
  updateBatchRecallStatusController,
);

// Batch expiration
router.get(
  "/batches/expiration-metrics",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getBatchExpirationMetricsController,
);

router.get(
  "/batches/expiring",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getExpiringBatchesController,
);

router.post(
  "/batches/send-expiration-alerts",
  authMiddleware,
  roleMiddleware("manufacturer"),
  sendBatchExpirationAlertsController,
);

// Batch performance
router.get(
  "/batches/:batchId/performance",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getBatchPerformanceController,
);

router.get(
  "/batches/performance/all",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getAllBatchPerformanceController,
);

// ========== AUDIT LOGS ==========

router.get(
  "/audit-logs",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getAuditLogsController,
);

export default router;
