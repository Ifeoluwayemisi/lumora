import prisma from "../models/prismaClient.js";

/**
 * Create case file
 */
export async function createCaseFile(caseData) {
  // Generate unique case number
  const caseNumber = `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  return prisma.caseFile.create({
    data: {
      caseNumber,
      productId: caseData.productId,
      batchId: caseData.batchId,
      manufacturerId: caseData.manufacturerId,
      primaryReportId: caseData.primaryReportId,
      title: caseData.title,
      description: caseData.description,
      locations: caseData.locations || [],
      status: "open",
      severity: caseData.severity || "medium",
      aiAnalysis: caseData.aiAnalysis,
      assignedAdminId: caseData.assignedAdminId,
    },
  });
}

/**
 * Get all case files
 */
export async function getCaseFiles(status = null) {
  const where = {};
  if (status) where.status = status;

  return prisma.caseFile.findMany({
    where,
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
      },
      assignedAdmin: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get single case file
 */
export async function getCaseFile(caseId) {
  return prisma.caseFile.findUnique({
    where: { id: caseId },
    include: {
      notes: {
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      assignedAdmin: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      userReports: {
        select: {
          id: true,
          reason: true,
          location: true,
          reportedAt: true,
          frequency: true,
        },
      },
    },
  });
}

/**
 * Update case status
 */
export async function updateCaseStatus(caseId, newStatus, closedReason = null) {
  const updateData = {
    status: newStatus,
  };

  if (newStatus === "closed") {
    updateData.closedAt = new Date();
    updateData.closedReason = closedReason;
  }

  return prisma.caseFile.update({
    where: { id: caseId },
    data: updateData,
  });
}

/**
 * Assign case to admin
 */
export async function assignCaseToAdmin(caseId, adminId) {
  return prisma.caseFile.update({
    where: { id: caseId },
    data: { assignedAdminId: adminId },
  });
}

/**
 * Add note to case
 */
export async function addCaseNote(caseId, adminId, content, isInternal = true) {
  return prisma.caseNote.create({
    data: {
      caseId,
      adminId,
      content,
      isInternal,
    },
  });
}

/**
 * Link user report to case
 */
export async function linkReportToCase(caseId, reportId) {
  return prisma.userReport.update({
    where: { id: reportId },
    data: { relatedCaseId: caseId },
  });
}

/**
 * Mark case as reported to NAFDAC
 */
export async function reportCaseToNAFDAC(caseId, nafdacReference = null) {
  return prisma.caseFile.update({
    where: { id: caseId },
    data: {
      nafdacReported: true,
      nafdacReportDate: new Date(),
      nafdacStatus: "pending",
      nafdacReference,
      status: "escalated",
    },
  });
}

/**
 * Update NAFDAC status for case
 */
export async function updateNAFDACStatus(caseId, nafdacStatus) {
  return prisma.caseFile.update({
    where: { id: caseId },
    data: { nafdacStatus },
  });
}

/**
 * Get cases by severity
 */
export async function getCasesBySeverity() {
  const [critical, high, medium, low] = await Promise.all([
    prisma.caseFile.count({
      where: { severity: "critical", status: { not: "closed" } },
    }),
    prisma.caseFile.count({
      where: { severity: "high", status: { not: "closed" } },
    }),
    prisma.caseFile.count({
      where: { severity: "medium", status: { not: "closed" } },
    }),
    prisma.caseFile.count({
      where: { severity: "low", status: { not: "closed" } },
    }),
  ]);

  return {
    critical,
    high,
    medium,
    low,
    total: critical + high + medium + low,
  };
}

/**
 * Get open cases
 */
export async function getOpenCases() {
  return prisma.caseFile.findMany({
    where: {
      status: { in: ["open", "under_review"] },
    },
    select: {
      id: true,
      caseNumber: true,
      title: true,
      severity: true,
      createdAt: true,
      assignedAdmin: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Get NAFDAC-escalated cases
 */
export async function getNAFDACEscalatedCases() {
  return prisma.caseFile.findMany({
    where: {
      nafdacReported: true,
      status: "escalated",
    },
    select: {
      id: true,
      caseNumber: true,
      title: true,
      nafdacStatus: true,
      nafdacReportDate: true,
      nafdacReference: true,
    },
    orderBy: { nafdacReportDate: "desc" },
  });
}

/**
 * Get case statistics
 */
export async function getCaseStats() {
  const [open, underReview, escalated, closed] = await Promise.all([
    prisma.caseFile.count({ where: { status: "open" } }),
    prisma.caseFile.count({ where: { status: "under_review" } }),
    prisma.caseFile.count({ where: { status: "escalated" } }),
    prisma.caseFile.count({ where: { status: "closed" } }),
  ]);

  const nafdacReported = await prisma.caseFile.count({
    where: { nafdacReported: true },
  });

  return {
    open,
    underReview,
    escalated,
    closed,
    nafdacReported,
    active: open + underReview + escalated,
    total: open + underReview + escalated + closed,
  };
}

/**
 * Search cases
 */
export async function searchCases(query) {
  return prisma.caseFile.findMany({
    where: {
      OR: [
        { caseNumber: { contains: query, mode: "insensitive" } },
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
}
