import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  getDashboard,
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
  updateProfile,
} from "../controllers/manufacturerController.js";
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

// Team Management
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

// Public endpoint for accepting invites
router.post("/team/invite/:token/accept", acceptTeamInvite);

export default router;
