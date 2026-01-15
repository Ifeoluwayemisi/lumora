import express from "express";
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
  getManufacturerHistory,
} from "../controllers/manufacturerController.js";

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
router.post("/batch", addBatch);
router.get("/history", getManufacturerHistory);

export default router;
