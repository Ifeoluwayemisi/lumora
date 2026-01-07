import OpenAI from "openai";
import prisma from "../models/prismaClient.js";

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

/**
 * Calculate risk score based on verification patterns
 * @param {string} codeValue
 * @param {{ latitude: number, longitude: number }} location
 * @returns {{ riskScore: number, suspiciousPattern: boolean, advisory: string | null }}
 */
export async function calculateRisk(codeValue, location) {
  const logs = await prisma.verificationLog.findMany({
    where: { codeValue },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  let riskScore = 0;
  let suspiciousPattern = false;
  const advisories = [];

  /* ---------------- Rule 1: Multiple locations within 1 hour ---------------- */
  if (logs.length > 1) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentLogs = logs.filter((l) => l.createdAt >= oneHourAgo);

    const locations = recentLogs.map((l) => `${l.latitude},${l.longitude}`);

    const uniqueLocations = new Set(locations);

    if (uniqueLocations.size > 1) {
      riskScore += 0.6;
      suspiciousPattern = true;
      advisories.push("Multiple locations detected within a short time frame");
    }
  }

  /* ---------------- Rule 2: Rapid verification frequency ---------------- */
  if (logs.length >= 5) {
    riskScore += 0.3;
    suspiciousPattern = true;
    advisories.push("High verification frequency detected");
  }

  /* ---------------- Normalize score ---------------- */
  riskScore = Math.min(riskScore, 1);

  /* ---------------- Optional AI Enhancement ---------------- */
  if (process.env.ENABLE_AI_RISK === "true" && logs.length > 0) {
    const prompt = `
You are a compliance risk engine.
Analyze the following verification logs and respond ONLY in valid JSON.

Expected format:
{
  "riskScore": number between 0 and 1,
  "suspiciousPattern": boolean,
  "advisory": string
}

Logs:
${logs
  .map(
    (l) =>
      `Time: ${l.createdAt.toISOString()}, Location: ${l.latitude},${
        l.longitude
      }, User: ${l.userId}`
  )
  .join("\n")}
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        max_tokens: 150,
      });

      const aiText = response.choices[0].message.content;
      const parsed = JSON.parse(aiText);

      riskScore = Math.max(riskScore, parsed.riskScore || 0);
      suspiciousPattern = suspiciousPattern || parsed.suspiciousPattern;
      if (parsed.advisory) advisories.push(parsed.advisory);
    } catch (err) {
      console.warn("AI risk analysis failed, continuing without AI");
    }
  }

  return {
    riskScore,
    suspiciousPattern,
    advisory: advisories.length ? advisories.join(" | ") : null,
  };
}
