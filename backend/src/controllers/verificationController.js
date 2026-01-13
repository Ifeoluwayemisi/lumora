import { verifyCode } from "../services/verificationService.js";
import { checkRateLimit } from "../services/rateLimitService.js";
import { decodeQRcode } from "../utils/qrDecoder.js";
import prisma from "../models/prismaClient.js";

/* Helpers */
function normalizeLocation(latitude, longitude) {
  if (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return { latitude, longitude };
  }
  return { latitude: null, longitude: null };
}

async function handleVerification({
  codeValue,
  userId,
  ip,
  latitude,
  longitude,
}) {
  await checkRateLimit(userId, ip);

  const location = normalizeLocation(latitude, longitude);

  return verifyCode({
    codeValue: codeValue.trim().toUpperCase(),
    userId,
    latitude: location.latitude,
    longitude: location.longitude,
  });
}

/*  Controllers  */

/**
 * Manual verification endpoint
 * Allows users to verify a product using a code string
 */
export async function verifyManual(req, res, next) {
  try {
    const { codeValue, latitude, longitude } = req.body;

    // Input validation
    if (!codeValue || typeof codeValue !== "string") {
      return res.status(400).json({
        error: "Code value is required and must be a string",
      });
    }

    if (codeValue.trim().length < 1) {
      return res.status(400).json({
        error: "Code value cannot be empty",
      });
    }

    // Ensure response content type is JSON
    res.setHeader("Content-Type", "application/json");

    const result = await handleVerification({
      codeValue,
      userId: req.user?.id || null,
      ip: req.ip,
      latitude,
      longitude,
    });

    // Return the verification result always, even if UNREGISTERED_PRODUCT
    return res.status(200).json(result);
  } catch (err) {
    console.error("[VERIFY_MANUAL] Error:", err);

    if (err.message === "Rate limit exceeded") {
      return res.status(429).json({ error: err.message });
    }

    // Pass error to global error handler
    next(err);
  }
}

/**
 * QR code verification endpoint
 * Allows users to verify a product by scanning a QR code
 */
export async function verifyQR(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const { qrData, latitude, longitude } = req.body;

    // Input validation
    if (!qrData || typeof qrData !== "string") {
      return res.status(400).json({
        error: "QR data is required and must be a string",
      });
    }

    // Ensure response content type is JSON
    res.setHeader("Content-Type", "application/json");

    // Decode QR code
    let codeValue;
    try {
      codeValue = decodeQRcode(qrData);
    } catch (decodeErr) {
      return res.status(400).json({
        error: "Invalid QR code format",
      });
    }

    if (!codeValue) {
      return res
        .status(400)
        .json({ error: "QR code does not contain valid data" });
    }

    const result = await handleVerification({
      codeValue,
      userId,
      ip: req.ip,
      latitude,
      longitude,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("[VERIFY_QR] Error:", err);

    if (err.message === "Rate limit exceeded") {
      return res.status(429).json({ error: err.message });
    }

    // Pass error to global error handler
    next(err);
  }
}
