import express from "express";
import { contactController } from "../controllers/contactController.js";

const router = express.Router();

/**
 * Contact Form Routes
 * Public endpoint - no authentication required
 */

// Submit contact form
router.post("/contact", contactController.submitContact);

export default router;
