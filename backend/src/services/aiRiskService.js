import OpenAI from "openai";
import prisma from "../models/prismaClient.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calculate risk score based on verification patterns
 * @param {string} codeValue - Product code being verified
 * @param {Object} context - Verification context
 * @returns {{ riskScore: number (0-100), suspiciousPattern: boolean, advisory: string | null }}
 */
export async function calculateRisk(codeValue, context = {}) {
  try {
    // Get historical verification logs for this code
    const logs = await prisma.verificationLog.findMany({
      where: { codeValue },
      orderBy: { createdAt: "desc" },
      take: 20, // Increased to 20 for better pattern analysis
    });

    let riskScore = 0;
    let suspiciousPattern = false;
    const advisories = [];

    // Rule 1: Multiple locations within 1 hour = suspicious
    if (logs.length > 1) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentLogs = logs.filter((l) => l.createdAt >= oneHourAgo);

      if (recentLogs.length > 1) {
        const locations = recentLogs
          .filter((l) => l.latitude && l.longitude)
          .map((l) => `${l.latitude},${l.longitude}`);
        const uniqueLocations = new Set(locations);

        if (uniqueLocations.size > 1) {
          riskScore += 50; // 50 points for multiple locations
          suspiciousPattern = true;
          advisories.push(
            `${uniqueLocations.size} unique locations in last hour`,
          );
        }
      }
    }

    // Rule 1b: Geographic clustering - codes from same batch verified across >3 states
    if (logs.length >= 3 && context.batchId) {
      const batch = await prisma.batch.findUnique({
        where: { id: context.batchId },
      });

      if (batch) {
        const verifiedStates = [
          ...new Set(logs.map((l) => l.state).filter(Boolean)),
        ];
        if (verifiedStates.length > 3) {
          riskScore += 35;
          suspiciousPattern = true;
          advisories.push(
            `Batch verified across ${verifiedStates.length} states`,
          );
        }
      }
    }

    // Rule 2: Rapid verification frequency = suspicious
    if (logs.length >= 5) {
      const firstLogTime = logs[logs.length - 1].createdAt;
      const lastLogTime = logs[0].createdAt;
      const timeSpanHours = (lastLogTime - firstLogTime) / (1000 * 60 * 60);

      // More than 5 verifications in less than 24 hours is suspicious
      if (timeSpanHours < 24) {
        const verificationRate = logs.length / Math.max(timeSpanHours, 1);
        if (verificationRate > 2) {
          // >2 verifications per hour
          riskScore += 40;
          suspiciousPattern = true;
          advisories.push(
            `High verification rate: ${verificationRate.toFixed(1)}/hour`,
          );
        }
      }
    }

    // Rule 3: Unregistered product + high frequency = very suspicious
    if (
      context.verificationState === "UNREGISTERED_PRODUCT" &&
      logs.length >= 3
    ) {
      riskScore += 25;
      suspiciousPattern = true;
      advisories.push("Unregistered product verified multiple times");
    }

    // Rule 4: Code reuse detection (code already used before)
    const genuineLogs = logs.filter((l) => l.verificationState === "GENUINE");
    const fakeLogs = logs.filter(
      (l) =>
        l.verificationState === "FAKE" ||
        l.verificationState === "SUSPICIOUS_PATTERN",
    );

    if (genuineLogs.length > 0 && fakeLogs.length > 0) {
      // Mix of genuine and fake = counterfeit batch
      riskScore += 60;
      suspiciousPattern = true;
      advisories.push("Mixed genuine/counterfeit pattern detected");
    }

    // Rule 5: Temporal anomalies - verifications at odd hours
    const oddHourVerifications = logs.filter((l) => {
      const hour = new Date(l.createdAt).getHours();
      return hour < 6 || hour > 23; // Outside 6 AM - 11 PM
    }).length;

    if (oddHourVerifications > logs.length * 0.3) {
      riskScore += 20;
      advisories.push("Unusual verification times detected");
    }

    // Normalize score to 0-100
    riskScore = Math.min(riskScore, 100);

    // Optional: AI Enhancement (if enabled and has logs to analyze)
    if (
      process.env.ENABLE_AI_RISK === "true" &&
      process.env.OPENAI_API_KEY &&
      logs.length > 0
    ) {
      try {
        const prompt = `You are a medicine supply chain risk analyst. Analyze these verification events and return a JSON response.

IMPORTANT: Respond with ONLY valid JSON, no other text.

Verification logs for code "${codeValue}":
${logs
  .slice(0, 5)
  .map(
    (l, i) =>
      `${i + 1}. Time: ${new Date(l.createdAt).toISOString()}, ` +
      `State: ${l.verificationState}, ` +
      `Risk: ${l.riskScore}, ` +
      `Location: ${l.latitude ? `${l.latitude},${l.longitude}` : "unknown"}`,
  )
  .join("\n")}

Current verification state: ${context.verificationState || "UNKNOWN"}
Current risk score: ${riskScore}

Analyze for suspicious patterns. Return this JSON:
{
  "riskScore": <number 0-100>,
  "suspiciousPattern": <boolean>,
  "advisory": "<string or null>"
}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 200,
        });

        const aiResponse = completion.choices[0]?.message?.content?.trim();

        if (aiResponse) {
          try {
            // Extract JSON from response (in case of extra text)
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
            const parsed = JSON.parse(jsonStr);

            // Take the higher risk score
            if (typeof parsed.riskScore === "number") {
              riskScore = Math.max(riskScore, Math.min(parsed.riskScore, 100));
            }

            // Mark as suspicious if AI says so
            if (parsed.suspiciousPattern === true) {
              suspiciousPattern = true;
            }

            // Add AI advisory
            if (parsed.advisory && typeof parsed.advisory === "string") {
              advisories.push(`AI: ${parsed.advisory}`);
            }
          } catch (parseErr) {
            console.warn(
              "[AI_RISK] Failed to parse AI response:",
              parseErr.message,
            );
            // Continue with rule-based scoring
          }
        }
      } catch (aiErr) {
        console.warn("[AI_RISK] AI analysis failed:", aiErr.message);
        // Continue with rule-based scoring - don't fail the verification
      }
    }

    return {
      riskScore,
      suspiciousPattern,
      advisory: advisories.length > 0 ? advisories.join(" | ") : null,
    };
  } catch (err) {
    console.error("[CALCULATE_RISK] Unexpected error:", err);
    // Return safe default on error
    return {
      riskScore: 20, // Default low-medium risk
      suspiciousPattern: false,
      advisory: "Risk analysis unavailable",
    };
  }
}

/**
 * Dynamically recalculate risk score for manufacturer based on recent verification patterns
 * Called periodically (daily/weekly) to update manufacturer trust level
 * @param {string} manufacturerId - Manufacturer ID
 * @returns {{ riskScore: number, trustScore: number, summary: string }}
 */
export async function recalculateManufacturerRiskScore(manufacturerId) {
  try {
    console.log(
      "[AI_RISK] Starting risk calculation for manufacturerId:",
      manufacturerId,
    );

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      include: {
        batches: {
          include: {
            codes: true,
          },
        },
      },
    });

    if (!manufacturer) throw new Error("Manufacturer not found");

    console.log(
      "[AI_RISK] Manufacturer found:",
      manufacturer.name,
      "- Verified:",
      manufacturer.verified,
      "NAFDAC:",
      manufacturer.nafdacLicenseVerified,
      "Business Cert:",
      manufacturer.businessCertificateVerified,
    );

    // Get verification logs for all batches
    const verificationLogs = await prisma.verificationLog.findMany({
      where: {
        code: {
          batch: {
            manufacturerId, // ✅ Correct: manufacturerId is directly on batch
          },
        },
      },
      include: {
        code: {
          include: {
            batch: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500, // Last 500 verifications
    });

    if (verificationLogs.length === 0) {
      // No verification history - use manufacturer metadata for scoring
      // New manufacturers without verification history get neutral but verifiable scores

      console.log(
        "[AI_RISK] No verification logs found - using document verification fallback",
      );

      // Check if manufacturer documents are verified
      let documentScore = 50;
      if (
        manufacturer.nafdacLicenseVerified ||
        manufacturer.businessCertificateVerified
      ) {
        documentScore = 35; // Lower risk if documents verified
        console.log("[AI_RISK] Documents verified - using score 35");
      }
      if (
        !manufacturer.nafdacLicenseVerified &&
        !manufacturer.businessCertificateVerified
      ) {
        documentScore = 65; // Higher risk if no documents verified
        console.log("[AI_RISK] No documents verified - using score 65");
      }

      // Check if manufacturer is verified
      const verificationBonus = manufacturer.verified ? -10 : 0;

      const calculatedScore = Math.min(
        100,
        Math.max(0, documentScore + verificationBonus),
      );

      console.log(
        "[AI_RISK] Fallback calculation: baseScore=" +
          documentScore +
          ", verificationBonus=" +
          verificationBonus +
          ", finalRiskScore=" +
          calculatedScore,
      );

      return {
        riskScore: calculatedScore,
        trustScore: 100 - calculatedScore,
        summary: `New manufacturer - Risk based on document verification: ${manufacturer.verified ? "Verified" : "Not verified"}. NAFDAC: ${manufacturer.nafdacLicenseVerified ? "✓" : "✗"}, Business Cert: ${manufacturer.businessCertificateVerified ? "✓" : "✗"}`,
      };
    }

    let riskScore = 0;
    const lastMonthLogs = verificationLogs.filter((l) => {
      return (
        new Date(l.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
    });

    // Calculate metrics
    const totalVerifications = verificationLogs.length;
    const genuineCount = verificationLogs.filter(
      (l) => l.verificationState === "GENUINE",
    ).length;
    const genuineRate = (genuineCount / totalVerifications) * 100;

    const fakeCount = verificationLogs.filter(
      (l) =>
        l.verificationState === "SUSPICIOUS_PATTERN" ||
        l.verificationState === "CODE_ALREADY_USED",
    ).length;
    const fakeRate = (fakeCount / totalVerifications) * 100;

    const expiredCount = verificationLogs.filter(
      (l) => l.verificationState === "PRODUCT_EXPIRED",
    ).length;
    const expiredRate = (expiredCount / totalVerifications) * 100;

    // Risk scoring (0-100)
    // Lower fake rate = lower risk
    if (genuineRate < 80) {
      riskScore += 30; // >20% fake/suspicious
    } else if (genuineRate < 90) {
      riskScore += 15; // 10-20% fake
    } // else >90% genuine = no penalty

    // High expiration rate = poor batch management
    if (expiredRate > 10) {
      riskScore += 25;
    } else if (expiredRate > 5) {
      riskScore += 10;
    }

    // Geographic clustering (codes from same batch in too many regions)
    const batches = manufacturer.batches;
    let geographicSpread = 0;
    for (const batch of batches) {
      const batchVerifications = verificationLogs.filter(
        (l) => l.code?.batchId === batch.id,
      );
      const states = new Set(
        batchVerifications.map((l) => l.state).filter(Boolean),
      );
      if (states.size > 5) {
        geographicSpread++;
      }
    }

    if (geographicSpread > 0) {
      riskScore += Math.min(geographicSpread * 5, 25);
    }

    // Recent trend analysis (last 30 days)
    if (lastMonthLogs.length > 10) {
      const recentFakeRate =
        (lastMonthLogs.filter(
          (l) =>
            l.verificationState === "SUSPICIOUS_PATTERN" ||
            l.verificationState === "CODE_ALREADY_USED",
        ).length /
          lastMonthLogs.length) *
        100;

      // If fake rate is increasing, penalize
      if (recentFakeRate > fakeRate) {
        riskScore += 15;
      }
    }

    // Cap at 100
    riskScore = Math.min(riskScore, 100);

    // Trust score is inverse of risk (100 - risk)
    const trustScore = 100 - riskScore;

    const summary = `Genuine: ${genuineRate.toFixed(1)}% | Fake: ${fakeRate.toFixed(1)}% | Expired: ${expiredRate.toFixed(1)}% | Geographic spread: ${geographicSpread} batches`;

    // Update manufacturer record with new risk score
    await prisma.manufacturer.update({
      where: { id: manufacturerId },
      data: {
        riskScore: riskScore,
        trustScore: trustScore,
        lastRiskAssessment: new Date(),
      },
    });

    console.log(
      "[AI_RISK] ✅ Calculation complete for manufacturerId:",
      manufacturerId,
    );
    console.log(
      "[AI_RISK] Final Scores - Risk:",
      riskScore,
      "Trust:",
      trustScore,
    );
    console.log("[AI_RISK] Summary:", summary);

    return {
      riskScore,
      trustScore,
      summary,
    };
  } catch (err) {
    console.error(
      "[RISK_RECALC] Error recalculating manufacturer risk:",
      err.message,
    );
    throw err;
  }
}

/**
 * Batch recalculate risk scores for all manufacturers
 * Should be run as a scheduled job (daily/weekly)
 */
export async function recalculateAllManufacturerRiskScores() {
  try {
    const manufacturers = await prisma.manufacturer.findMany();
    const results = [];

    for (const manufacturer of manufacturers) {
      const result = await recalculateManufacturerRiskScore(manufacturer.id);
      results.push({
        manufacturerId: manufacturer.id,
        ...result,
      });
    }

    console.log(
      `[BATCH_RECALC] Updated ${results.length} manufacturer risk scores`,
    );
    return results;
  } catch (err) {
    console.error("[BATCH_RECALC] Error in batch recalculation:", err.message);
    throw err;
  }
}
