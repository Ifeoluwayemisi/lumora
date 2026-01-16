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
} from "../controllers/manufacturerController.js";
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../controllers/documentController.js";

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

// Products CRUD
router.get("/products", getProducts);
router.post("/products", addProduct);
router.get("/products/:id", getProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Batches & History
router.get("/batches", getBatches);
router.get("/batch/:id", getBatchDetail);
router.get("/batch/:id/download", downloadBatchCodes);
router.post("/batch", addBatch);
router.get("/history", getManufacturerHistory);

// Document Management
router.post("/documents/upload", upload.single("file"), uploadDocument);
router.get("/documents", getDocuments);
router.delete("/documents/:documentId", deleteDocument);

export default router;
