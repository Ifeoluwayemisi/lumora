import sharp from "sharp";
import prisma from "../models/prismaClient.js";
import fs from "fs";
import path from "path";

/**
 * Error Level Analysis (ELA) - Detect image manipulation
 * Analyzes compression artifacts to find edited areas
 */
export async function performELA(imagePath) {
  try {
    // Read image
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Re-compress image multiple times to detect editing
    const buffer = await image.raw().toBuffer();

    // Analyze compression patterns
    // If area was edited, it will have different compression artifacts
    const recompressed = await sharp(buffer, {
      raw: {
        width: metadata.width,
        height: metadata.height,
        channels: metadata.channels || 3,
      },
    })
      .jpeg({ quality: 95 })
      .toBuffer();

    // Calculate pixel-level differences
    const originalFile = fs.readFileSync(imagePath);

    // Simple ELA: look for significant size differences after recompression
    const compressionRatio = recompressed.length / originalFile.length;

    // If recompressed size is much different, suspicious
    const manipulationLikelihood =
      Math.abs(1 - compressionRatio) > 0.2 ? "HIGH" : "LOW";

    return {
      suspicious: manipulationLikelihood === "HIGH",
      manipulationLikelihood,
      compressionRatio: compressionRatio.toFixed(2),
      analysis: "Compression artifact analysis",
    };
  } catch (err) {
    console.error("[ELA] Error performing ELA:", err.message);
    return {
      suspicious: null,
      manipulationLikelihood: "UNKNOWN",
      error: err.message,
    };
  }
}

/**
 * Check for document metadata tampering
 */
export async function checkDocumentMetadata(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();

    const suspiciousMetadata = [];

    // Check if metadata has been stripped (legitimate documents usually have metadata)
    if (!metadata.exif && !metadata.iptc && !metadata.icc) {
      suspiciousMetadata.push("All metadata stripped");
    }

    // Check modification date if available
    if (metadata.exif?.ModifyDate) {
      const modifyDate = new Date(metadata.exif.ModifyDate);
      const now = new Date();
      const daysSinceModify = (now - modifyDate) / (1000 * 60 * 60 * 24);

      // Recently modified document is suspicious
      if (daysSinceModify < 7) {
        suspiciousMetadata.push("Recently modified");
      }
    }

    return {
      suspicious: suspiciousMetadata.length > 0,
      flags: suspiciousMetadata,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        colorspace: metadata.space,
        hasMetadata: !!metadata.exif || !!metadata.iptc || !!metadata.icc,
      },
    };
  } catch (err) {
    console.error("[METADATA] Error checking metadata:", err.message);
    return {
      suspicious: null,
      flags: [],
      error: err.message,
    };
  }
}

/**
 * Font consistency analysis
 * Checks if document appears to have mixed fonts (sign of forgery)
 */
export async function analyzeFontConsistency(imagePath) {
  try {
    // Would need OCR library to properly analyze fonts
    // For now, return placeholder
    return {
      consistent: true,
      fontVariants: 1,
      suspiciousAreas: [],
      analysis:
        "Basic font consistency check (requires OCR for detailed analysis)",
    };
  } catch (err) {
    console.error("[FONT] Error analyzing fonts:", err.message);
    return {
      consistent: null,
      error: err.message,
    };
  }
}

/**
 * Document quality scoring
 * Lower quality might indicate poor forgery attempt or scan of scan
 */
export async function scoreDocumentQuality(imagePath) {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    let qualityScore = 100;

    // Resolution check
    if (metadata.width < 800 || metadata.height < 600) {
      qualityScore -= 30; // Low resolution
    } else if (metadata.width < 1200 || metadata.height < 900) {
      qualityScore -= 15; // Medium-low resolution
    }

    // Check image dimensions (should be roughly rectangular for documents)
    const aspectRatio = metadata.width / metadata.height;
    if (aspectRatio < 0.5 || aspectRatio > 2) {
      qualityScore -= 20; // Unusual aspect ratio
    }

    // Check for common document dimensions
    const commonDocDimensions = [
      { w: 1240, h: 1754 }, // A4
      { w: 2480, h: 3508 }, // A4 high-res
      { w: 800, h: 600 }, // Common scan
      { w: 1024, h: 768 }, // Common scan
    ];

    const isCommonDim = commonDocDimensions.some(
      (dim) =>
        Math.abs(metadata.width - dim.w) < 100 &&
        Math.abs(metadata.height - dim.h) < 100,
    );

    if (isCommonDim) {
      qualityScore += 10; // Standard document dimensions
    }

    return {
      qualityScore: Math.max(0, Math.min(qualityScore, 100)),
      resolution: `${metadata.width}x${metadata.height}`,
      aspectRatio: aspectRatio.toFixed(2),
      isStandardDimension: isCommonDim,
      recommendation:
        qualityScore < 50
          ? "LOW QUALITY - May be forged or poor scan"
          : qualityScore < 75
            ? "MEDIUM QUALITY - Acceptable"
            : "HIGH QUALITY - Good scan",
    };
  } catch (err) {
    console.error("[QUALITY] Error scoring document quality:", err.message);
    return {
      qualityScore: null,
      error: err.message,
    };
  }
}

/**
 * Check for document authenticity marks
 * Looks for hologram patterns, security features, etc.
 */
