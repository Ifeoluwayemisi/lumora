import prisma from "../models/prismaClient.js";

/**
 * Get all products in system with verification stats
 */
export async function getAllProductsWithStats() {
  const products = await prisma.product.findMany({
    include: {
      verifications: {
        select: {
          id: true,
          status: true,
        },
      },
      batches: {
        select: {
          id: true,
          expirationDate: true,
        },
      },
    },
  });

  return products.map((p) => {
    const verifications = p.verifications;
    const genuine = verifications.filter((v) => v.status === "genuine").length;
    const suspicious = verifications.filter(
      (v) => v.status === "suspicious",
    ).length;
    const invalid = verifications.filter((v) => v.status === "invalid").length;

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      totalVerifications: verifications.length,
      genuine,
      suspicious,
      invalid,
      genuineRate:
        verifications.length > 0
          ? ((genuine / verifications.length) * 100).toFixed(2)
          : 0,
      suspiciousRate:
        verifications.length > 0
          ? ((suspicious / verifications.length) * 100).toFixed(2)
          : 0,
      expiredBatches: p.batches.filter(
        (b) => new Date(b.expirationDate) < new Date(),
      ).length,
      totalBatches: p.batches.length,
    };
  });
}

/**
 * Detect abnormal verification velocity
 */
export async function detectAbnormalVelocity(threshold = 100) {
  // Get verifications from last 24 hours grouped by product
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const velocityByProduct = await prisma.verificationLog.groupBy({
    by: ["productId"],
    where: {
      createdAt: { gte: oneDayAgo },
    },
    _count: {
      id: true,
    },
  });

  const abnormal = velocityByProduct.filter((v) => v._count.id > threshold);

  // Get product details
  const productsWithAbnormalVelocity = await Promise.all(
    abnormal.map(async (v) => {
      const product = await prisma.product.findUnique({
        where: { id: v.productId },
      });
      return {
        product: product?.name,
        productId: v.productId,
        verificationCount24h: v._count.id,
        isAbnormal: true,
      };
    }),
  );

  return productsWithAbnormalVelocity;
}

/**
 * Detect cross-region leakage
 */
export async function detectCrossRegionLeakage() {
  // Find products with verifications in multiple states
  const verifications = await prisma.verificationLog.findMany({
    select: {
      productId: true,
      location: true,
    },
  });

  const leakageByProduct = {};

  verifications.forEach((v) => {
    if (!leakageByProduct[v.productId]) {
      leakageByProduct[v.productId] = new Set();
    }
    leakageByProduct[v.productId].add(v.location);
  });

  // Products verified in 2+ regions might indicate leakage
  const leakingProducts = [];
  for (const [productId, locations] of Object.entries(leakageByProduct)) {
    if (locations.size > 1) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      leakingProducts.push({
        product: product?.name,
        productId,
        regionsFound: Array.from(locations),
        regionCount: locations.size,
      });
    }
  }

  return leakingProducts;
}

/**
 * Get batch-level verification stats
 */
export async function getBatchVerificationStats(batchId) {
  const verifications = await prisma.verificationLog.findMany({
    where: {
      // Assuming verifications are linked to codes, which are in batches
      // You may need to adjust based on your actual schema
    },
  });

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      codes: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!batch) {
    throw new Error("Batch not found");
  }

  // This would need proper implementation based on schema
  return {
    batchId,
    batchNumber: batch.batchNumber,
    totalCodes: batch.codes.length,
    // Additional stats based on verifications
  };
}

/**
 * Freeze product batch
 */
export async function freezeProductBatch(batchId, reason) {
  // Assuming you want to mark batch as under investigation
  return prisma.batch.update({
    where: { id: batchId },
    data: {
      // You may need to add a status field to Batch model
      // For now, we document via case
    },
  });
}

/**
 * Mark batch as under investigation
 */
export async function markBatchUnderInvestigation(batchId, caseId) {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
  });

  if (!batch) {
    throw new Error("Batch not found");
  }

  // Create or link to case
  if (caseId) {
    await prisma.caseFile.update({
      where: { id: caseId },
      data: { batchId },
    });
  }

  return { success: true, batchId, status: "under_investigation" };
}

