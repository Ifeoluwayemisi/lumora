import express from "express";
import {
  getUserHistory,
  addFavorite,
  getFavorites,
  removeFavorite,
  markNotificationRead,
  getNotifications,
  getUserDashboard,
  exportUserHistory,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Auth first, then role
router.use(authMiddleware, roleMiddleware("CONSUMER", "ADMIN"));

router.get("/history", getUserHistory);
router.post("/favorites", addFavorite);
router.get("/favorites", getFavorites);
router.delete("/favorite/:id", removeFavorite);
router.get("/notifications", getNotifications);
router.patch("/notifications/:id", markNotificationRead);
router.get("/dashboard", getUserDashboard);
router.get("/history/export", exportUserHistory); // ?format=csv|pdf|json

export default router;
