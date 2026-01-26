import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate AI-driven usage instructions and warnings for a product
 * Based on product name, category, and risk assessment
 */
export async function generateProductGuide({
  productName = "Product",
  category = "general",
  riskScore = 0,
  verificationState = "UNKNOWN",
  description = null,
}) {
  try {
    const riskContext =
      riskScore >= 70
        ? "This product has HIGH RISK indicators and may be counterfeit."
        : riskScore >= 50
          ? "This product has MEDIUM RISK indicators."
          : "This product passed verification checks.";

    const verificationContext =
      verificationState === "CODE_ALREADY_USED"
        ? "WARNING: The verification code has been used before."
        : verificationState === "UNREGISTERED_PRODUCT"
          ? "This product is not registered with any manufacturer."
          : "";

    const prompt = `You are a product safety expert. Generate concise, practical guidance for a consumer about this product.

Product: ${productName}
Category: ${category}
Description: ${description || "Not provided"}
Risk Assessment: ${riskContext}
Verification Status: ${verificationContext}

Provide:
1. Usage Instructions (2-3 bullet points) - Only if this is a consumable/usable product
2. Safety Warnings (2-3 bullet points) - Based on category and risk level
3. Storage/Handling Tips (1-2 bullet points)

Format as JSON with these exact keys:
{
  "usageInstructions": ["instruction1", "instruction2"],
  "safetyWarnings": ["warning1", "warning2"],
  "storageHandling": ["tip1", "tip2"]
}

Only include usageInstructions if relevant to the product type. Keep warnings concise and actionable.`;

    const message = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const responseText = message.content[0].text;

    // Extract JSON from response (sometimes model adds extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return getDefaultGuide(category, riskScore, verificationState);
    }

    const guide = JSON.parse(jsonMatch[0]);
    return guide;
  } catch (error) {
    console.error("[AI-GUIDE] Error generating product guide:", error.message);
    // Fallback to category-based defaults
    return getDefaultGuide(category, riskScore, verificationState);
  }
}

/**
 * Fallback guide generator based on product category and risk
 * Used when AI service is unavailable
 */
function getDefaultGuide(category, riskScore, verificationState) {
  const categoryLower = (category || "general").toLowerCase();

  // High risk defaults
  if (riskScore >= 70 || verificationState === "CODE_ALREADY_USED") {
    return {
      usageInstructions: [],
      safetyWarnings: [
        "⚠ HIGH RISK: This product shows signs of being counterfeit.",
        "⚠ Do not consume or use this product.",
        "🚨 Report to NAFDAC: 08037020131",
      ],
      storageHandling: ["Store safely away from others until verified."],
    };
  }

  // Category-specific defaults
  if (
    categoryLower.includes("drug") ||
    categoryLower.includes("medicine") ||
    categoryLower.includes("pharmaceutical")
  ) {
    return {
      usageInstructions: [
        "Follow dosage instructions on packaging exactly.",
        "Take with water or food as recommended.",
        "Complete full course even if symptoms improve.",
      ],
      safetyWarnings: [
        "Check expiration date before use.",
        "Stop use if side effects occur and consult doctor.",
        "Keep out of reach of children.",
      ],
      storageHandling: [
        "Store in cool, dry place away from sunlight.",
        "Do not store in bathroom or humid areas.",
      ],
    };
  }

  if (
    categoryLower.includes("food") ||
    categoryLower.includes("beverage") ||
    categoryLower.includes("drink")
  ) {
    return {
      usageInstructions: [
        "Check packaging for proper sealing before consumption.",
        "Follow storage instructions after opening.",
        "Use within recommended timeframe after opening.",
      ],
      safetyWarnings: [
        "Verify expiration date and batch number.",
        "Discard if product shows signs of tampering.",
        "Check for unusual smell, taste, or appearance.",
      ],
      storageHandling: [
        "Store in cool, dry place.",
        "Keep refrigerated if label indicates.",
      ],
    };
  }

  if (
    categoryLower.includes("cosmetic") ||
    categoryLower.includes("beauty") ||
    categoryLower.includes("skincare")
  ) {
    return {
      usageInstructions: [
        "Apply according to instructions on packaging.",
        "Do patch test first to check for allergies.",
        "Use recommended amount - more is not better.",
      ],
      safetyWarnings: [
        "Stop use if skin irritation or rash develops.",
        "Do not use on broken or irritated skin.",
        "Keep away from eyes unless specified.",
      ],
      storageHandling: [
        "Store in cool, dark place.",
        "Keep lid closed to prevent contamination.",
      ],
    };
  }

  // Generic default
  return {
    usageInstructions: [
      "Follow all instructions on the product packaging.",
      "Use product for its intended purpose only.",
    ],
    safetyWarnings: [
      "Verify product authenticity before use.",
      "Check for signs of tampering or damage.",
    ],
    storageHandling: ["Store in safe, secure location."],
  };
}
