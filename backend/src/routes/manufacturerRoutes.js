import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  addProduct,
  addBatch,
  getManufacturerHistory,
  getManufacturerProducts,
  getManufacturerBatches,
  getProductDetails,
  deleteProduct,
} from "../controllers/manufacturerController.js";

const router = express.Router();

// Only authenticated manufacturers
router.use(authMiddleware, roleMiddleware("MANUFACTURER"));

// Product endpoints
router.post("/products", addProduct);
router.get("/products", getManufacturerProducts);
router.get("/products/:productId", getProductDetails);
router.delete("/products/:productId", deleteProduct);

// Batch endpoints
router.post("/batch", addBatch);
router.get("/batches", getManufacturerBatches);

// History endpoint
router.get("/history", getManufacturerHistory);

export default router;
