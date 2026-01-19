import prisma from "../models/prismaClient.js";

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

    // Group by date in application code
    const verificationTrends = {};
    verificationRawData.forEach((log) => {
      const date = log.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      if (!verificationTrends[date]) {
        verificationTrends[date] = 0;
      }
      verificationTrends[date]++;
    });
    console.log(
      `[ANALYTICS_SERVICE-${serviceId}] Grouped into ${Object.keys(verificationTrends).length} days`,
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

    // Code performance metrics
    console.log(`[ANALYTICS_SERVICE-${serviceId}] Fetching code metrics...`);
    const codeMetrics = await prisma.code.groupBy({
      by: ["status"],
      where: { manufacturerId },
      _count: { id: true },
    });
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

    const result = {
      verificationTrends,
      verificationByStatus,
      locationData,
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
      message: err.message,
      code: err.code,
      stack: err.stack,
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
