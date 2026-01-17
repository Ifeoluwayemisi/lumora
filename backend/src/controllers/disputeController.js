const {
  getDisputes,
  getDisputeById,
  createDispute,
  updateDisputeStatus,
  processRefund,
  rejectDispute,
  getDisputeStats,
  getRecentDisputes,
} = require("../services/disputeService");

/**
 * GET /admin/disputes
 * Get all disputes with filtering and pagination
 */
async function getAllDisputes(req, res) {
  try {
    const { status, manufacturerId, page = 1, limit = 10 } = req.query;

    const result = await getDisputes({
      status,
      manufacturerId,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching disputes:", error);
    res.status(500).json({ error: "Failed to fetch disputes" });
  }
}

/**
 * GET /admin/disputes/:id
 * Get specific dispute by ID
 */
async function getDisputeDetails(req, res) {
  try {
    const { id } = req.params;

    const dispute = await getDisputeById(id);

    if (!dispute) {
      return res.status(404).json({ error: "Dispute not found" });
    }

    res.json({ success: true, dispute });
  } catch (error) {
    console.error("Error fetching dispute:", error);
    res.status(500).json({ error: "Failed to fetch dispute" });
  }
}

/**
 * POST /admin/disputes
 * Create a new dispute (manufacturer files dispute against payment)
 */
async function fileDispute(req, res) {
  try {
    const { paymentId, reference, amount, reason, description } = req.body;

    if (!paymentId || !reason || !description) {
      return res.status(400).json({
        error: "Missing required fields: paymentId, reason, description",
      });
    }

    // Get manufacturer ID from payment
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { manufacturerId: true, reference: true, amount: true },
    });
    await prisma.$disconnect();

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const dispute = await createDispute({
      paymentId,
      manufacturerId: payment.manufacturerId,
      reference: payment.reference,
      amount: payment.amount,
      reason,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Dispute filed successfully",
      dispute,
    });
  } catch (error) {
    console.error("Error filing dispute:", error);
    res.status(400).json({ error: error.message || "Failed to file dispute" });
  }
}

/**
 * PATCH /admin/disputes/:id/investigate
 * Update dispute to UNDER_INVESTIGATION with notes
 */
async function startInvestigation(req, res) {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const dispute = await updateDisputeStatus(id, {
      status: "UNDER_INVESTIGATION",
      resolutionNotes: resolutionNotes || "Dispute is under investigation",
      resolvedBy: req.user.id,
    });

    res.json({
      success: true,
      message: "Investigation started",
      dispute,
    });
  } catch (error) {
    console.error("Error starting investigation:", error);
    res
      .status(400)
      .json({ error: error.message || "Failed to start investigation" });
  }
}

/**
 * PATCH /admin/disputes/:id/resolve
 * Resolve dispute with decision (RESOLVED status)
 */
async function resolveDispute(req, res) {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const dispute = await updateDisputeStatus(id, {
      status: "RESOLVED",
      resolutionNotes,
      resolvedBy: req.user.id,
    });

    res.json({
      success: true,
      message: "Dispute resolved",
      dispute,
    });
  } catch (error) {
    console.error("Error resolving dispute:", error);
    res
      .status(400)
      .json({ error: error.message || "Failed to resolve dispute" });
  }
}

/**
 * PATCH /admin/disputes/:id/refund
 * Process refund for dispute
 */
async function approveRefund(req, res) {
  try {
    const { id } = req.params;
    const { refundAmount } = req.body;

    const dispute = await processRefund(id, refundAmount, req.user.id);

    res.json({
      success: true,
      message: "Refund processed successfully",
      dispute,
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    res
      .status(400)
      .json({ error: error.message || "Failed to process refund" });
  }
}

/**
 * PATCH /admin/disputes/:id/reject
 * Reject dispute (no refund)
 */
async function rejectDisputeRequest(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const dispute = await rejectDispute(id, reason, req.user.id);

    res.json({
      success: true,
      message: "Dispute rejected",
      dispute,
    });
  } catch (error) {
    console.error("Error rejecting dispute:", error);
    res
      .status(400)
      .json({ error: error.message || "Failed to reject dispute" });
  }
}

/**
 * GET /admin/disputes/stats/overview
 * Get dispute statistics
 */
async function getStats(req, res) {
  try {
    const stats = await getDisputeStats();
    const recentDisputes = await getRecentDisputes(5);

    res.json({
      success: true,
      stats,
      recentDisputes,
    });
  } catch (error) {
    console.error("Error fetching dispute stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
}

module.exports = {
  getAllDisputes,
  getDisputeDetails,
  fileDispute,
  startInvestigation,
  resolveDispute,
  approveRefund,
  rejectDisputeRequest,
  getStats,
};
