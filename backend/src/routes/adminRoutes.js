import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

import {
  listVerifications,
  listIncidents,
  listHighRiskCodes,
  listPredictedHotspots,
} from "../controllers/adminController.js";

import {
  triggerMigrations,
  checkDatabaseStatus,
} from "../controllers/systemController.js";

import {
  getPendingManufacturers,
  getManufacturerApplication,
  approveManufacturer,
  requestMoreInfo,
  rejectManufacturer,
  getAllManufacturers,
} from "../controllers/manufacturerReviewController.js";

import {
  getAllDisputes,
  getDisputeDetails,
  fileDispute,
  startInvestigation,
  resolveDispute,
  approveRefund,
  rejectDisputeRequest,
  getStats,
} from "../controllers/disputeController.js";

const router = express.Router();

//auth and admin routes
router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

//routes
router.get("/verification/log", listVerifications); //paginated
router.get("/incidents", listIncidents); //optional status filter
router.get("/high-risk-codes", listHighRiskCodes);
router.get("/hotspots/predicted", listPredictedHotspots); //optional ai layer

// Manufacturer Review Endpoints
router.get("/manufacturers/pending", getPendingManufacturers);
router.get("/manufacturers", getAllManufacturers);
router.get("/manufacturers/:manufacturerId", getManufacturerApplication);
router.patch("/manufacturers/:manufacturerId/approve", approveManufacturer);
router.patch("/manufacturers/:manufacturerId/request-info", requestMoreInfo);
router.patch("/manufacturers/:manufacturerId/reject", rejectManufacturer);

// System management endpoints
router.post("/system/migrate", triggerMigrations);
router.get("/system/database-status", checkDatabaseStatus);

// Dispute Resolution Endpoints
router.get("/disputes/stats/overview", getStats);
router.get("/disputes", getAllDisputes);
router.get("/disputes/:id", getDisputeDetails);
router.post("/disputes", fileDispute);
router.patch("/disputes/:id/investigate", startInvestigation);
router.patch("/disputes/:id/resolve", resolveDispute);
router.patch("/disputes/:id/refund", approveRefund);
router.patch("/disputes/:id/reject", rejectDisputeRequest);

export default router;
