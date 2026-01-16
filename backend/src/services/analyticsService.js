import prisma from "../models/prismaClient.js";

/**
 * Get manufacturer analytics data
 */
export async function getManufacturerAnalytics(manufacturerId) {
  try {
    // Get date range for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Verification trends (daily counts for last 30 days)
    const verificationTrends = await prisma.verificationLog.groupBy({
      by: ["createdAt"],
      where: {
        manufacturerId,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
    });

    // Verification by state/status
    const verificationByStatus = await prisma.verificationLog.groupBy({
      by: ["verificationState"],
      where: { manufacturerId },
      _count: { id: true },
    });

    // Location data for heatmap
    const locationData = await prisma.verificationLog.findMany({
      where: {
        manufacturerId,
        createdAt: { gte: thirtyDaysAgo },
        lat: { not: null },
        lng: { not: null },
      },
      select: {
        lat: true,
        lng: true,
        country: true,
        state: true,
        city: true,
        createdAt: true,
        verificationState: true,
      },
    });

    // Code performance metrics
    const codeMetrics = await prisma.code.groupBy({
      by: ["status"],
      where: { manufacturerId },
      _count: { id: true },
    });

    // Suspicious activity trends
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

    // Risk score calculation
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: {
        trustScore: true,
        riskLevel: true,
        _count: { select: { products: true, codes: true } },
      },
    });

    return {
      verificationTrends,
      verificationByStatus,
      locationData,
      codeMetrics,
      suspiciousTrends,
      manufacturer,
    };
  } catch (err) {
    console.error("[GET_MANUFACTURER_ANALYTICS] Error:", err);
    throw err;
  }
}

/**
 * Get hotspot predictions
 */
export async function getHotspotPredictions(manufacturerId) {
  try {
    // Get top verification locations
    const hotspots = await prisma.verificationLog.groupBy({
      by: ["country", "state", "city", "lat", "lng"],
      where: { manufacturerId },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    });

    // Group by location with frequency
    return hotspots.map((spot) => ({
      ...spot,
      frequency: spot._count.id,
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
      include: {
        code: { select: { value: true, batch: { select: { name: true } } } },
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
