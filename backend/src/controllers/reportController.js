import prisma from "../models/prismaClient.js";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import * as emailService from "../services/emailService.js";

/**
 * POST /reports/submit
 * Submit a report for a suspicious product with optional image
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
      // New fields
      reporterName,
      reporterPhone,
      batchNumber,
      healthImpact,
      healthSymptoms,
    } = req.body;

    let imagePath = null;

    // Handle file upload if present
    if (req.file) {
      try {
        const uploadDir = path.join(process.cwd(), "backend", "uploads", "reports");
        await fs.mkdir(uploadDir, { recursive: true });

        const filename = `${uuidv4()}-${Date.now()}.jpg`;
        const filepath = path.join(uploadDir, filename);

        // Save uploaded file
        await fs.writeFile(filepath, req.file.buffer);

        imagePath = `/uploads/reports/${filename}`;
        console.log("[REPORT] Image saved:", imagePath);
      } catch (uploadErr) {
        console.error("[REPORT] Image upload error:", uploadErr.message);
        // Continue without image rather than failing entire submission
      }
    }

    // Validate required fields
    if (!codeValue || !reportType || !description) {
      return res.status(400).json({
        message: "Code value, report type, and description are required",
      });
    }

    // Create both the old report (for backward compatibility) and the new userReport
    const [report, userReport] = await Promise.all([
      prisma.report.create({
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
      }),
      prisma.userReport.create({
        data: {
          reporterId: req.user?.id || null,
          reporterEmail: contact || reporterName || null,
          productName: productName || null,
          productCode: codeValue.trim(),
          scanType: "MANUAL",
          location: location || null,
          latitude: latitude || null,
          longitude: longitude || null,
          imagePath: imagePath,
          reason: reportType,
          description: [
            description,
            reporterName ? `Reporter: ${reporterName}` : null,
            reporterPhone ? `Phone: ${reporterPhone}` : null,
            batchNumber ? `Batch/Lot: ${batchNumber}` : null,
            healthImpact !== "no" ? `Health Impact: ${healthImpact}` : null,
            healthSymptoms ? `Symptoms: ${healthSymptoms}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          status: "NEW",
          riskLevel: healthImpact !== "no" ? "HIGH" : "PENDING",
          reportedAt: new Date(),
        },
      }),
    ]);

    // Send confirmation email if contact provided
    if (contact || reporterEmail) {
      const emailAddr = contact || reporterEmail;
      const caseName = `CASE-${userReport.id.substring(0, 8).toUpperCase()}`;
      
      emailService.sendReportReceivedEmail(emailAddr, reporterName, codeValue, caseName).catch(err => {
        console.error("[REPORT] Email send failed:", err.message);
      });
    }

    // If health impact reported, escalate to authorities
    if (healthImpact !== "no") {
      emailService.notifyAuthoritiesHealthAlert({
        reportId: userReport.id,
        codeValue,
        reporterName,
        healthImpact,
        healthSymptoms,
        location,
        reportedAt: userReport.reportedAt,
      }).catch(err => {
        console.error("[REPORT] Health alert escalation failed:", err.message);
      });

      // Also email reporter about health escalation
      if (contact || reporterEmail) {
        emailService.sendHealthAlertEmail(contact || reporterEmail, reporterName, codeValue, healthSymptoms).catch(err => {
          console.error("[REPORT] Health alert email send failed:", err.message);
        });
      }
    }

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
