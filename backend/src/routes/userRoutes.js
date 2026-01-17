import express from "express";
import multer from "multer";
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
  uploadProfilePicture,
  getUserProfile,
} from "../controllers/userController.js";
import {
  deleteNotification,
  markAllNotificationsRead,
  clearReadNotifications,
  getUnreadCount,
} from "../controllers/notificationController.js";
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Auth first, then role
router.use(authMiddleware, roleMiddleware("CONSUMER", "ADMIN"));

// Profile endpoints
router.get("/profile", getUserProfile);
router.patch("/profile", updateUserProfile);
router.patch(
  "/profile-picture",
  upload.single("profilePicture"),
  uploadProfilePicture
);
router.patch("/password", changeUserPassword);
router.delete("/account", deleteUserAccount);

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
router.get("/notifications/unread-count", getUnreadCount);
router.patch("/notifications/:id", markNotificationRead);
router.delete("/notifications/:id", deleteNotification);
router.patch("/notifications/mark-all-read", markAllNotificationsRead);
router.delete("/notifications/clear-read", clearReadNotifications);

// Settings endpoints
router.get("/settings", getUserSettings);
router.patch("/settings", updateUserSettings);

// Dashboard endpoints
router.get("/dashboard", getUserDashboard);
router.get("/dashboard-summary", getDashboardSummary);

export default router;
