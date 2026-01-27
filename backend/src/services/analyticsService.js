import prisma from "../models/prismaClient.js";

/**
 * Get top verification locations grouped by location string
 */
async function getTopVerificationLocations(manufacturerId, limit = 10) {
  try {
    const verifications = await prisma.verificationLog.findMany({
      where: {
        manufacturerId,
        location: { not: null },
      },
      select: {
        location: true,
        latitude: true,
        longitude: true,
        verificationState: true,
        createdAt: true,
      },
    });

    // Group by location string
    const locationMap = {};
    verifications.forEach((verification) => {
      const locationKey = verification.location || "Unknown";
      if (!locationMap[locationKey]) {
        locationMap[locationKey] = {
          location: verification.location || "Unknown",
          latitude: verification.latitude,
          longitude: verification.longitude,
          total: 0,
          genuine: 0,
          suspicious: 0,
          invalid: 0,
          alreadyUsed: 0,
          unregistered: 0,
        };
      }

      locationMap[locationKey].total++;

      // Count by verification state
      switch (verification.verificationState) {
        case "GENUINE":
          locationMap[locationKey].genuine++;
          break;
        case "SUSPICIOUS":
          locationMap[locationKey].suspicious++;
          break;
        case "INVALID":
          locationMap[locationKey].invalid++;
          break;
        case "CODE_ALREADY_USED":
          locationMap[locationKey].alreadyUsed++;
          break;
        case "UNREGISTERED":
          locationMap[locationKey].unregistered++;
          break;
      }
    });

    // Convert to array, sort by total, and return top N
    const topLocations = Object.values(locationMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
      .map((loc) => ({
        ...loc,
        authenticity: loc.total > 0 ? Math.round((loc.genuine / loc.total) * 100) : 0,
        riskScore: calculateRiskScore(
          loc.genuine,
          loc.suspicious,
          loc.invalid,
          loc.alreadyUsed,
        ),
      }));

    return topLocations;
  } catch (err) {
    console.error("[TOP_VERIFICATION_LOCATIONS] Error:", err);
    return [];
  }
}

/**
 * Get manufacturer analytics data
 */
export async function getManufacturerAnalytics(manufacturerId) {
  const serviceId = Math.random().toString(36).substring(7);
  try {
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Starting analytics for manufacturerId: ${manufacturerId}`,
    );

    // Get date range for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Date range: ${thirtyDaysAgo} to now`,
    );

    // Verification trends - get raw data and process in code
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Fetching verification raw data...`,
    );
    const verificationRawData = await prisma.verificationLog.findMany({
      where: {
        manufacturerId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        verificationState: true,
      },
    });
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Found ${verificationRawData.length} verification logs`,
    );

    // Group by date in application code - return as array
    const verificationTrendData = {};
    verificationRawData.forEach((log) => {
      const date = log.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      if (!verificationTrendData[date]) {
        verificationTrendData[date] = 0;
      }
      verificationTrendData[date]++;
    });
    // Convert to array format expected by frontend
    const verificationTrends = Object.entries(verificationTrendData).map(
      ([date, count]) => ({
        createdAt: date,
        _count: { id: count },
      }),
    );
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Grouped into ${verificationTrends.length} days`,
    );

    // Verification by state/status
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Fetching verification by status...`,
    );
    const verificationByStatus = await prisma.verificationLog.groupBy({
      by: ["verificationState"],
      where: { manufacturerId },
      _count: { id: true },
    });
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Found ${verificationByStatus.length} status groups`,
    );

    // Location data for heatmap
    console.log(`[ANALYTICS_SERVICE-${serviceId}] Fetching location data...`);
    const locationData = await prisma.verificationLog.findMany({
      where: {
        manufacturerId,
        createdAt: { gte: thirtyDaysAgo },
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        latitude: true,
        longitude: true,
        location: true,
        createdAt: true,
        verificationState: true,
      },
    });
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Found ${locationData.length} location records`,
    );

    // Code performance metrics - Group by isUsed (used/unused)
    console.log(`[ANALYTICS_SERVICE-${serviceId}] Fetching code metrics...`);
    const codeMetricsRaw = await prisma.code.groupBy({
      by: ["isUsed"],
      where: { manufacturerId },
      _count: { id: true },
    });
    // Transform to include status field for frontend compatibility
    const codeMetrics = codeMetricsRaw.map((item) => ({
      status: item.isUsed ? "USED" : "UNUSED",
      isUsed: item.isUsed,
      _count: { id: item._count.id },
    }));
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Found ${codeMetrics.length} code status groups`,
    );

    // Suspicious activity trends
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Fetching suspicious trends...`,
    );
    const suspiciousTrends = await prisma.verificationLog.findMany({
      where: {
        manufacturerId,
        createdAt: { gte: thirtyDaysAgo },
        verificationState: {
          in: ["SUSPICIOUS_PATTERN", "CODE_ALREADY_USED"],
        },
      },
      select: {
        createdAt: true,
        verificationState: true,
        codeValue: true,
      },
      orderBy: { createdAt: "desc" },
    });
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Found ${suspiciousTrends.length} suspicious activities`,
    );

    // Risk score calculation
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Fetching manufacturer data...`,
    );
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: {
        trustScore: true,
        riskLevel: true,
        _count: { select: { codes: true } },
      },
    });
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Manufacturer found:`,
      manufacturer ? "yes" : "no",
    );

    // Get top verification locations - group by location
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Fetching top verification locations...`,
    );
    const topVerificationLocations = await getTopVerificationLocations(
      manufacturerId,
      10,
    );
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Found ${topVerificationLocations.length} top locations`,
    );

    const result = {
      verificationTrends,
      verificationByStatus,
      locationData,
      topVerificationLocations,
      codeMetrics,
      suspiciousTrends,
      manufacturer,
    };

    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Analytics complete, returning data`,
    );
    return result;
  } catch (err) {
    console.error(`[ANALYTICS_SERVICE-${serviceId}] Error:`, {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
      fullError: err,
      type: err?.constructor?.name,
    });
    throw err;
  }
}

