import prisma from "../models/prismaClient.js";
import { calculateRisk } from "./aiRiskService.js";
import { getTrustDecision } from "./trustDecisionService.js";
import { maybeCreateIncident } from "./incidentService.js";
import { generateProductGuide } from "./aiProductGuideService.js";

/**
 * Generate AI-driven safety tips based on verification state and risk score
 * Makes AI features visible and actionable for users
 */
function generateSafetyTips(verificationState, riskScore) {
  const tips = [];

  switch (verificationState) {
    case "GENUINE":
      if (riskScore <= 20) {
        tips.push("✓ This product passed all authenticity checks.");
        tips.push("✓ Safe to use. No suspicious activity detected.");
      } else if (riskScore <= 50) {
        tips.push("✓ Product is registered and verified.");
        tips.push(
          "⚠ Minor risk factors detected. Please verify with seller if uncertain.",
        );
      }
      break;

    case "CODE_ALREADY_USED":
      tips.push("⚠ HIGH RISK: This code has already been verified before.");
      tips.push(
        "⚠ Counterfeit products often reuse codes. Verify batch number with manufacturer.",
      );
      tips.push(
        "💡 Contact the manufacturer directly to report suspicious activity.",
      );
      break;

    case "UNREGISTERED_PRODUCT":
      if (riskScore >= 70) {
        tips.push(
          "⚠ VERY HIGH RISK: Product not registered with any manufacturer.",
        );
        tips.push(
          "⚠ Unregistered products show suspicious patterns typical of counterfeits.",
        );
        tips.push("❌ DO NOT USE this product. Report to NAFDAC immediately.");
      } else if (riskScore >= 50) {
        tips.push("⚠ MEDIUM RISK: Product not registered. May be counterfeit.");
        tips.push("💡 Verify directly with manufacturer or contact NAFDAC.");
      } else {
        tips.push("ℹ This product is not registered in our system.");
        tips.push("💡 Ask the seller for the official manufacturer contact.");
      }
      break;

    case "SUSPICIOUS_PATTERN":
      tips.push("⚠ ALERT: AI detected suspicious activity patterns.");
      tips.push(
        `⚠ Risk Score: ${riskScore}/100 - Pattern suggests possible counterfeit activity.`,
      );
      tips.push(
        "🚨 Report to NAFDAC with: Product name, code, location, and date.",
      );
      tips.push("📞 NAFDAC Report Line: 08037020131");
      break;

    case "INVALID":
      tips.push(
        "❌ Invalid code format. This is not a Lumora verification code.",
      );
      tips.push(
        "💡 Lumora codes start with 'LUM'. Check the code and try again.",
      );
      break;

    default:
      tips.push("Verification completed. Please check the status above.");
  }

  return tips;
}

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

  console.log("[VERIFY] Code lookup result:", {
    searchedFor: normalizedCode,
    found: !!code,
    codeId: code?.id || null,
    batchId: code?.batch?.id || null,
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

  // Generate AI-driven product guide (usage instructions, warnings, storage tips)
  const productGuide = await generateProductGuide({
    productName: code?.batch?.product?.name || "Unregistered Product",
    category: code?.batch?.product?.category || "general",
    riskScore,
    verificationState,
    description: code?.batch?.product?.description,
  });

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
      guide: productGuide,
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
      safetyTips: generateSafetyTips(verificationState, riskScore),
      riskLevel:
        riskScore >= 70
          ? "VERY HIGH"
          : riskScore >= 50
            ? "HIGH"
            : riskScore >= 30
              ? "MEDIUM"
              : "LOW",
    },
  };
}
