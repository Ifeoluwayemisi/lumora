import prisma from "../models/prismaClient.js";

/**
 * Create user report
 */
export async function createUserReport(reportData) {
  return prisma.userReport.create({
    data: {
      reporterId: reportData.reporterId || null,
      reporterEmail: reportData.reporterEmail || null,
      productName: reportData.productName,
      productCode: reportData.productCode,
      scanType: reportData.scanType, // MANUAL, QR
      location: reportData.location,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      reason: reportData.reason,
      description: reportData.description,
      imagePath: reportData.imagePath,
      verificationId: reportData.verificationId,
      productId: reportData.productId,
      manufacturerId: reportData.manufacturerId,
      status: "NEW",
      riskLevel: "PENDING",
      reportedAt: new Date(),
    },
  });
}

/**
 * Get user reports queue
 */
export async function getUserReports(status = null, limit = 50) {
  const where = {};
  if (status) where.status = status;

  return prisma.userReport.findMany({
    where,
    orderBy: { reportedAt: "desc" },
    take: limit,
  });
}

/**
 * Get user reports with pagination and full data enrichment
 */
export async function getUserReportsPaginated(
  status = null,
  page = 1,
  limit = 10,
) {
  const where = {};
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    prisma.userReport.findMany({
      where,
      include: {
        // Get admin review info if reviewed
        admin: {
          select: {
            id: true,
            email: true,
          },
        },
        // Get linked case if exists
        caseFile: {
          select: {
            id: true,
            caseNumber: true,
            status: true,
            severity: true,
          },
        },
      },
      orderBy: { reportedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.userReport.count({ where }),
  ]);

  // Now enrich with Code, Batch, Manufacturer, and User lookups
  const enrichedReports = await Promise.all(
    reports.map(async (report) => {
      let codeData = null;
      let userData = null;

      // Lookup Code if productCode provided
      if (report.productCode) {
        codeData = await prisma.code.findUnique({
          where: { codeValue: report.productCode },
          include: {
            batch: {
              include: {
                manufacturer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    verified: true,
                  },
                },
              },
            },
          },
        });
      }

      // Lookup User if reporterId provided
      if (report.reporterId) {
        userData = await prisma.user.findUnique({
          where: { id: report.reporterId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            verified: true,
          },
        });
      }

      // Enrich with resolved data
      return {
        ...report,
        // Reporter info - prioritize authenticated user over reporterEmail
        reporterName: userData?.name || report.reporterEmail || "Anonymous",
        reporterEmail: userData?.email || report.reporterEmail,
        reporterPhone: userData?.phone,
        reporterVerified: userData?.verified || false,
        // Product info - from code lookup or original capture
        productNameResolved:
          codeData?.batch?.name || report.productName || "Unknown Product",
        batchId: codeData?.batchId,
        batchNumber: codeData?.batch?.batchNumber,
        // Manufacturer info - from code lookup
        manufacturerResolved: codeData?.batch?.manufacturer?.name,
        manufacturerVerified: codeData?.batch?.manufacturer?.verified,
        // Reviewer info
        reviewedByAdminEmail: report.admin?.email,
        // Case linking
        caseNumber: report.caseFile?.caseNumber,
        caseStatus: report.caseFile?.status,
      };
    }),
  );

  return {
    reports: enrichedReports,
    total,
  };
}

/**
 * Get single user report
 */
export async function getUserReport(reportId) {
  return prisma.userReport.findUnique({
    where: { id: reportId },
  });
}

/**
 * Update user report status
 */
export async function updateReportStatus(
  reportId,
  status,
  adminId,
  notes = null,
) {
  return prisma.userReport.update({
    where: { id: reportId },
    data: {
      status,
      reviewedByAdminId: adminId,
      adminNotes: notes,
      reviewedAt: new Date(),
    },
  });
}

/**
 * Set risk level for report
 */
export async function setReportRiskLevel(reportId, riskLevel) {
  return prisma.userReport.update({
    where: { id: reportId },
    data: { riskLevel },
  });
}

/**
 * Link report to case file
 */
export async function linkReportToCase(reportId, caseId) {
  return prisma.userReport.update({
    where: { id: reportId },
    data: { relatedCaseId: caseId },
  });
}

/**
 * Increment report frequency (same product/location reported multiple times)
 */
export async function incrementReportFrequency(productCode, location) {
  // Find similar reports
  const existingReport = await prisma.userReport.findFirst({
    where: {
      productCode,
      location,
      status: { not: "DISMISSED" },
    },
    orderBy: { reportedAt: "desc" },
  });

  if (existingReport) {
    // Increment frequency on existing report
    return prisma.userReport.update({
      where: { id: existingReport.id },
      data: { frequency: existingReport.frequency + 1 },
    });
  }

  return null;
}

/**
 * Get reports for specific product
 */
export async function getProductReports(productId) {
  return prisma.userReport.findMany({
    where: { productId },
    orderBy: { reportedAt: "desc" },
  });
}

/**
 * Get reports for specific location
 */
export async function getLocationReports(location) {
  return prisma.userReport.findMany({
    where: { location },
    orderBy: { reportedAt: "desc" },
  });
}

/**
 * Get reports grouped by risk level
 */
export async function getReportsByRiskLevel() {
  const [critical, high, medium, low, pending] = await Promise.all([
    prisma.userReport.count({ where: { riskLevel: "CRITICAL" } }),
    prisma.userReport.count({ where: { riskLevel: "HIGH" } }),
    prisma.userReport.count({ where: { riskLevel: "MEDIUM" } }),
    prisma.userReport.count({ where: { riskLevel: "LOW" } }),
    prisma.userReport.count({ where: { riskLevel: "PENDING" } }),
  ]);

  return {
    CRITICAL: critical,
    HIGH: high,
    MEDIUM: medium,
    LOW: low,
    PENDING: pending,
    total: critical + high + medium + low + pending,
  };
}

/**
 * Get reports hotspot - locations with multiple reports
 */
export async function getReportHotspots(minReports = 3) {
  const hotspots = await prisma.userReport.groupBy({
    by: ["location"],
    where: {
      status: { not: "DISMISSED" },
    },
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: {
          gte: minReports,
        },
      },
    },
  });

  return hotspots;
}

/**
 * Get reports for manufacturer
 */
export async function getManufacturerReports(manufacturerId) {
  return prisma.userReport.findMany({
    where: { manufacturerId },
    orderBy: { reportedAt: "desc" },
  });
}

/**
 * Get report statistics
 */
export async function getReportStats() {
  const [
    newReports,
    underReviewReports,
    escalatedReports,
    closedReports,
    totalReports,
  ] = await Promise.all([
    prisma.userReport.count({ where: { status: "NEW" } }),
    prisma.userReport.count({ where: { status: "UNDER_REVIEW" } }),
    prisma.userReport.count({ where: { status: "ESCALATED" } }),
    prisma.userReport.count({ where: { status: "CLOSED" } }),
    prisma.userReport.count(),
  ]);

  return {
    new: newReports,
    underReview: underReviewReports,
    escalated: escalatedReports,
    closed: closedReports,
    total: totalReports,
  };
}