/**
 * Get hotspot predictions
 */
export async function getHotspotPredictions(manufacturerId) {
  try {
    // Get top verification locations
    const hotspots = await prisma.verificationLog.findMany({
      where: {
        manufacturerId,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        latitude: true,
        longitude: true,
        location: true,
        verificationState: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Return hotspots with location info
    return hotspots.map((spot, index) => ({
      id: index,
      latitude: spot.latitude,
      longitude: spot.longitude,
      location: spot.location,
      verificationState: spot.verificationState,
      timestamp: spot.createdAt,
    }));
  } catch (err) {
    console.error("[GET_HOTSPOT_PREDICTIONS] Error:", err);
    throw err;
  }
}

/**
 * Get export data for reporting
 */
export async function getExportData(manufacturerId, format = "csv") {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const verifications = await prisma.verificationLog.findMany({
      where: {
        manufacturerId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        codeValue: true,
        verificationState: true,
        location: true,
        createdAt: true,
        latitude: true,
        longitude: true,
      },
    });

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: {
        name: true,
        trustScore: true,
        riskLevel: true,
        accountStatus: true,
      },
    });

    return {
      manufacturer,
      verifications,
      generatedAt: new Date(),
    };
  } catch (err) {
    console.error("[GET_EXPORT_DATA] Error:", err);
    throw err;
  }
}

/**
 * Get real-time analytics with code authenticity rate
 */
