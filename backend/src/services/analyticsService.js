import prisma from "../models/prismaClient.js";
import { checkAndSendProductRiskAlert } from "./riskAlertService.js";

/**
 * Reverse geocode coordinates to location name using Open Street Map (free)
 */
async function reverseGeocode(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          "User-Agent": "Lumora-Verification-System",
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const address = data.address || {};

    // Extract city, state, country
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      "Unknown";
    const state = address.state || "Unknown";
    const country = address.country || "Unknown";

    return {
      location: `${city}, ${state}, ${country}`,
      city,
      state,
      country,
    };
  } catch (err) {
    console.warn(
      `[REVERSE_GEOCODE] Failed for ${latitude}, ${longitude}:`,
      err.message,
    );
    return null;
  }
}

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
        authenticity:
          loc.total > 0 ? Math.round((loc.genuine / loc.total) * 100) : 0,
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
      take: 50,
    });

    // Group by location to get frequency
    const locationMap = {};
    hotspots.forEach((spot) => {
      const locationKey = spot.location || "Unknown";
      if (!locationMap[locationKey]) {
        locationMap[locationKey] = {
          location: spot.location || "Unknown",
          latitude: spot.latitude,
          longitude: spot.longitude,
          frequency: 0,
          verificationStates: [],
          lastVerifiedAt: spot.createdAt,
        };
      }
      locationMap[locationKey].frequency++;
      if (
        !locationMap[locationKey].verificationStates.includes(
          spot.verificationState,
        )
      ) {
        locationMap[locationKey].verificationStates.push(
          spot.verificationState,
        );
      }
    });

    // Convert to array and sort by frequency
    const grouped = Object.values(locationMap)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20);

    // Parse location string into components (e.g., "Lagos, Lagos, NG" -> city, state, country)
    return await Promise.all(
      grouped.map(async (spot, index) => {
        let city = "Unknown",
          state = "Unknown",
          country = "Unknown",
          location = spot.location;

        // Try to parse existing location string
        if (spot.location && spot.location.trim()) {
          const parts = spot.location
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p.length > 0);

          // Handle different location formats
          if (parts.length >= 3) {
            // Full format: city, state, country
            city = parts[0];
            state = parts[1];
            country = parts[2];
          } else if (parts.length === 2) {
            // Partial format: city, country
            city = parts[0];
            country = parts[1];
          } else if (parts.length === 1) {
            // Just one part
            city = parts[0];
          }
        } else {
          // Location is empty/null, try reverse geocoding from coordinates
          const geocoded = await reverseGeocode(spot.latitude, spot.longitude);
          if (geocoded) {
            city = geocoded.city;
            state = geocoded.state;
            country = geocoded.country;
            location = geocoded.location;
          } else {
            // Reverse geocoding failed - use coordinates as fallback
            city = `Lat: ${spot.latitude.toFixed(4)}`;
            state = `Lng: ${spot.longitude.toFixed(4)}`;
            country = "GPS Coordinates";
            location = `${spot.latitude.toFixed(4)}, ${spot.longitude.toFixed(4)}`;
          }
        }

        // Generate Google Maps URL
        const mapsUrl = `https://www.google.com/maps/search/${spot.latitude},${spot.longitude}`;

        return {
          id: index,
          lat: spot.latitude,
          lng: spot.longitude,
          location: location || `${city}, ${state}, ${country}`,
          city: city || "Unknown",
          state: state || "Unknown",
          country: country || "Unknown",
          frequency: spot.frequency,
          verificationStates: spot.verificationStates,
          lastVerifiedAt: spot.lastVerifiedAt,
          mapsUrl,
        };
      }),
    );
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

/**
 * Get products with risk metrics for manufacturer dashboard
 */