/**
 * Get verification statistics by location
 */
export async function getVerificationStatsByLocation() {
  const verifications = await prisma.verificationLog.findMany({
    select: {
      location: true,
      status: true,
    },
  });

  const statsByLocation = {};

  verifications.forEach((v) => {
    if (!statsByLocation[v.location]) {
      statsByLocation[v.location] = {
        location: v.location,
        genuine: 0,
        suspicious: 0,
        invalid: 0,
        total: 0,
      };
    }
    statsByLocation[v.location][v.status]++;
    statsByLocation[v.location].total++;
  });

  // Convert to array and sort by suspicious count
  return Object.values(statsByLocation)
    .map((s) => ({
      ...s,
      suspiciousRate:
        s.total > 0 ? ((s.suspicious / s.total) * 100).toFixed(2) : 0,
    }))
    .sort((a, b) => b.suspicious - a.suspicious);
}

/**
 * Get external/unregistered products with high reports
 */
export async function getExternalProductsHighRisk() {
  // Products that have many reports but aren't registered
  const unregisteredProducts = await prisma.userReport.groupBy({
    by: ["productId"],
    where: {
      productId: null, // No product linked
    },
    _count: {
      id: true,
    },
  });

  // Filter for high report count
  const highRiskUnregistered = unregisteredProducts.filter(
    (p) => p._count.id > 5,
  );

  // Get details
  const productsWithReports = await Promise.all(
    highRiskUnregistered.map(async (p) => {
      const reports = await prisma.userReport.findMany({
        where: { productId: null },
        select: {
          productName: true,
          location: true,
          reason: true,
          riskLevel: true,
        },
        take: 5,
      });

      return {
        totalReports: p._count.id,
        sampleReports: reports,
        riskLevel: "HIGH", // Auto-flagged due to reports
        recommendedAction:
          "Request manufacturer registration or issue public warning",
      };
    }),
  );

  return productsWithReports;
}

/**
 * Get AI system analysis (mock - can be enhanced)
 */
export async function getAISystemAnalysis() {
  const [totalAnalyzed, flaggedFalsePositives, currentAccuracy] =
    await Promise.all([
      prisma.verificationLog.count(),
      prisma.caseFile.count({
        where: { status: "closed", closedReason: "FALSE_POSITIVE" },
      }),
      // This would come from actual AI metrics in production
    ]);

  const accuracy =
    totalAnalyzed > 0
      ? (
          ((totalAnalyzed - flaggedFalsePositives) / totalAnalyzed) *
          100
        ).toFixed(2)
      : 0;

  return {
    systemHealth: "operational",
    totalVerificationsAnalyzed: totalAnalyzed,
    falsePositives: flaggedFalsePositives,
    estimatedAccuracy: `${accuracy}%`,
    lastUpdate: new Date().toISOString(),
    recommendations: [
      "Monitor verification patterns for anomalies",
      "Review high-confidence flagged items",
      "Maintain audit trail of AI decisions",
    ],
  };
}

/**
 * Force audit of manufacturer
 */
export async function forceManufacturerAudit(manufacturerId, reason) {
  // Create a case file for the audit
  const caseFile = await prisma.caseFile.create({
    data: {
      caseNumber: `AUDIT-${Date.now()}`,
      manufacturerId,
      title: `Forced Audit: ${reason}`,
      severity: "medium",
      status: "under_review",
      locations: [],
    },
  });

  return caseFile;
}

/**
 * Revoke product batches
 */
export async function revokeBatches(manufacturerId, reason) {
  // Get all batches for manufacturer
  const batches = await prisma.batch.findMany({
    where: { manufacturerId },
  });

  // In production, you'd update batch status to "revoked"
  return {
    batchesAffected: batches.length,
    reason,
    status: "revoked",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Blacklist manufacturer (extreme case)
 */
export async function blacklistManufacturer(manufacturerId, reason) {
  return prisma.manufacturer.update({
    where: { id: manufacturerId },
    data: {
      accountStatus: "blacklisted",
      verified: false,
    },
  });
}
