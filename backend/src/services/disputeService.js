import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

/**
 * Get all disputes with optional filtering
 * @param {Object} options - Filter options
 * @param {String} options.status - Filter by status (OPEN, UNDER_INVESTIGATION, RESOLVED, REFUNDED, REJECTED)
 * @param {String} options.manufacturerId - Filter by manufacturer
 * @param {Number} options.page - Page number for pagination (default: 1)
 * @param {Number} options.limit - Results per page (default: 10)
 * @returns {Promise<Object>} Disputes with pagination
 */
async function getDisputes(options = {}) {
  const { status, manufacturerId, page = 1, limit = 10 } = options;

  const where = {};
  if (status) where.status = status;
  if (manufacturerId) where.manufacturerId = manufacturerId;

  const skip = (page - 1) * limit;

  const [disputes, total] = await Promise.all([
    prisma.dispute.findMany({
      where,
      include: {
        manufacturer: { select: { id: true, name: true, email: true } },
        payment: { select: { id: true, reference: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.dispute.count({ where }),
  ]);

  return {
    disputes,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get dispute by ID
 * @param {String} disputeId - Dispute ID
 * @returns {Promise<Object>} Dispute details
 */
async function getDisputeById(disputeId) {
  return prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      manufacturer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      payment: { select: { reference: true, amount: true, createdAt: true } },
    },
  });
}

/**
 * Create a new dispute
 * @param {Object} disputeData - Dispute information
 * @returns {Promise<Object>} Created dispute
 */
async function createDispute(disputeData) {
  const { paymentId, manufacturerId, reference, amount, reason, description } =
    disputeData;

  // Check if payment exists and is not already disputed
  const existingPayment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { dispute: true },
  });

  if (!existingPayment) {
    throw new Error("Payment not found");
  }

  if (existingPayment.dispute) {
    throw new Error("A dispute already exists for this payment");
  }

  return prisma.dispute.create({
    data: {
      paymentId,
      manufacturerId,
      reference,
      amount,
      reason,
      description,
      status: "OPEN",
    },
    include: {
      manufacturer: { select: { name: true, email: true } },
      payment: { select: { reference: true } },
    },
  });
}

/**
 * Update dispute status and add investigation notes
 * @param {String} disputeId - Dispute ID
 * @param {Object} updateData - Status, notes, etc.
 * @returns {Promise<Object>} Updated dispute
 */
async function updateDisputeStatus(disputeId, updateData) {
  const { status, resolutionNotes, refundAmount, resolvedBy } = updateData;

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
  });

  if (!dispute) {
    throw new Error("Dispute not found");
  }

  return prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status,
      resolutionNotes,
      refundAmount: refundAmount || dispute.refundAmount,
      resolvedBy,
      resolvedAt: status === "OPEN" ? null : new Date(),
    },
    include: {
      manufacturer: { select: { name: true, email: true } },
      payment: { select: { reference: true, amount: true } },
    },
  });
}

/**
 * Process refund for a dispute
 * @param {String} disputeId - Dispute ID
 * @param {Number} refundAmount - Refund amount in kobo
 * @param {String} resolvedBy - Admin userId
 * @returns {Promise<Object>} Updated dispute
 */
async function processRefund(disputeId, refundAmount, resolvedBy) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { payment: true },
  });

  if (!dispute) {
    throw new Error("Dispute not found");
  }

  if (dispute.status === "REFUNDED") {
    throw new Error("This dispute has already been refunded");
  }

  const actualRefundAmount = refundAmount || dispute.amount;

  return prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: "REFUNDED",
      refundAmount: actualRefundAmount,
      resolvedBy,
      refundedAt: new Date(),
      resolutionNotes: dispute.resolutionNotes || "Refund processed",
    },
    include: {
      manufacturer: { select: { name: true, email: true } },
      payment: { select: { reference: true, amount: true } },
    },
  });
}

/**
 * Reject dispute (no refund)
 * @param {String} disputeId - Dispute ID
 * @param {String} reason - Rejection reason
 * @param {String} resolvedBy - Admin userId
 * @returns {Promise<Object>} Updated dispute
 */
async function rejectDispute(disputeId, reason, resolvedBy) {
  return prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: "REJECTED",
      resolutionNotes: reason,
      resolvedBy,
      resolvedAt: new Date(),
    },
    include: {
      manufacturer: { select: { name: true, email: true } },
      payment: { select: { reference: true, amount: true } },
    },
  });
}

/**
 * Get dispute statistics for admin dashboard
 * @returns {Promise<Object>} Statistics
 */
async function getDisputeStats() {
  const [
    openCount,
    underInvestigationCount,
    resolvedCount,
    refundedCount,
    rejectedCount,
    totalAmount,
    refundedAmount,
  ] = await Promise.all([
    prisma.dispute.count({ where: { status: "OPEN" } }),
    prisma.dispute.count({ where: { status: "UNDER_INVESTIGATION" } }),
    prisma.dispute.count({ where: { status: "RESOLVED" } }),
    prisma.dispute.count({ where: { status: "REFUNDED" } }),
    prisma.dispute.count({ where: { status: "REJECTED" } }),
    prisma.dispute.aggregate({
      _sum: { amount: true },
    }),
    prisma.dispute.aggregate({
      where: { status: "REFUNDED" },
      _sum: { refundAmount: true },
    }),
  ]);

  return {
    openCount,
    underInvestigationCount,
    resolvedCount,
    refundedCount,
    rejectedCount,
    totalAmount: totalAmount._sum.amount || 0,
    refundedAmount: refundedAmount._sum.refundAmount || 0,
  };
}

/**
 * Get recent disputes
 * @param {Number} limit - Number of recent disputes to fetch
 * @returns {Promise<Array>} Recent disputes
 */
async function getRecentDisputes(limit = 5) {
  return prisma.dispute.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      manufacturer: { select: { name: true } },
      payment: { select: { reference: true, amount: true } },
    },
  });
}

export {
  getDisputes,
  getDisputeById,
  createDispute,
  updateDisputeStatus,
  processRefund,
  rejectDispute,
  getDisputeStats,
  getRecentDisputes,
};