export async function getRealTimeAnalytics(manufacturerId) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all verifications in period
    const verifications = await prisma.verificationLog.findMany({
      where: {
        manufacturerId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Calculate authenticity metrics
    const genuine = verifications.filter(
      (v) => v.verificationState === "GENUINE",
    ).length;
    const suspicious = verifications.filter(
      (v) => v.verificationState === "SUSPICIOUS_PATTERN",
    ).length;
    const invalid = verifications.filter(
      (v) => v.verificationState === "INVALID",
    ).length;
    const alreadyUsed = verifications.filter(
      (v) => v.verificationState === "CODE_ALREADY_USED",
    ).length;

    const total = verifications.length;
    const authenticityRate = total > 0 ? (genuine / total) * 100 : 0;

    // Geographic distribution
    const geoData = {};
    verifications.forEach((v) => {
      const location = v.location || "Unknown";
      geoData[location] = (geoData[location] || 0) + 1;
    });

    // Convert to array and sort by count
    const geoDistribution = Object.entries(geoData)
      .map(([location, count]) => ({
        location,
        count,
        percentage: ((count / total) * 100).toFixed(2),
      }))
      .sort((a, b) => b.count - a.count);

    // Batch expiration tracking
    const now = new Date();
    const [expiredCount, expiringThis30DaysCount, activeCount] =
      await Promise.all([
        prisma.batch.count({
          where: {
            manufacturerId,
            expirationDate: { lt: now },
          },
        }),
        prisma.batch.count({
          where: {
            manufacturerId,
            expirationDate: {
              gte: now,
              lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.batch.count({
          where: {
            manufacturerId,
            expirationDate: {
              gt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    return {
      codeAuthenticity: {
        total,
        genuine,
        suspicious,
        invalid,
        alreadyUsed,
        authenticityRate: Math.round(authenticityRate * 100) / 100,
        riskScore: calculateRiskScore(
          genuine,
          suspicious,
          invalid,
          alreadyUsed,
        ),
      },
      geoDistribution: {
        total: geoDistribution.length,
        topLocations: geoDistribution.slice(0, 10),
        allLocations: geoDistribution,
      },
      batchExpiration: {
        expired: expiredCount,
        expiringIn30Days: expiringThis30DaysCount,
        active: activeCount,
        totalBatches: expiredCount + expiringThis30DaysCount + activeCount,
      },
      timestamp: new Date(),
    };
  } catch (err) {
    console.error("[REAL_TIME_ANALYTICS] Error:", err);
    throw err;
  }
}

/**
 * Get product performance metrics
 */
export async function getProductPerformanceMetrics(manufacturerId) {
  try {
    const products = await prisma.product.findMany({
      where: { manufacturerId: manufacturerId },
      include: {
        batches: {
          include: {
            verificationLogs: true,
          },
        },
      },
    });

    const metrics = products.map((product) => {
      let totalVerifications = 0;
      let genuineCount = 0;
      let suspiciousCount = 0;

      product.batches.forEach((batch) => {
        batch.verificationLogs.forEach((log) => {
          totalVerifications++;
          if (log.verificationState === "GENUINE") genuineCount++;
          if (log.verificationState === "SUSPICIOUS_PATTERN") suspiciousCount++;
        });
      });

      const authenticityRate =
        totalVerifications > 0 ? (genuineCount / totalVerifications) * 100 : 0;

      return {
        productId: product.id,
        productName: product.name,
        category: product.category,
        batchCount: product.batches.length,
        totalVerifications,
        genuineVerifications: genuineCount,
        suspiciousVerifications: suspiciousCount,
        authenticityRate: Math.round(authenticityRate * 100) / 100,
        riskScore: calculateRiskScore(genuineCount, suspiciousCount, 0, 0),
      };
    });

    return metrics.sort((a, b) => b.totalVerifications - a.totalVerifications);
  } catch (err) {
    console.error("[PRODUCT_PERFORMANCE] Error:", err);
    throw err;
  }
}

/**
 * Helper function to calculate risk score
 */
function calculateRiskScore(genuine, suspicious, invalid, alreadyUsed) {
  const total = genuine + suspicious + invalid + alreadyUsed;
  if (total === 0) return 0;

  const suspiciousRatio = (suspicious / total) * 100;
  const invalidRatio = (invalid / total) * 100;
  const reuseRatio = (alreadyUsed / total) * 100;

  // Risk score 0-100
  let score = suspiciousRatio * 0.5 + invalidRatio * 0.3 + reuseRatio * 0.2;

  return Math.min(100, Math.round(score));
}

/**
 * Get top verification products for analytics dashboard
 */
export async function getTopVerifications(manufacturerId, limit = 10) {
  try {
    console.log(
      `[TOP_VERIFICATIONS] Getting top ${limit} products for manufacturerId: ${manufacturerId}`,
    );

    // Get verification counts grouped by product
    const productVerifications = await prisma.verificationLog.findMany({
      where: { manufacturerId },
      select: {
        code: {
          select: {
            batch: {
              select: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                  },
                },
              },
            },
          },
        },
        verificationState: true,
        createdAt: true,
      },
    });

    // Group by product and count verifications
    const productMap = {};
    productVerifications.forEach((verification) => {
      const product = verification.code?.batch?.product;
      if (!product) return;

      if (!productMap[product.id]) {
        productMap[product.id] = {
          id: product.id,
          name: product.name,
          category: product.category,
          total: 0,
          genuine: 0,
          suspicious: 0,
          invalid: 0,
          alreadyUsed: 0,
          unregistered: 0,
        };
      }

      productMap[product.id].total++;

      // Count by state
      switch (verification.verificationState) {
        case "GENUINE":
          productMap[product.id].genuine++;
          break;
        case "SUSPICIOUS":
          productMap[product.id].suspicious++;
          break;
        case "INVALID":
          productMap[product.id].invalid++;
          break;
        case "CODE_ALREADY_USED":
          productMap[product.id].alreadyUsed++;
          break;
        case "UNREGISTERED":
          productMap[product.id].unregistered++;
          break;
      }
    });

    // Convert to array and sort by total verifications
    const topVerifications = Object.values(productMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
      .map((product) => ({
        ...product,
        authenticity: Math.round((product.genuine / product.total) * 100) || 0,
        riskScore: calculateRiskScore(
          product.genuine,
          product.suspicious,
          product.invalid,
          product.alreadyUsed,
        ),
      }));

    console.log(
      `[TOP_VERIFICATIONS] Found ${topVerifications.length} products with verifications`,
    );

    return topVerifications;
  } catch (err) {
    console.error("[TOP_VERIFICATIONS] Error:", err);
    throw err;
  }
}
