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
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
  getUserSettings,
  updateUserSettings,
  clearUserHistory,
  getDashboardSummary,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Auth first, then role
router.use(authMiddleware, roleMiddleware("CONSUMER", "ADMIN"));

// History endpoints
router.get("/history", getUserHistory);
router.get("/history/export", exportUserHistory); // ?format=csv|json|pdf
router.delete("/history", clearUserHistory);

// Favorites endpoints
router.post("/favorites", addFavorite);
router.get("/favorites", getFavorites);
router.delete("/favorite/:id", removeFavorite);

// Notifications endpoints
router.get("/notifications", getNotifications);
router.patch("/notifications/:id", markNotificationRead);

// Profile endpoints
router.patch("/profile", updateUserProfile);
router.patch("/password", changeUserPassword);
router.delete("/account", deleteUserAccount);

// Settings endpoints
router.get("/settings", getUserSettings);
router.patch("/settings", updateUserSettings);

// Dashboard endpoints
router.get("/dashboard", getUserDashboard);
router.get("/dashboard-summary", getDashboardSummary);

export default router;
