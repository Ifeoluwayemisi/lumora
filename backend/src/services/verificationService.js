import prisma from "../models/prismaClient.js";
import { calculateRisk } from "./aiRiskService.js";
import { getTrustDecision } from "./trustDecisionService.js";
import { maybeCreateIncident } from "./incidentService.js";

export async function verifyCode({
  codeValue,
  userId = null,
  latitude = null,
  longitude = null,
}) {
  //Find code
  const code = await prisma.code.findFirst({
    where: { codeValue },
    include: {
      batch: { include: { product: true } },
      manufacturer: true,
    },
  });

  let verificationState;
  let advisory = null;
  let riskScore = 0;

  // Base verification state
  if (!code) {
    verificationState = "UNREGISTERED_PRODUCT";
  } else if (code.isUsed) {
    verificationState = "CODE_ALREADY_USED";
  } else {
    verificationState = "GENUINE";
  }

  // AI Risk analysis (always run)
  const aiResult = await calculateRisk(codeValue, {
    latitude,
    longitude,
    verificationState,
  });

  riskScore = aiResult?.riskScore || 0;
  advisory = aiResult?.advisory || null;

  // Override state if suspicious
  if (aiResult?.suspiciousPattern) {
    verificationState = "SUSPICIOUS_PATTERN";
  }

  // Log verification
 await prisma.verificationLog.create({
   data: {
     codeValue,
     ...(code ? { codeId: code.id } : {}),
     userId,
     latitude,
     longitude,
     verificationState,
     riskScore,
   },
 });

  // Mark code as used (only if genuinely verified)
  if (code && verificationState === "GENUINE") {
    await prisma.code.update({
      where: { id: code.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
  }

  // Trust decision
  const trustDecision = getTrustDecision({
    state: verificationState,
    riskScore,
  });

  // Incident creation (centralized logic)
  await maybeCreateIncident({
    codeValue,
    state: verificationState,
    riskScore,
    trustDecision,
    latitude,
    longitude,
  });

  // Final response
  return {
    codeValue,
    product: code?.batch?.product?.name || "External / Unregistered",
    verificationState,
    riskScore,
    advisory,
    trustDecision,
  };
}
