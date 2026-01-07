import { verifyCode } from "../services/verificationService.js";
import { checkRateLimit } from "../services/rateLimitService.js";
import { decodeQRcode } from "../utils/qrDecoder.js"; // utility to decode content
import { error } from "console";

/*  Helpers  */

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
  return null;
}

async function handleVerification({
  codeValue,
  userId,
  ip,
  latitude,
  longitude,
}) {
  await checkRateLimit(userId, ip);

  return verifyCode(
    codeValue.trim(),
    userId,
    normalizeLocation(latitude, longitude)
  );
}

/*  Controllers  */

export async function verifyManual(req, res) {
  try {
    const { codeValue, latitude, longitude } = req.body;

    if (!codeValue) {
      return res.status(400).json({ error: "Code value is required" });
    }

    const result = await handleVerification({
      codeValue,
      userId: req.user?.id || null,
      ip: req.ip,
      latitude,
      longitude,
    });

    return res.status(200).json(result);
  } catch (err) {
    if (err.message === "Rate limit exceeded") {
      return res.status(429).json({ error: err.message });
    }

    console.error("Manual verification error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
}

export async function verifyQR(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Authentication required for QR verification" });
    }

    const { qrData, latitude, longitude } = req.body;

    if (!qrData) {
      return res.status(400).json({ error: "QR data is required" });
    }

    // Decode QR → actual product code
    const codeValue = decodeQRcode(qrData);
    if (!codeValue) {
      return res.status(400).json({ error: "Invalid QR data" });
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
    if (err.message === "Rate limit exceeded") {
      return res.status(429).json({ error: err.message });
    }

    console.error("QR verification error:", err);
    return res.status(500).json({ error: "QR verification failed" });
  }
}
