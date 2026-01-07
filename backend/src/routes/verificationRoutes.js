import express from "express";
import {
  verifyManual,
  verifyQR,
} from "../controllers/verificationController.js";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manual verification → authenticated OR guest
router.post("/manual", optionalAuthMiddleware, verifyManual);

// QR verification → authenticated users only
router.post("/qr", authMiddleware, verifyQR);

export default router;