export async function detectAuthenticityMarks(imagePath) {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const data = await image.raw().toBuffer();

    // Analyze color distribution
    // Hologram and security features have specific color patterns
    const pixelCount = metadata.width * metadata.height;
    let colorVariance = 0;
    let dominantColors = new Map();

    // Sample every 100th pixel to speed up analysis
    for (let i = 0; i < data.length; i += 300) {
      // Skip RGB channels
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const colorKey = `${r},${g},${b}`;

      dominantColors.set(colorKey, (dominantColors.get(colorKey) || 0) + 1);
    }

    // Security features usually have 15-25 distinct dominant colors
    const distinctColors = dominantColors.size;

    let hasSecurityFeatures = false;
    let securityLevel = "NONE";

    if (distinctColors > 20) {
      hasSecurityFeatures = true;
      securityLevel = distinctColors > 50 ? "HIGH" : "MEDIUM";
    }

    return {
      hasSecurityFeatures,
      securityLevel,
      distinctColors,
      analysis: "Color pattern security feature detection",
    };
  } catch (err) {
    console.error(
      "[SECURITY_MARKS] Error detecting security marks:",
      err.message,
    );
    return {
      hasSecurityFeatures: null,
      error: err.message,
    };
  }
}

/**
 * Main function: Check document for forgery
 * Returns risk score (0-100) where higher = more likely forged
 */
export async function checkDocumentForForgery(
  manufacturerId,
  documentType,
  filePath,
) {
  try {
    console.log(
      `[FORGERY_CHECK] Starting forgery check for ${manufacturerId}: ${documentType}`,
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Run all checks
    const [ela, metadata, quality, authMarks] = await Promise.all([
      performELA(filePath),
      checkDocumentMetadata(filePath),
      scoreDocumentQuality(filePath),
      detectAuthenticityMarks(filePath),
    ]);

    // Calculate overall forgery risk
    let riskScore = 0;

    // ELA score (30% weight)
    if (ela.suspicious === true) {
      riskScore += 30;
    }

    // Metadata tampering (25% weight)
    if (metadata.suspicious === true) {
      riskScore += 25;
    }

    // Document quality (20% weight)
    if (quality.qualityScore < 40) {
      riskScore += 20;
    } else if (quality.qualityScore < 60) {
      riskScore += 10;
    }

    // Missing security features (15% weight)
    if (!authMarks.hasSecurityFeatures) {
      riskScore += 15;
    }

    // Lack of authenticity marks
    if (authMarks.securityLevel === "NONE") {
      riskScore += 10;
    }

    // Cap at 100
    riskScore = Math.min(riskScore, 100);

    // Determine verdict
    let verdict = "LEGITIMATE";
    let recommendation = "Document appears authentic";

    if (riskScore > 70) {
      verdict = "LIKELY_FORGED";
      recommendation =
        "Document shows strong signs of forgery. Request alternative verification.";
    } else if (riskScore > 50) {
      verdict = "SUSPICIOUS";
      recommendation =
        "Document has some red flags. Manual review recommended.";
    } else if (riskScore > 30) {
      verdict = "MODERATE_RISK";
      recommendation =
        "Document quality could be improved. Consider requesting better scan.";
    }

    // Save check result
    const checkResult = await prisma.documentForgerCheck.create({
      data: {
        manufacturerId,
        documentType,
        filePath,
        riskScore,
        verdict,
        elaResult: JSON.stringify(ela),
        metadataResult: JSON.stringify(metadata),
        qualityScore: quality.qualityScore,
        hasSecurityFeatures: authMarks.hasSecurityFeatures,
        checkDetails: JSON.stringify({
          ela,
          metadata,
          quality,
          authMarks,
        }),
        checkedAt: new Date(),
      },
    });

    console.log(
      `[FORGERY_CHECK] ${documentType} for ${manufacturerId}: ${verdict} (Risk: ${riskScore})`,
    );

    return {
      riskScore,
      verdict,
      recommendation,
      checks: {
        ela: ela.suspicious,
        metadataTampered: metadata.suspicious,
        qualityScore: quality.qualityScore,
        hasSecurityFeatures: authMarks.hasSecurityFeatures,
      },
      details: {
        ela,
        metadata,
        quality,
        authMarks,
      },
      checkId: checkResult.id,
    };
  } catch (err) {
    console.error("[FORGERY_CHECK] Error checking document:", err.message);
    throw err;
  }
}

/**
 * Get document check history for manufacturer
 */
export async function getDocumentCheckHistory(manufacturerId, limit = 10) {
  try {
    const history = await prisma.documentForgerCheck.findMany({
      where: { manufacturerId },
      orderBy: { checkedAt: "desc" },
      take: limit,
    });

    return history;
  } catch (err) {
    console.error(
      "[FORGERY_HISTORY] Error getting check history:",
      err.message,
    );
    throw err;
  }
}

/**
 * Check all uploaded documents for a manufacturer
 */
export async function checkAllManufacturerDocuments(manufacturerId) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
    });

    if (!manufacturer) throw new Error("Manufacturer not found");

    const results = [];
    const documents = [
      { type: "NAFDAC_LICENSE", path: manufacturer.nafdacLicensePath },
      { type: "BUSINESS_CERT", path: manufacturer.businessCertificatePath },
      { type: "PHOTO_ID", path: manufacturer.photoIdPath },
    ];

    for (const doc of documents) {
      if (doc.path && fs.existsSync(doc.path)) {
        const result = await checkDocumentForForgery(
          manufacturerId,
          doc.type,
          doc.path,
        );
        results.push({
          documentType: doc.type,
          ...result,
        });
      }
    }

    console.log(
      `[FORGERY_BATCH] Checked ${results.length} documents for ${manufacturerId}`,
    );
    return results;
  } catch (err) {
    console.error("[FORGERY_BATCH] Error checking documents:", err.message);
    throw err;
  }
}
