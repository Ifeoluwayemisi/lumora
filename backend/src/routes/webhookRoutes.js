import express from "express";
import crypto from "crypto";
import { handlePaystackWebhook } from "../controllers/webhookController.js";

const router = express.Router();

router.post(
  "/paystack",
  express.raw({ type: "application/json" }),
  handlePaystackWebhook
);

export default router;
