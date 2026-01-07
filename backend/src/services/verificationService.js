import prisma from "../models/prismaClient.js";
import { calculateRisk } from "./aiRiskService.js";
import { getTrustDecision } from "./trustDecisionService.js";
import { maybeCreateIncident } from "./incidentService.js";

export async function verifyCode(codeValue, userId = null, location = null) {
    const code = await prisma.code.findUnique({
        where: {codeValue},
        include: { batch: true, manufacturer: true},
    });

    let verificationState;
    let advisory = null;
    let riskScore = 0

    if (!code) {
        verificationState = 'UNREGISTERED_PRODUCT';
        advisory: 'Product not registered; risk assessment not provided';
    } else if (code.isUsed) {
        verificationState = 'CODE_ALREADY_USED';
    } else {
        verificationState = 'GENUINE';
    }

    // Calculate AI risk for all verifications
    const aiResult = await calculateRisk(codeValue, location );
    riskScore = aiResult.riskScore;
    advisory = advisory || aiResult.advisory;

    if (aiResult.suspiciousPattern) verificationState = 'SUSPICIOUS_PATTERN';

    // log verification
    await prisma.verificationLog.create({
        data: {
            codeValue,
            state: verificationState,
            latitude: location?.latitude || null,
            longitude: location?.longitude || null,
            riskScore,
            userId,
        },
    });

    // mark code used if genuine
    if (code && verificationState === 'GENUINE') {
        await prisma.code.update({
            where: { id: code.id},
            data: {isUsed: true, usedAt: new Date() },
        });
    }

    const trustDecision = getTrustDecision({
        state: verificationState,
        riskScore,
    });

    const incident = await maybeCreateIncident({
        codeValue,
        state: verificationState,
        riskScore,
        trustDecision,
    });

    return { verificationState, advisory, riskScore, trustDecision};
}