export async function getProductsWithRisk(manufacturerId, limit = 20) {
  try {
    console.log(
      `[PRODUCTS_WITH_RISK] Getting products with risk for manufacturerId: ${manufacturerId}`,
    );

    // Get all products for this manufacturer
    const products = await prisma.product.findMany({
      where: { manufacturerId },
      select: {
        id: true,
        name: true,
        category: true,
        skuPrefix: true,
      },
      take: limit,
    });

    console.log(`[PRODUCTS_WITH_RISK] Found ${products.length} products`);

    // Get verification data for all codes of these products
    const verifications = await prisma.verificationLog.findMany({
      where: {
        code: {
          batch: {
            product: {
              manufacturerId,
            },
          },
        },
      },
      select: {
        code: {
          select: {
            batch: {
              select: {
                product: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        verificationState: true,
      },
    });

    console.log(
      `[PRODUCTS_WITH_RISK] Found ${verifications.length} total verifications`,
    );

    // Group verifications by product
    const productVerificationMap = {};
    verifications.forEach((verification) => {
      const productId = verification.code?.batch?.product?.id;
      if (!productId) return;

      if (!productVerificationMap[productId]) {
        productVerificationMap[productId] = {
          total: 0,
          genuine: 0,
          suspicious: 0,
          invalid: 0,
          alreadyUsed: 0,
          unregistered: 0,
        };
      }

      productVerificationMap[productId].total++;

      switch (verification.verificationState) {
        case "GENUINE":
          productVerificationMap[productId].genuine++;
          break;
        case "SUSPICIOUS":
          productVerificationMap[productId].suspicious++;
          break;
        case "INVALID":
          productVerificationMap[productId].invalid++;
          break;
        case "CODE_ALREADY_USED":
          productVerificationMap[productId].alreadyUsed++;
          break;
        case "UNREGISTERED":
          productVerificationMap[productId].unregistered++;
          break;
      }
    });

    // Enhance products with risk metrics
    const productsWithRisk = products.map((product) => {
      const stats = productVerificationMap[product.id] || {
        total: 0,
        genuine: 0,
        suspicious: 0,
        invalid: 0,
        alreadyUsed: 0,
        unregistered: 0,
      };

      const authenticity =
        stats.total > 0 ? Math.round((stats.genuine / stats.total) * 100) : 0;

      const riskScore = calculateRiskScore(
        stats.genuine,
        stats.suspicious,
        stats.invalid,
        stats.alreadyUsed,
      );

      // Determine risk level and status
      let riskLevel = "LOW";
      let status = "NEW";

      if (stats.total === 0) {
        // No verifications yet
        status = "NEW";
        riskLevel = "UNVERIFIED";
      } else if (riskScore >= 70) {
        riskLevel = "CRITICAL";
        status = "CRITICAL";
      } else if (riskScore >= 50) {
        riskLevel = "HIGH";
        status = "AT_RISK";
      } else if (authenticity >= 95) {
        riskLevel = "LOW";
        status = "VERIFIED_SAFE";
      } else {
        riskLevel = "LOW";
        status = "LOW_RISK";
      }

      // Trigger alert if risk is high or critical (async, don't wait)
      if (riskScore >= 50) {
        checkAndSendProductRiskAlert(
          manufacturerId,
          product.id,
          riskScore,
          riskLevel,
        ).catch((err) => {
          console.error(
            `[PRODUCTS_WITH_RISK] Failed to send alert for product ${product.id}:`,
            err?.message,
          );
        });
      }

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        skuPrefix: product.skuPrefix,
        ...stats,
        authenticity,
        riskScore,
        riskLevel,
        status,
        needsAttention: riskScore >= 50, // Flag products with 50+ risk score
      };
    });

    // Sort by risk score (highest first)
    const sorted = productsWithRisk.sort((a, b) => b.riskScore - a.riskScore);

    console.log(
      `[PRODUCTS_WITH_RISK] Returning ${sorted.length} products with risk metrics`,
    );

    return sorted;
  } catch (err) {
    console.error("[PRODUCTS_WITH_RISK] Error:", err);
    throw err;
  }
}

/**
 * PHASE 2: Get overall manufacturer trust metrics
 * Calculates: overall authenticity %, trust badge status, alert counts
 */
export async function getManufacturerTrustMetrics(manufacturerId) {
  try {
    console.log(
      `[TRUST_METRICS] Calculating for manufacturerId: ${manufacturerId}`,
    );

    // Get all verifications for this manufacturer
    const allVerifications = await prisma.verificationLog.findMany({
      where: { manufacturerId },
      select: { verificationState: true, createdAt: true },
    });

    if (allVerifications.length === 0) {
      return {
        overallAuthenticity: 0,
        trustBadge: "NEW_SELLER",
        trustLevel: "UNVERIFIED",
        totalVerifications: 0,
        alertCounts: { critical: 0, high: 0, medium: 0 },
        trustScore: 0,
        message: "No verification data yet",
      };
    }

    // Calculate overall authenticity
    const genuineCount = allVerifications.filter(
      (v) => v.verificationState === "GENUINE",
    ).length;
    const overallAuthenticity = Math.round(
      (genuineCount / allVerifications.length) * 100,
    );

    // Determine trust badge based on authenticity
    let trustBadge = "SAFE";
    let trustLevel = "VERIFIED";
    let message = "";

    if (overallAuthenticity >= 98) {
      trustBadge = "ELITE";
      trustLevel = "ELITE_SELLER";
      message = "Outstanding authenticity record";
    } else if (overallAuthenticity >= 95) {
      trustBadge = "VERIFIED";
      trustLevel = "VERIFIED_SELLER";
      message = "Excellent authenticity record";
    } else if (overallAuthenticity >= 90) {
      trustBadge = "TRUSTED";
      trustLevel = "TRUSTED_SELLER";
      message = "Good authenticity record";
    } else if (overallAuthenticity >= 80) {
      trustBadge = "CAUTION";
      trustLevel = "MONITOR";
      message = "Some counterfeiting detected";
    } else {
      trustBadge = "AT_RISK";
      trustLevel = "AT_RISK";
      message = "Significant counterfeiting issues";
    }

    // Get alert counts from RiskAlert table
    const alertCounts = {
      critical: await prisma.riskAlert.count({
        where: {
          manufacturerId,
          riskLevel: "CRITICAL",
          status: "sent",
        },
      }),
      high: await prisma.riskAlert.count({
        where: {
          manufacturerId,
          riskLevel: "HIGH",
          status: "sent",
        },
      }),
      medium: await prisma.riskAlert.count({
        where: {
          manufacturerId,
          riskLevel: "MEDIUM",
          status: "sent",
        },
      }),
    };

    // Calculate trust score (0-100)
    const trustScore = Math.round(
      overallAuthenticity * 0.7 + (100 - alertCounts.critical * 5) * 0.3,
    );

    return {
      overallAuthenticity,
      trustBadge,
      trustLevel,
      totalVerifications: allVerifications.length,
      genuineCount,
      alertCounts,
      trustScore,
      message,
    };
  } catch (err) {
    console.error("[TRUST_METRICS] Error:", err);
    throw err;
  }
}

/**
 * PHASE 2: Get 30-day authenticity trend data for charts
 */
export async function getAuthenticityTrend(manufacturerId, days = 30) {
  try {
    console.log(
      `[AUTHENTICITY_TREND] Calculating ${days}-day trend for manufacturerId: ${manufacturerId}`,
    );

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const verifications = await prisma.verificationLog.findMany({
      where: {
        manufacturerId,
        createdAt: { gte: startDate },
      },
      select: {
        verificationState: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by day
    const dailyData = {};
    verifications.forEach((v) => {
      const dateKey = new Date(v.createdAt).toISOString().split("T")[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          genuine: 0,
          suspicious: 0,
          invalid: 0,
          alreadyUsed: 0,
          unregistered: 0,
          total: 0,
        };
      }

      dailyData[dateKey].total++;
      switch (v.verificationState) {
        case "GENUINE":
          dailyData[dateKey].genuine++;
          break;
        case "SUSPICIOUS":
          dailyData[dateKey].suspicious++;
          break;
        case "INVALID":
          dailyData[dateKey].invalid++;
          break;
        case "CODE_ALREADY_USED":
          dailyData[dateKey].alreadyUsed++;
          break;
        case "UNREGISTERED":
          dailyData[dateKey].unregistered++;
          break;
      }
    });

    // Convert to array and add authenticity percentage
    const trend = Object.values(dailyData)
      .map((day) => ({
        ...day,
        authenticity:
          day.total > 0 ? Math.round((day.genuine / day.total) * 100) : 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return trend;
  } catch (err) {
    console.error("[AUTHENTICITY_TREND] Error:", err);
    throw err;
  }
}

/**
 * PHASE 2: Get alert summary (counts by status and severity)
 */
export async function getAlertSummary(manufacturerId) {
  try {
    console.log(
      `[ALERT_SUMMARY] Getting for manufacturerId: ${manufacturerId}`,
    );

    const alerts = await prisma.riskAlert.findMany({
      where: { manufacturerId },
      select: {
        riskLevel: true,
        status: true,
        createdAt: true,
        sentAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Summary counts
    const summary = {
      totalAlerts: alerts.length,
      byStatus: {
        pending: alerts.filter((a) => a.status === "pending").length,
        sent: alerts.filter((a) => a.status === "sent").length,
        failed: alerts.filter((a) => a.status === "failed").length,
      },
      bySeverity: {
        critical: alerts.filter((a) => a.riskLevel === "CRITICAL").length,
        high: alerts.filter((a) => a.riskLevel === "HIGH").length,
        medium: alerts.filter((a) => a.riskLevel === "MEDIUM").length,
      },
      lastAlert:
        alerts.length > 0 ? alerts[0].sentAt || alerts[0].createdAt : null,
      recentAlerts: alerts.slice(0, 5),
    };

    return summary;
  } catch (err) {
    console.error("[ALERT_SUMMARY] Error:", err);
    throw err;
  }
}

export { reverseGeocode };
