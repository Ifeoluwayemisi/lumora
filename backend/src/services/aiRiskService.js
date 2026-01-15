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
      take: 10,
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
          advisories.push("Multiple locations detected within 1 hour");
        }
      }
    }

    // Rule 2: Rapid verification frequency = suspicious
    if (logs.length >= 5) {
      riskScore += 30; // 30 points for frequent verification
      suspiciousPattern = true;
      advisories.push("High verification frequency detected");
    }

    // Rule 3: Unregistered product + high frequency = very suspicious
    if (
      context.verificationState === "UNREGISTERED_PRODUCT" &&
      logs.length >= 3
    ) {
      riskScore += 20; // 20 points
      suspiciousPattern = true;
      advisories.push("Unregistered product verified multiple times");
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
      `Location: ${l.latitude ? `${l.latitude},${l.longitude}` : "unknown"}`
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
              parseErr.message
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
