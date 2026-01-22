import prisma from "../models/prismaClient.js";

/**
 * Prepare case data for NAFDAC export
 */
export async function prepareCaseForNAFDAC(caseId) {
  const caseFile = await prisma.caseFile.findUnique({
    where: { id: caseId },
    include: {
      userReports: {
        select: {
          id: true,
          location: true,
          reason: true,
          frequency: true,
          imagePath: true,
          reportedAt: true,
        },
      },
      notes: {
        select: {
          content: true,
          createdAt: true,
          isInternal: false, // Only public notes
        },
      },
    },
  });

  if (!caseFile) {
    throw new Error("Case not found");
  }

  return {
    caseNumber: caseFile.caseNumber,
    title: caseFile.title,
    description: caseFile.description,
    severity: caseFile.severity,
    locations: caseFile.locations,
    productId: caseFile.productId,
    batchId: caseFile.batchId,
    manufacturerId: caseFile.manufacturerId,
    userReports: caseFile.userReports,
    publicNotes: caseFile.notes,
    aiAnalysis: caseFile.aiAnalysis,
    evidence: caseFile.verificationEvidence,
    reportedDate: new Date().toISOString(),
  };
}

/**
 * Export multiple cases as NAFDAC bundle
 */
export async function exportCasesForNAFDAC(caseIds) {
  const cases = await Promise.all(
    caseIds.map((id) => prepareCaseForNAFDAC(id)),
  );

  return {
    bundleDate: new Date().toISOString(),
    totalCases: cases.length,
    cases,
    escalationReason: "Regulatory Escalation - Product Safety Investigation",
  };
}

/**
 * Generate NAFDAC incident report (PDF-ready data)
 */
export async function generateNAFDACIncidentReport(caseId) {
  const caseFile = await prisma.caseFile.findUnique({
    where: { id: caseId },
    include: {
      userReports: true,
      notes: {
        where: { isInternal: false },
      },
    },
  });

  if (!caseFile) {
    throw new Error("Case not found");
  }

  return {
    reportNumber: `NAFDAC-${caseFile.caseNumber}`,
    generatedDate: new Date().toISOString(),
    caseNumber: caseFile.caseNumber,
    caseSummary: {
      title: caseFile.title,
      description: caseFile.description,
      severity: caseFile.severity.toUpperCase(),
      affectedRegions: caseFile.locations,
      reportCount: caseFile.userReports.length,
    },
    userReportsSummary: {
      total: caseFile.userReports.length,
      byReason: groupReportsByReason(caseFile.userReports),
      geographicDistribution: groupReportsByLocation(caseFile.userReports),
      frequencyTrend: caseFile.userReports.reduce(
        (sum, r) => sum + r.frequency,
        0,
      ),
    },
    adminFindings: caseFile.notes.map((n) => ({
      finding: n.content,
      date: n.createdAt,
    })),
    aiAssessment: caseFile.aiAnalysis,
    recommendations: generateNAFDACRecommendations(caseFile),
  };
}

/**
 * Helper: group reports by reason
 */
function groupReportsByReason(reports) {
  const grouped = {};
  reports.forEach((r) => {
    grouped[r.reason] = (grouped[r.reason] || 0) + 1;
  });
  return grouped;
}

/**
 * Helper: group reports by location
 */
function groupReportsByLocation(reports) {
  const grouped = {};
  reports.forEach((r) => {
    grouped[r.location] = (grouped[r.location] || 0) + 1;
  });
  return grouped;
}

/**
 * Helper: generate recommendations
 */
function generateNAFDACRecommendations(caseFile) {
  const recommendations = [];

  if (caseFile.severity === "critical") {
    recommendations.push(
      "IMMEDIATE: Suspend product sale pending investigation",
    );
    recommendations.push("IMMEDIATE: Initiate market recall if applicable");
  }

  if (caseFile.userReports.length > 50) {
    recommendations.push(
      "URGENT: High frequency reports suggest widespread issue",
    );
  }

  recommendations.push("Conduct facility inspection");
  recommendations.push("Review manufacturing processes");
  recommendations.push("Verify authenticity of product samples");

  return recommendations;
}

/**
 * Track NAFDAC escalation status
 */
export async function updateNAFDACEscalationStatus(
  caseId,
  nafdacReference,
  status,
) {
  return prisma.caseFile.update({
    where: { id: caseId },
    data: {
      nafdacReported: true,
      nafdacReportDate: new Date(),
      nafdacReference,
      nafdacStatus: status,
    },
  });
}

/**
 * Get all NAFDAC-escalated cases
 */
export async function getNAFDACEscalatedCases() {
  return prisma.caseFile.findMany({
    where: { nafdacReported: true },
    select: {
      id: true,
      caseNumber: true,
      title: true,
      severity: true,
      nafdacStatus: true,
      nafdacReportDate: true,
      nafdacReference: true,
      locations: true,
    },
    orderBy: { nafdacReportDate: "desc" },
  });
}

/**
 * Create NAFDAC integration log
 */
export async function logNAFDACIntegration(
  caseId,
  action,
  nafdacReference = null,
  details = null,
) {
  // This could be extended to have a separate NAFDACLog table
  // For now, we log via case notes as internal
  const caseFile = await prisma.caseFile.findUnique({
    where: { id: caseId },
  });

  if (!caseFile) {
    throw new Error("Case not found");
  }

  const logEntry = {
    action,
    nafdacReference,
    caseNumber: caseFile.caseNumber,
    timestamp: new Date().toISOString(),
    details,
  };

  return logEntry;
}

/**
 * Send data to NAFDAC API (mock implementation)
 * In production, this would call actual NAFDAC API
 */
export async function sendToNAFDACAPI(bundleData) {
  // Mock implementation
  // In production, this would call:
  // POST https://nafdac-api.gov.ng/api/incidents
  // with proper authentication

  const mockResponse = {
    success: true,
    nafdacReferenceNumber: `NAFDAC-${Date.now()}`,
    message: "Case data received by NAFDAC",
    nextSteps: [
      "Investigation will be initiated within 24 hours",
      "You will receive status updates via this API",
      "Reference number can be used to track case progress",
    ],
  };

  return mockResponse;
}

/**
 * Check NAFDAC case status (mock implementation)
 */
export async function checkNAFDACCaseStatus(nafdacReference) {
  // Mock implementation
  // In production, would query NAFDAC API

  return {
    nafdacReference,
    status: "investigating",
    lastUpdate: new Date().toISOString(),
    progressPercentage: 45,
    estimatedCompletion: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  };
}

/**
 * Generate summary statistics for NAFDAC reporting
 */
export async function getNAFDACReportingStats() {
  const [totalEscalated, byStatus, byMonth] = await Promise.all([
    prisma.caseFile.count({ where: { nafdacReported: true } }),
    prisma.caseFile.groupBy({
      by: ["nafdacStatus"],
      where: { nafdacReported: true },
      _count: {
        id: true,
      },
    }),
    prisma.caseFile.findMany({
      where: { nafdacReported: true },
      select: { nafdacReportDate: true },
    }),
  ]);

  // Group by month
  const monthlyBreakdown = {};
  byMonth.forEach((c) => {
    if (c.nafdacReportDate) {
      const month = c.nafdacReportDate
        .toISOString()
        .split("T")[0]
        .substring(0, 7);
      monthlyBreakdown[month] = (monthlyBreakdown[month] || 0) + 1;
    }
  });

  return {
    totalEscalated,
    byStatus,
    monthlyTrend: monthlyBreakdown,
  };
}
