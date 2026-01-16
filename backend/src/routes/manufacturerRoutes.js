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
} from "../controllers/analyticsController.js";
import {
  initiatePayment,
  verifyAndUpgradePlan,
  getPaymentConfig,
  getBillingHistory,
} from "../controllers/paymentController.js";

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
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getDashboard
);
router.patch(
  "/profile",
  authMiddleware,
  roleMiddleware("manufacturer"),
  updateProfile
);

// Analytics
router.get(
  "/analytics",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getAnalytics
);
router.get(
  "/analytics/hotspots",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getHotspots
);
router.get(
  "/analytics/export",
  authMiddleware,
  roleMiddleware("manufacturer"),
  exportAnalytics
);

// Products CRUD
router.get(
  "/products",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getProducts
);
router.post(
  "/products",
  authMiddleware,
  roleMiddleware("manufacturer"),
  addProduct
);
router.get(
  "/products/:id",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getProduct
);
router.patch(
  "/products/:id",
  authMiddleware,
  roleMiddleware("manufacturer"),
  updateProduct
);
router.delete(
  "/products/:id",
  authMiddleware,
  roleMiddleware("manufacturer"),
  deleteProduct
);

// Batches & History
router.get(
  "/batches",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getBatches
);
router.get(
  "/batch/:id",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getBatchDetail
);
router.get(
  "/batch/:id/download",
  authMiddleware,
  roleMiddleware("manufacturer"),
  downloadBatchCodes
);
router.post("/batch", authMiddleware, roleMiddleware("manufacturer"), addBatch);
router.get(
  "/history",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getManufacturerHistory
);

// Document Management
router.post(
  "/documents/upload",
  authMiddleware,
  roleMiddleware("manufacturer"),
  upload.single("file"),
  uploadDocument
);
router.get(
  "/documents",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getDocuments
);
router.delete(
  "/documents/:documentId",
  authMiddleware,
  roleMiddleware("manufacturer"),
  deleteDocument
);

// Billing & Payment
router.get("/billing/config", getPaymentConfig);
router.post(
  "/billing/initiate-payment",
  authMiddleware,
  roleMiddleware("manufacturer"),
  initiatePayment
);
router.post(
  "/billing/verify-payment",
  authMiddleware,
  roleMiddleware("manufacturer"),
  verifyAndUpgradePlan
);
router.get(
  "/billing/history",
  authMiddleware,
  roleMiddleware("manufacturer"),
  getBillingHistory
);

export default router;
