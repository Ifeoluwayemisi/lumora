import { generateCodesForBatch } from "../services/codeService.js";
import prisma from "../models/prismaClient.js";
import { reverseGeocode } from "../services/analyticsService.js";
import {
  sendSuspiciousActivityEmail,
  sendRegulatoryAlert,
} from "../services/notificationService.js";
import { getRegulatoryBody } from "../config/regulatoryConfig.js";

/**
 * Generate codes for a product batch
 * Only manufacturers verified by NAFDAC can generate codes
 */
export async function generateBatchCodes(req, res) {
  try {
    const { drugId, batchNumber, expirationDate, quantity } = req.body;
    const userId = req.user.id;

    // Look up manufacturer from user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true, verified: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const manufacturerId = manufacturer.id;

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
    if (!manufacturer.verified) {
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
      quantity || 20, // default 20
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
/**
 * Flag a code as suspicious, counterfeit, or blacklisted
 */
export async function flagCode(req, res) {
  try {
    const { codeId } = req.params;
    const { reason, severity } = req.body; // reason: 'suspicious', 'counterfeit', 'blacklist'
    const userId = req.user.id;

    // Get manufacturer
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    // Get code and verify ownership
    const code = await prisma.code.findFirst({
      where: { id: codeId },
      include: { batch: { select: { manufacturerId: true } } },
    });

    if (!code || code.batch.manufacturerId !== manufacturer.id) {
      return res.status(403).json({ error: "Code not found or access denied" });
    }

    // Update code status
    const validReasons = ["suspicious", "counterfeit", "blacklist"];
    const flagReason = validReasons.includes(reason) ? reason : "suspicious";

    const flaggedCode = await prisma.code.update({
      where: { id: codeId },
      data: {
        isFlagged: true,
        flagReason,
        flagSeverity: severity || "medium",
        flaggedAt: new Date(),
      },
      select: {
        id: true,
        codeValue: true,
        isFlagged: true,
        flagReason: true,
        flagSeverity: true,
        flaggedAt: true,
      },
    });

    // Send notification to admin about flagged code
    try {
      await sendSuspiciousActivityEmail(manufacturer.id, {
        codeValue: code.codeValue,
        reason: flagReason,
        severity: severity || "medium",
        timestamp: new Date(),
        message: `Code flagged as ${flagReason} with ${severity || "medium"} severity`,
      });
      console.log("[FLAG_CODE] Notification email sent to admin");
    } catch (emailErr) {
      console.warn(
        "[FLAG_CODE] Failed to send notification email:",
        emailErr.message,
      );
      // Don't fail the flag operation if email fails
    }

    // Send alert to regulatory authorities (NAFDAC, FIRS, etc.) based on product category
    try {
      const manufacturerData = await prisma.manufacturer.findUnique({
        where: { id: manufacturer.id },
        select: { name: true, productCategory: true },
      });

      const regulatoryBody = getRegulatoryBody(
        manufacturerData?.productCategory || "other",
      );

      await sendRegulatoryAlert({
        codeValue: code.codeValue,
        reason: flagReason,
        severity: severity || "medium",
        manufacturerName: manufacturerData?.name || "Unknown",
        manufacturerId: manufacturer.id,
        productCategory: manufacturerData?.productCategory || "other",
        regulatoryBody: regulatoryBody,
        timestamp: new Date(),
      });
      console.log(
        `[FLAG_CODE] Regulatory alert sent to ${regulatoryBody.name}`,
      );
    } catch (regulatoryErr) {
      console.warn(
        "[FLAG_CODE] Failed to send regulatory alert:",
        regulatoryErr.message,
      );
      // Don't fail the flag operation if regulatory alert fails
    }

    res.status(200).json({
      success: true,
      message: `Code flagged as ${flagReason}. Admin has been notified.`,
      code: flaggedCode,
    });
  } catch (err) {
    console.error("[FLAG_CODE] Error:", err.message);
    res.status(500).json({
      error: "Failed to flag code",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Unflag a previously flagged code
 */
export async function unflagCode(req, res) {
  try {
    const { codeId } = req.params;
    const userId = req.user.id;

    // Get manufacturer
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    // Get code and verify ownership
    const code = await prisma.code.findFirst({
      where: { id: codeId },
      include: { batch: { select: { manufacturerId: true } } },
    });

    if (!code || code.batch.manufacturerId !== manufacturer.id) {
      return res.status(403).json({ error: "Code not found or access denied" });
    }

    // Remove flag
    const unflaggedCode = await prisma.code.update({
      where: { id: codeId },
      data: {
        isFlagged: false,
        flagReason: null,
        flagSeverity: null,
        flaggedAt: null,
      },
      select: {
        id: true,
        codeValue: true,
        isFlagged: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Code unflagged successfully",
      code: unflaggedCode,
    });
  } catch (err) {
    console.error("[UNFLAG_CODE] Error:", err.message);
    res.status(500).json({
      error: "Failed to unflag code",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Get all flagged codes for manufacturer
 */
export async function getFlaggedCodes(req, res) {
  try {
    const userId = req.user.id;

    // Get manufacturer
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    // Get flagged codes
    const flaggedCodes = await prisma.code.findMany({
      where: {
        isFlagged: true,
        batch: { manufacturerId: manufacturer.id },
      },
      include: {
        batch: {
          select: {
            id: true,
            batchNumber: true,
            product: { select: { name: true } },
          },
        },
      },
      orderBy: { flaggedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      codes: flaggedCodes,
      count: flaggedCodes.length,
    });
  } catch (err) {
    console.error("[GET_FLAGGED_CODES] Error:", err.message);
    res.status(500).json({
      error: "Failed to fetch flagged codes",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}

/**
 * Get all codes for manufacturer
 */
export async function getManufacturerCodes(req, res) {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 50,
      status = "ALL",
      productId,
      batchId,
    } = req.query;

    console.log("[MANU-CODES] Request from userId:", userId);
    console.log("[MANU-CODES] Query params:", {
      page,
      limit,
      status,
      productId,
      batchId,
    });

    // Get manufacturer
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    console.log("[MANU-CODES] Manufacturer found:", manufacturer?.id);

    if (!manufacturer) {
      console.log(
        "[MANU-CODES] ERROR: No manufacturer found for userId:",
        userId,
      );
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {
      manufacturerId: manufacturer.id,
    };

    // Fix: Correct Prisma nested query syntax for product filter
    if (productId) {
      where.batch = {
        product: {
          id: productId,
        },
      };
    }
    if (batchId) {
      where.batchId = batchId;
    }

    // Status filter
    if (status === "unused") where.isUsed = false;
    if (status === "used") where.isUsed = true;
    if (status === "flagged") where.isFlagged = true;

    console.log("[MANU-CODES] Query filter:", JSON.stringify(where, null, 2));

    const [codes, total] = await Promise.all([
      prisma.code.findMany({
        where,
        include: {
          batch: {
            select: {
              id: true,
              batchNumber: true,
              productionDate: true,
              expirationDate: true,
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          verificationLogs: {
            select: {
              id: true,
              verificationState: true,
              createdAt: true,
              latitude: true,
              longitude: true,
              riskScore: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.code.count({ where }),
    ]);

    console.log(
      "[MANU-CODES] Found",
      codes.length,
      "codes out of",
      total,
      "total",
    );

    // Map codes to include latest verification state and location names
    const mappedCodes = await Promise.all(
      codes.map(async (code) => {
        let locationName = null;

        // Get location name if coordinates exist
        if (
          code.verificationLogs[0]?.latitude &&
          code.verificationLogs[0]?.longitude
        ) {
          try {
            locationName = await reverseGeocode(
              code.verificationLogs[0].latitude,
              code.verificationLogs[0].longitude,
            );
          } catch (err) {
            console.warn("[MANU-CODES] Reverse geocoding failed:", err.message);
            // Continue without location name
          }
        }

        return {
          id: code.id,
          code: code.codeValue,
          productId: code.batch.product.id,
          productName: code.batch.product.name,
          batchId: code.batch.id,
          batchNumber: code.batch.batchNumber,
          productionDate: code.batch.productionDate,
          expirationDate: code.batch.expirationDate,
          isUsed: code.isUsed,
          usedAt: code.usedAt,
          usedCount: code.usedCount,
          isFlagged: code.isFlagged,
          createdAt: code.createdAt,
          verificationState:
            code.verificationLogs[0]?.verificationState || "UNUSED",
          lastVerifiedAt: code.verificationLogs[0]?.createdAt,
          latitude: code.verificationLogs[0]?.latitude || null,
          longitude: code.verificationLogs[0]?.longitude || null,
          location: locationName,
          riskScore: code.verificationLogs[0]?.riskScore || null,
        };
      }),
    );

    // Debug: Log a sample to see structure
    if (mappedCodes.length > 0) {
      console.log("[MANU-CODES] Sample code with location:", {
        code: mappedCodes[0].code,
        latitude: mappedCodes[0].latitude,
        longitude: mappedCodes[0].longitude,
        verificationState: mappedCodes[0].verificationState,
      });
    }

    res.status(200).json({
      success: true,
      data: mappedCodes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[GET_MANUFACTURER_CODES] Error:", {
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
    res.status(500).json({
      error: "Failed to fetch codes",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Please try again later",
    });
  }
}
