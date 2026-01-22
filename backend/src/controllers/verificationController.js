import { verifyCode } from "../services/verificationService.js";
import { checkRateLimit } from "../services/rateLimitService.js";
import { decodeQRcode } from "../utils/qrDecoder.js";
import { sendVerificationNotification } from "../services/notificationService.js";
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

    console.log("[VERIFY_MANUAL] Location data received:", {
      latitude,
      longitude,
    });

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

    // Send notification to manufacturer if code is found
    if (result.code?.manufacturerId) {
      try {
        await sendVerificationNotification({
          manufacturerId: result.code.manufacturerId,
          codeValue,
          verificationState: result.verificationState,
          userEmail: req.user?.email,
          location: { latitude, longitude },
        });

        // Create suspicious activity alert if high-risk verification detected
        if (
          result.verificationState === "SUSPICIOUS_PATTERN" ||
          result.verificationState === "CODE_ALREADY_USED"
        ) {
          const { createSuspiciousActivityAlert, sendSuspiciousActivityEmail } =
            await import("../services/notificationService.js");
          const alertDetails =
            result.verificationState === "SUSPICIOUS_PATTERN"
              ? `⚠️ Suspicious verification pattern detected for code ${codeValue.substring(0, 8)}...`
              : `⚠️ Code ${codeValue.substring(0, 8)}... was already verified`;

          await createSuspiciousActivityAlert(
            result.code.manufacturerId,
            alertDetails,
            result.verificationState,
          );

          // Send email asynchronously (don't block response)
          const location =
            latitude && longitude ? `${latitude}, ${longitude}` : null;
          sendSuspiciousActivityEmail(
            result.code.manufacturerId,
            codeValue,
            result.verificationState,
            alertDetails,
            location,
          ).catch((err) => {
            console.error(
              "[SUSPICIOUS_EMAIL] Failed to send email:",
              err.message,
            );
          });
        }
      } catch (notifError) {
        console.warn("[VERIFY_MANUAL] Notification error:", notifError.message);
        // Don't fail verification because of notification error
      }
    }

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

    // Send notification to manufacturer if code is found
    if (result.code?.manufacturerId) {
      try {
        await sendVerificationNotification({
          manufacturerId: result.code.manufacturerId,
          codeValue,
          verificationState: result.verificationState,
          userEmail: req.user?.email,
          location: { latitude, longitude },
        });

        // Create suspicious activity alert if high-risk verification detected
        if (
          result.verificationState === "SUSPICIOUS_PATTERN" ||
          result.verificationState === "CODE_ALREADY_USED"
        ) {
          const { createSuspiciousActivityAlert, sendSuspiciousActivityEmail } =
            await import("../services/notificationService.js");
          const alertDetails =
            result.verificationState === "SUSPICIOUS_PATTERN"
              ? `⚠️ Suspicious verification pattern detected for code ${codeValue.substring(0, 8)}...`
              : `⚠️ Code ${codeValue.substring(0, 8)}... was already verified`;

          await createSuspiciousActivityAlert(
            result.code.manufacturerId,
            alertDetails,
            result.verificationState,
          );

          // Send email asynchronously (don't block response)
          const location =
            latitude && longitude ? `${latitude}, ${longitude}` : null;
          sendSuspiciousActivityEmail(
            result.code.manufacturerId,
            codeValue,
            result.verificationState,
            alertDetails,
            location,
          ).catch((err) => {
            console.error(
              "[SUSPICIOUS_EMAIL] Failed to send email:",
              err.message,
            );
          });
        }
      } catch (notifError) {
        console.warn("[VERIFY_QR] Notification error:", notifError.message);
        // Don't fail verification because of notification error
      }
    }

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
