import prisma from "../models/prismaClient.js";
import { calculateRisk } from "./aiRiskService.js";
import { getTrustDecision } from "./trustDecisionService.js";
import { maybeCreateIncident } from "./incidentService.js";

/**
 * Core verification logic
 * Checks code validity and performs risk analysis
 */
export async function verifyCode({
  codeValue,
  userId = null,
  latitude = null,
  longitude = null,
}) {
  // Normalize code value for consistent comparison
  const normalizedCode = codeValue?.trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error("Code value is required");
  }

  // Find code in database
  const code = await prisma.code.findFirst({
    where: { codeValue: normalizedCode },
    include: {
      batch: {
        include: {
          product: true,
          manufacturer: true,
        },
      },
      manufacturer: true,
    },
  });

  let verificationState;
  let advisory = null;
  let riskScore = 0;

  // Determine base verification state
  if (!code) {
    verificationState = "UNREGISTERED_PRODUCT";
  } else if (code.isUsed) {
    verificationState = "CODE_ALREADY_USED";
  } else {
    // Check expiration
    if (code.batch.expirationDate && code.batch.expirationDate < new Date()) {
      verificationState = "PRODUCT_EXPIRED";
    } else {
      verificationState = "GENUINE";
    }
  }

  // AI Risk analysis (always run if enabled)
  let aiResult = null;
  if (process.env.ENABLE_AI_RISK === "true") {
    try {
      aiResult = await calculateRisk(normalizedCode, {
        latitude,
        longitude,
        verificationState,
      });

      riskScore = aiResult?.riskScore || 0;
      advisory = aiResult?.advisory || null;

      // Override state if suspicious pattern detected
      if (aiResult?.suspiciousPattern) {
        verificationState = "SUSPICIOUS_PATTERN";
      }
    } catch (aiError) {
      console.error("[VERIFY] AI risk analysis failed:", aiError.message);
      // Continue with verification even if AI fails
    }
  }

  // Log verification attempt
  try {
    await prisma.verificationLog.create({
      data: {
        codeValue: normalizedCode,
        ...(code ? { codeId: code.id } : {}),
        ...(code?.batch ? { batchId: code.batch.id } : {}),
        ...(code?.manufacturer ? { manufacturerId: code.manufacturer.id } : {}),
        userId,
        latitude,
        longitude,
        verificationState,
        riskScore,
      },
    });
  } catch (logError) {
    console.error("[VERIFY] Failed to log verification:", logError.message);
    // Don't fail the verification if logging fails
  }

  // Mark code as used (only if genuinely verified and not already used)
  if (code && verificationState === "GENUINE" && !code.isUsed) {
    try {
      await prisma.code.update({
        where: { id: code.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });
    } catch (updateError) {
      console.error(
        "[VERIFY] Failed to mark code as used:",
        updateError.message
      );
      // Don't fail the verification if this fails
    }
  }

  // Determine trust decision
  const trustDecision = getTrustDecision({
    state: verificationState,
    riskScore,
  });

  // Create incident if needed (suspicious activity)
  if (verificationState === "SUSPICIOUS_PATTERN" || riskScore > 70) {
    try {
      await maybeCreateIncident({
        codeValue: normalizedCode,
        state: verificationState,
        riskScore,
        trustDecision,
        latitude,
        longitude,
      });
    } catch (incidentError) {
      console.error(
        "[VERIFY] Failed to create incident:",
        incidentError.message
      );
      // Don't fail the verification if incident creation fails
    }
  }

  // Return verification result
  return {
    codeValue: normalizedCode,
    product: code?.batch?.product?.name || "Unregistered Product",
    manufacturer: code?.manufacturer?.name || null,
    batch: code?.batch?.batchNumber || null,
    verificationState,
    riskScore,
    advisory,
    trustDecision,
    timestamp: new Date().toISOString(),
  };
}
