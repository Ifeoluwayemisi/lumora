import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  addProduct,
  addBatch,
  getManufacturerHistory,
} from "../controllers/manufacturerController.js";

const router = express.Router();

// Only authenticated manufacturers
router.use(authMiddleware, roleMiddleware("MANUFACTURER"));

router.post("/products", addProduct);
router.post("/batch", addBatch);
router.get("/history", getManufacturerHistory);

export default router;
