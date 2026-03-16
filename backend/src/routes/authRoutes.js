import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import {
  getGoogleAuthUrl,
  googleCallback,
  verifyGoogleToken,
} from "../controllers/googleAuthController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Google OAuth routes
router.get("/google/url", getGoogleAuthUrl);
router.get("/google/callback", googleCallback);
router.post("/google/verify", verifyGoogleToken);

export default router;
