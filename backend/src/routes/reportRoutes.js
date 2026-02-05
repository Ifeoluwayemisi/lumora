import express from "express";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/authMiddleware.js";
import upload, { handleUploadError } from "../middleware/uploadMiddleware.js";
import {
  submitReport,
  getReports,
  getReport,
  updateReportStatus,
  getReportsByCode,
} from "../controllers/reportController.js";

const router = express.Router();

// Submit a report (optional auth - allows guest reports)
// Handles file upload with error handling
router.post(
  "/submit",
  upload.single("image"),
  handleUploadError,
  optionalAuthMiddleware,
  submitReport,
);

// Get all reports (admin only)
router.get("/", authMiddleware, getReports);

// Get a single report (admin only)
router.get("/:id", authMiddleware, getReport);

// Update report status (admin only)
router.patch("/:id", authMiddleware, updateReportStatus);

// Get reports for a specific code
router.get("/code/:codeValue", getReportsByCode);

export default router;
