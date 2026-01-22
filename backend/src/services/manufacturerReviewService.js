import prisma from "../models/prismaClient.js";

/**
 * Get manufacturer review queue (pending)
 */
export async function getManufacturerReviewQueue(status = "pending") {
  return prisma.manufacturerReview.findMany({
    where: { status },
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
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Get single manufacturer review
 */
export async function getManufacturerReview(manufacturerId) {
  return prisma.manufacturerReview.findUnique({
    where: { manufacturerId },
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
  });
}

/**
 * Create initial manufacturer review on registration
 */
export async function createManufacturerReview(manufacturerId) {
  return prisma.manufacturerReview.create({
    data: {
      manufacturerId,
      status: "pending",
    },
  });
}

/**
 * Approve manufacturer
 */
export async function approveManufacturer(
  manufacturerId,
  adminId,
  trustScore,
  notes,
) {
  // Get current state before update
  const currentReview = await prisma.manufacturerReview.findUnique({
    where: { manufacturerId },
  });

  // Update review
  const updatedReview = await prisma.manufacturerReview.update({
    where: { manufacturerId },
    data: {
      status: "approved",
      adminId,
      reviewedAt: new Date(),
      trustScore,
    },
  });

  // Update manufacturer status
  await prisma.manufacturer.update({
    where: { id: manufacturerId },
    data: {
      accountStatus: "approved",
      verified: true,
      trustScore,
    },
  });

  return {
    review: updatedReview,
    beforeState: currentReview,
    afterState: updatedReview,
  };
}

/**
 * Reject manufacturer
 */
export async function rejectManufacturer(
  manufacturerId,
  adminId,
  reason,
  requestedDocs = [],
) {
  const currentReview = await prisma.manufacturerReview.findUnique({
    where: { manufacturerId },
  });

  const updatedReview = await prisma.manufacturerReview.update({
    where: { manufacturerId },
    data: {
      status: "rejected",
      adminId,
      reviewedAt: new Date(),
      rejectionReason: reason,
      requestedDocuments: requestedDocs,
    },
  });

  // Update manufacturer status
  await prisma.manufacturer.update({
    where: { id: manufacturerId },
    data: {
      accountStatus: "rejected",
      verified: false,
    },
  });

  return {
    review: updatedReview,
    beforeState: currentReview,
    afterState: updatedReview,
  };
}

/**
 * Request additional documents
 */
export async function requestAdditionalDocuments(
  manufacturerId,
  adminId,
  documentTypes,
  reason,
) {
  return prisma.manufacturerReview.update({
    where: { manufacturerId },
    data: {
      status: "needs_docs",
      adminId,
      requestedDocuments: documentTypes,
      riskAssessment: reason,
    },
  });
}

/**
 * Set risk assessment
 */
export async function setRiskAssessment(
  manufacturerId,
  riskLevel,
  assessment,
  trustScore,
) {
  return prisma.manufacturerReview.update({
    where: { manufacturerId },
    data: {
      riskAssessment: assessment,
      trustScore,
    },
  });
}

/**
 * Get count of reviews by status
 */
export async function getReviewQueueStats() {
  const [pending, approved, rejected, needsDocs] = await Promise.all([
    prisma.manufacturerReview.count({ where: { status: "pending" } }),
    prisma.manufacturerReview.count({ where: { status: "approved" } }),
    prisma.manufacturerReview.count({ where: { status: "rejected" } }),
    prisma.manufacturerReview.count({ where: { status: "needs_docs" } }),
  ]);

  return {
    pending,
    approved,
    rejected,
    needsDocs,
    total: pending + approved + rejected + needsDocs,
  };
}

/**
 * Suspend manufacturer account
 */
export async function suspendManufacturer(manufacturerId, reason) {
  return prisma.manufacturer.update({
    where: { id: manufacturerId },
    data: {
      accountStatus: "suspended",
      verified: false,
    },
  });
}

/**
 * Reduce manufacturer quota
 */
export async function reduceManufacturerQuota(manufacturerId, newQuota) {
  return prisma.manufacturer.update({
    where: { id: manufacturerId },
    data: {
      plan: newQuota,
    },
  });
}

/**
 * Force audit of manufacturer
 */
export async function forceAuditManufacturer(manufacturerId) {
  return prisma.manufacturerReview.update({
    where: { manufacturerId },
    data: {
      status: "needs_docs",
      riskAssessment: "Forced audit initiated by admin",
    },
  });
}

/**
 * Get manufacturer with full details for admin view
 */
export async function getManufacturerAdminView(manufacturerId) {
  const manufacturer = await prisma.manufacturer.findUnique({
    where: { id: manufacturerId },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      batches: {
        select: {
          id: true,
          batchNumber: true,
          expirationDate: true,
        },
        take: 10,
        orderBy: { expirationDate: "desc" },
      },
      documents: {
        select: {
          id: true,
          documentType: true,
          uploadedAt: true,
          status: true,
        },
      },
      verificationLogs: {
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
        take: 20,
        orderBy: { createdAt: "desc" },
      },
      apiKeys: {
        select: {
          id: true,
          name: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
  });

  return manufacturer;
}
