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
          manufacturer: true,
          product: true,
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
    // Check expiration (safely access batch)
    if (
      code.batch &&
      code.batch.expirationDate &&
      code.batch.expirationDate < new Date()
    ) {
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
    // Get manufacturerId from code (direct relation) or batch
    const manufactureIdToLog =
      code?.manufacturerId || code?.batch?.manufacturerId;

    console.log("[VERIFY] Creating verification log with:", {
      codeValue: normalizedCode,
      codeId: code?.id || null,
      batchId: code?.batch?.id || null,
      manufacturerId: manufactureIdToLog || null,
      userId: userId || null,
      latitude,
      longitude,
      verificationState,
      riskScore,
    });

    const logRecord = await prisma.verificationLog.create({
      data: {
        codeValue: normalizedCode,
        ...(code ? { codeId: code.id } : {}),
        ...(code?.batch ? { batchId: code.batch.id } : {}),
        ...(manufactureIdToLog ? { manufacturerId: manufactureIdToLog } : {}),
        userId,
        latitude,
        longitude,
        verificationState,
        riskScore,
      },
    });

    console.log(
      "[VERIFY] ✅ Verification log created successfully:",
      logRecord.id,
    );
  } catch (logError) {
    console.error("[VERIFY] ❌ Failed to log verification:", logError.message);
    console.error("[VERIFY] Error code:", logError.code);
    console.error("[VERIFY] Error meta:", logError.meta);
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
          usedCount: {
            increment: 1,
          },
          firstVerifiedAt: code.firstVerifiedAt || new Date(),
        },
      });
    } catch (updateError) {
      console.error(
        "[VERIFY] Failed to mark code as used:",
        updateError.message,
      );
      // Don't fail the verification if this fails
    }
  } else if (code && code.isUsed) {
    // If code already used, still increment usedCount on subsequent verifications
    try {
      await prisma.code.update({
        where: { id: code.id },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    } catch (updateError) {
      console.error(
        "[VERIFY] Failed to increment code usage count:",
        updateError.message,
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
        incidentError.message,
      );
      // Don't fail the verification if incident creation fails
    }
  }

  // Return verification result with complete product information
  // Note: For GENUINE codes, isUsed will become true after verification, but we return the actual updated state
  const codeIsUsedAfterVerification =
    verificationState === "GENUINE" ? true : code?.isUsed || false;

  return {
    codeValue: normalizedCode,
    product: {
      name: code?.batch?.product?.name || "Unregistered Product",
      description: code?.batch?.product?.description || null,
      category: code?.batch?.product?.category || null,
      manufacturer:
        code?.batch?.manufacturer?.companyName ||
        code?.batch?.manufacturer?.name ||
        code?.batch?.manufacturer?.company ||
        "Unknown",
      manufacturerEmail: code?.batch?.manufacturer?.email || null,
      manufacturerPhone: code?.batch?.manufacturer?.phone || null,
    },
    batch: {
      batchNumber: code?.batch?.batchNumber || null,
      expirationDate: code?.batch?.expirationDate?.toISOString() || null,
      manufacturingDate: code?.batch?.manufacturingDate?.toISOString() || null,
      quantity: code?.batch?.quantity || null,
    },
    code: {
      codeValue: normalizedCode,
      isUsed: codeIsUsedAfterVerification,
      usedCount:
        (code?.usedCount || 0) + (verificationState === "GENUINE" ? 1 : 0),
      usedAt:
        verificationState === "GENUINE"
          ? new Date().toISOString()
          : code?.usedAt?.toISOString() || null,
      firstVerifiedAt:
        code?.firstVerifiedAt?.toISOString() || new Date().toISOString(),
    },
    verification: {
      state: verificationState,
      riskScore,
      advisory,
      trustDecision,
      timestamp: new Date().toISOString(),
    },
  };
}
