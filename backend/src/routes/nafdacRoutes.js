import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { nafdacAuthController } from "../controllers/nafdacAuthController.js";
import {
  listIncidents,
  updateIncident,
  getHotspotData,
  getPredictedHotspotsData,
  getDashboardMetrics,
  getProductsList,
  blockProduct,
  getReportsList,
  escalateReport,
  getManufacturersList,
  getAuditLogs,
} from "../controllers/nafdacController.js";

const router = express.Router();

/**
 * PUBLIC ROUTES (No authentication required)
 */
// Step 1: Email and password verification
router.post("/auth/login/step1", nafdacAuthController.loginStep1);

// Step 2: 2FA code verification
router.post("/auth/login/step2", nafdacAuthController.loginStep2);

/**
 * PROTECTED ROUTES (Authentication required)
 */
router.use(authMiddleware);
router.use(roleMiddleware("NAFDAC", "ADMIN"));

// Get current user profile
router.get("/auth/profile", (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

// Logout endpoint
router.post("/auth/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// Existing endpoints
router.get("/incidents", listIncidents);
router.patch("/incidents/:incidentId/status", updateIncident);
router.get("/hotspots", getHotspotData);
router.get("/hotspots/predicted", getPredictedHotspotsData);

// Dashboard endpoints
router.get("/dashboard", getDashboardMetrics);

// Products endpoints
router.get("/products", getProductsList);
router.post("/products/:productId/block", blockProduct);

// Reports endpoints
router.get("/reports", getReportsList);
router.post("/reports/:reportId/escalate", escalateReport);

// Manufacturers endpoints
router.get("/manufacturers", getManufacturersList);

// Audit logs endpoints
router.get("/audit-logs", getAuditLogs);

export default router;
