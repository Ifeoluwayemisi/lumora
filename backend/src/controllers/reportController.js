import prisma from "../models/prismaClient.js";

/**
 * POST /reports/submit
 * Submit a report for a suspicious product
 */
export async function submitReport(req, res) {
  try {
    const {
      codeValue,
      productName,
      reportType,
      description,
      location,
      purchaseDate,
      purchaseLocation,
      contact,
      latitude,
      longitude,
    } = req.body;

    // Validate required fields
    if (!codeValue || !reportType || !description) {
      return res.status(400).json({
        message: "Code value, report type, and description are required",
      });
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        codeValue: codeValue.trim(),
        productName: productName || null,
        reportType,
        description,
        location: location || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseLocation: purchaseLocation || null,
        contact: contact || null,
        latitude: latitude || null,
        longitude: longitude || null,
        userId: req.user?.id || null,
        status: "OPEN",
      },
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report: {
        id: report.id,
        codeValue: report.codeValue,
        status: report.status,
      },
    });
  } catch (err) {
    console.error("Error submitting report:", err);
    res.status(500).json({
      message: "Failed to submit report",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}

/**
 * GET /reports
 * Get all reports (admin only)
 */
export async function getReports(req, res) {
  try {
    // Check if user is admin
    if (req.user?.role !== "ADMIN" && req.user?.role !== "NAFDAC") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { status, skip = 0, take = 20 } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: parseInt(skip),
      take: parseInt(take),
    });

    const total = await prisma.report.count({ where });

    res.json({
      reports,
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take),
    });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch reports", error: err.message });
  }
}

/**
 * GET /reports/:id
 * Get a single report by ID (admin only)
 */
export async function getReport(req, res) {
  try {
    // Check if user is admin
    if (req.user?.role !== "ADMIN" && req.user?.role !== "NAFDAC") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({
      message: "Failed to fetch report",
      error: err.message,
    });
  }
}

/**
 * PATCH /reports/:id
 * Update report status (admin only)
 */
export async function updateReportStatus(req, res) {
  try {
    // Check if user is admin
    if (req.user?.role !== "ADMIN" && req.user?.role !== "NAFDAC") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: "Report status updated",
      report,
    });
  } catch (err) {
    console.error("Error updating report:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(500).json({
      message: "Failed to update report",
      error: err.message,
    });
  }
}

/**
 * GET /reports/code/:codeValue
 * Get all reports for a specific code
 */
export async function getReportsByCode(req, res) {
  try {
    const { codeValue } = req.params;

    const reports = await prisma.report.findMany({
      where: {
        codeValue: codeValue.toUpperCase(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      codeValue,
      reportCount: reports.length,
      reports,
    });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({
      message: "Failed to fetch reports",
      error: err.message,
    });
  }
}
