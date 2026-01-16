import prisma from "../models/prismaClient.js";

/**
 * List all pending manufacturer applications
 */
export async function getPendingManufacturers(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [manufacturers, total] = await Promise.all([
      prisma.manufacturer.findMany({
        where: { accountStatus: "pending_verification" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          country: true,
          createdAt: true,
          trustScore: true,
          riskLevel: true,
          documents: {
            select: {
              type: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limitNum,
      }),
      prisma.manufacturer.count({
        where: { accountStatus: "pending_verification" },
      }),
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
    console.error("[GET_PENDING_MANUFACTURERS] Error:", err);
    res.status(500).json({ error: "Failed to fetch pending manufacturers" });
  }
}

/**
 * Get detailed manufacturer application
 */
export async function getManufacturerApplication(req, res) {
  try {
    const { manufacturerId } = req.params;

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      include: {
        documents: true,
      },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    res.status(200).json(manufacturer);
  } catch (err) {
    console.error("[GET_MANUFACTURER_APPLICATION] Error:", err);
    res.status(500).json({ error: "Failed to fetch application" });
  }
}

/**
 * Approve manufacturer application
 */
export async function approveManufacturer(req, res) {
  try {
    const { manufacturerId } = req.params;
    const { notes } = req.body;

    const manufacturer = await prisma.manufacturer.update({
      where: { id: manufacturerId },
      data: {
        accountStatus: "active",
        verified: true,
        riskLevel: "LOW",
        trustScore: 100,
      },
    });

    // TODO: Send approval email to manufacturer

    res.status(200).json({
      message: "Manufacturer approved successfully",
      manufacturer,
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
