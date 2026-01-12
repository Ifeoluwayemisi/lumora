import { generateCodesForBatch } from "../services/codeService.js";

/**
 * Generate codes for a product batch
 * Only manufacturers verified by NAFDAC can generate codes
 */
export async function generateBatchCodes(req, res) {
  try {
    const { drugId, batchNumber, expirationDate, quantity } = req.body;
    const manufacturerId = req.user.id;

    // Input validation
    if (!drugId || !batchNumber || !expirationDate) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["drugId", "batchNumber", "expirationDate"],
      });
    }

    if (quantity && (isNaN(quantity) || quantity < 1 || quantity > 10000)) {
      return res.status(400).json({
        error: "Quantity must be between 1 and 10000",
      });
    }

    // Check manufacturer verification
    if (!req.user.verified) {
      return res.status(403).json({
        error: "Unauthorized",
        message:
          "Your manufacturer account must be verified by NAFDAC to generate codes",
      });
    }

    // Validate expiration date
    const expDate = new Date(expirationDate);
    if (isNaN(expDate.getTime()) || expDate <= new Date()) {
      return res.status(400).json({
        error: "Invalid expiration date - must be in the future",
      });
    }

    // Generate codes
    const result = await generateCodesForBatch(
      manufacturerId,
      drugId,
      batchNumber,
      expDate,
      quantity || 20 // default 20
    );

    return res.status(201).json({
      message: "Batch codes generated successfully",
      batch: result.batch,
      codesCount: result.codes.length,
    });
  } catch (error) {
    console.error("[GENERATE_CODES] Error:", error.message);

    // Handle specific database errors
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Product or batch not found",
      });
    }

    return res.status(500).json({
      error: "Code generation failed",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again later",
    });
  }
}
