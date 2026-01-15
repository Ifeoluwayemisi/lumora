import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  getDashboard,
  addProduct,
  addBatch,
  getManufacturerHistory,
} from "../controllers/manufacturerController.js";

const router = express.Router();

// Only authenticated manufacturers
router.use(authMiddleware, roleMiddleware("MANUFACTURER"));

// Dashboard
router.get("/dashboard", getDashboard);

// Products & Batches
router.post("/products", addProduct);
router.post("/batch", addBatch);
router.get("/history", getManufacturerHistory);

export default router;
