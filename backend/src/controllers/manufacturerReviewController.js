import * as manufacturerReviewService from "../services/manufacturerReviewService.js";
import * as auditLogService from "../services/auditLogService.js";
import prisma from "../models/prismaClient.js";

/**
 * Get manufacturer review queue
 */
export async function getReviewQueueController(req, res) {
  try {
    const status = req.query.status || "pending";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.manufacturerReview.count({
      where: { status },
    });

    // Get paginated queue with full manufacturer and review data
    const reviews = await manufacturerReviewService.getManufacturerReviewQueue(
      status,
      skip,
      limit,
    );

    // Flatten the response to include manufacturer details at top level
    const items = reviews.map((review) => ({
      id: review.manufacturerId,
      manufacturerId: review.manufacturerId,
      companyName: review.manufacturer.name,
      email: review.manufacturer.email,
      country: review.manufacturer.country,
      status: review.status,
      createdAt: review.createdAt,
      trustScore: review.trustScore,
      riskAssessment: review.riskAssessment,
      adminId: review.adminId,
    }));

    return res.status(200).json({
      success: true,
      data: {
        items,
        currentPage: page,
        pageSize: limit,
        total: total,
      },
      count: items.length,
    });
  } catch (err) {
    console.error("[GET_PENDING_MANUFACTURERS] Error:", err);
    res.status(500).json({ error: "Failed to fetch pending manufacturers" });
  }
}

/**
 * Get review queue stats
 */
export async function getReviewQueueStatsController(req, res) {
  try {
    const stats = await manufacturerReviewService.getReviewQueueStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.error("[GET_STATS] Error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}

/**
 * Get detailed manufacturer application
 */
export async function getManufacturerApplication(req, res) {
  try {
    const { manufacturerId } = req.params;

    // Get manufacturer with all details
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      include: {
        documents: true,
      },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    // Get or create review details
    let review = await prisma.manufacturerReview.findUnique({
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

    // If review doesn't exist, create it (for legacy manufacturers)
    if (!review) {
      review = await prisma.manufacturerReview.create({
        data: {
          manufacturerId,
          status: "pending",
        },
      });
    }

    // Combine manufacturer and review data
    const combined = {
      ...manufacturer,
      ...review,
    };

    console.log("[GET_MANUFACTURER_APPLICATION] Returning data for:", manufacturerId);
    console.log("[GET_MANUFACTURER_APPLICATION] Data keys:", Object.keys(combined));

    res.status(200).json(combined);
  } catch (err) {
    console.error("[GET_MANUFACTURER_APPLICATION] Error:", err);
    res.status(500).json({ error: "Failed to fetch application" });
  }
}

/**
 * Approve manufacturer application
 * Calculates initial trust and risk scores based on document verification
 */
export async function approveManufacturer(req, res) {
  try {
    const { manufacturerId } = req.params;
    const { notes } = req.body;

    // Import dynamic score calculation functions
    const { calculateDynamicTrustScore } =
      await import("../services/dynamicTrustScoreService.js");
    const { recalculateManufacturerRiskScore } =
      await import("../services/aiRiskService.js");
    const { sendAccountApprovalEmail } =
      await import("../services/notificationService.js");

    // Calculate dynamic trust score on approval (based on documents verified)
    const trustData = await calculateDynamicTrustScore(manufacturerId);
    const riskData = await recalculateManufacturerRiskScore(manufacturerId);

    const manufacturer = await prisma.manufacturer.update({
      where: { id: manufacturerId },
      data: {
        accountStatus: "active",
        verified: true,
        riskLevel: riskData.riskLevel || "MEDIUM",
        trustScore: trustData.trustScore || 75, // Default 75 for newly approved
      },
    });

    // Send approval email asynchronously (don't block response)
    sendAccountApprovalEmail(manufacturerId).catch((err) => {
      console.error("[APPROVAL] Failed to send email:", err.message);
    });

    res.status(200).json({
      message: "Manufacturer approved successfully",
      manufacturer,
      scores: {
        trustScore: manufacturer.trustScore,
        riskLevel: manufacturer.riskLevel,
      },
    });
  } catch (err) {
    console.error("[APPROVE_MANUFACTURER] Error:", err);
    res.status(500).json({ error: "Failed to approve manufacturer" });
  }
}

/**
 * Request more information from manufacturer
 */
export async function requestMoreInfo(req, res) {
  try {
    const { manufacturerId } = req.params;
    const { message, requiredDocuments } = req.body;

    const manufacturer = await prisma.manufacturer.update({
      where: { id: manufacturerId },
      data: {
        accountStatus: "pending_verification",
      },
    });

    // TODO: Send email with request to manufacturer

    res.status(200).json({
      message: "Information request sent",
      manufacturer,
    });
  } catch (err) {
    console.error("[REQUEST_MORE_INFO] Error:", err);
    res.status(500).json({ error: "Failed to send request" });
  }
}

/**
 * Reject manufacturer application
 */
export async function rejectManufacturer(req, res) {
  try {
    const { manufacturerId } = req.params;
    const { reason } = req.body;
    const { sendAccountRejectionEmail } =
      await import("../services/notificationService.js");

    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const manufacturer = await prisma.manufacturer.update({
      where: { id: manufacturerId },
      data: {
        accountStatus: "rejected",
        verified: false,
      },
    });

    // Send rejection email asynchronously (don't block response)
    sendAccountRejectionEmail(manufacturerId, reason).catch((err) => {
      console.error("[REJECTION] Failed to send email:", err.message);
    });

    // TODO: Send rejection email with reason

    res.status(200).json({
      message: "Manufacturer rejected",
      manufacturer,
    });
  } catch (err) {
    console.error("[REJECT_MANUFACTURER] Error:", err);
    res.status(500).json({ error: "Failed to reject manufacturer" });
  }
}

/**
 * List all manufacturers with review status
 */
export async function getAllManufacturers(req, res) {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const where = status ? { accountStatus: status } : {};

    const [manufacturers, total] = await Promise.all([
      prisma.manufacturer.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          country: true,
          accountStatus: true,
          verified: true,
          trustScore: true,
          riskLevel: true,
          createdAt: true,
          _count: {
            select: { products: true, batches: true, codes: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.manufacturer.count({ where }),
    ]);

    res.status(200).json({
      data: manufacturers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[GET_ALL_MANUFACTURERS] Error:", err);
    res.status(500).json({ error: "Failed to fetch manufacturers" });
  }
}
