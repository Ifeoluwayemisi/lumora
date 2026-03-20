import {
  getIncidents,
  updateIncidentStatus,
  getHotspots,
  getPredictedHotspots,
} from "../services/nafdacService.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function listIncidents(req, res) {
  try {
    const incidents = await getIncidents(req.query);
    res.status(200).json(incidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve incidents" });
  }
}

export async function updateIncident(req, res) {
  try {
    const { incidentId } = req.params;
    const { status } = req.body;

    if (!["ACKNOWLEDGED", "ESCALATED", "CLOSED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = await updateIncidentStatus(incidentId, status);
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update incident status" });
  }
}

export async function getHotspotData(req, res) {
  try {
    const data = await getHotspots();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve hotspot data" });
  }
}

export async function getPredictedHotspotsData(req, res) {
  try {
    const days = parseInt(req.query.days) || 30;
    const hotspots = await getPredictedHotspots(days);
    res.status(200).json(hotspots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate AI-predicted hotspots" });
  }
}

// ============ NAFDAC DASHBOARD METRICS ============

export async function getDashboardMetrics(req, res) {
  try {
    // Get total verifications
    const totalVerifications = await prisma.verification.count();

    // Get suspicious verifications (duplicates)
    const suspiciousVerifications = await prisma.verification.count({
      where: { isDuplicate: true },
    });

    // Get reused codes
    const reusedCodes = await prisma.qRCode.count({
      where: { scans: { gt: 1 } },
    });

    // Get unregistered products scans
    const unregisteredProducts = await prisma.verification.count({
      where: { status: "UNREGISTERED" },
    });

    // Get user reports
    const userReports = await prisma.report.count();

    // Get flagged manufacturers
    const flaggedManufacturers = await prisma.manufacturer.count({
      where: { flagged: true },
    });

    // Get high priority alerts
    const alerts = await prisma.report.findMany({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { product: true },
    });

    res.status(200).json({
      metrics: {
        totalVerifications,
        suspiciousVerifications,
        reusedCodes,
        unregisteredProducts,
        userReports,
        flaggedManufacturers,
      },
      alerts: alerts.map((alert) => ({
        id: alert.id,
        message: `New report: ${alert.product?.name || "Unknown"} - ${alert.location}`,
        severity: "high",
        timestamp: alert.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve dashboard metrics" });
  }
}

// ============ PRODUCTS MANAGEMENT ============

export async function getProductsList(req, res) {
  try {
    const { search, riskLevel } = req.query;
    let where = {};

    if (search) {
      where = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { manufacturer: { contains: search, mode: "insensitive" } },
          { batchId: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const products = await prisma.qRCode.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const enriched = products.map((code) => ({
      id: code.id,
      name: code.product?.name || "Unknown",
      batchId: code.code,
      manufacturer: code.manufacturerId,
      riskScore: Math.random() * 100, // Placeholder
      scans: code.scans || 0,
      status:
        code.scans > 5 ? "HIGH_RISK" : code.scans > 2 ? "SUSPICIOUS" : "SAFE",
    }));

    res.status(200).json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve products" });
  }
}

export async function blockProduct(req, res) {
  try {
    const { productId } = req.params;

    // Mark product as blocked/suspicious
    const blocked = await prisma.qRCode.update({
      where: { id: productId },
      data: {
        blocked: true,
        updatedAt: new Date(),
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Product blocked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to block product" });
  }
}

// ============ REPORTS MANAGEMENT ============

export async function getReportsList(req, res) {
  try {
    const { status, search } = req.query;
    let where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { location: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const reports = await prisma.report.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const enriched = reports.map((report) => ({
      id: report.id,
      product: report.product?.name || "Unknown",
      code: report.qrCodeId,
      location: report.location,
      message: report.message,
      status: report.status || "NEW",
      priority:
        report.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ? "CRITICAL"
          : "HIGH",
      timestamp: report.createdAt,
    }));

    res.status(200).json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve reports" });
  }
}

export async function escalateReport(req, res) {
  try {
    const { reportId } = req.params;

    const escalated = await prisma.report.update({
      where: { id: reportId },
      data: { status: "ESCALATED" },
    });

    res.status(200).json({ success: true, message: "Report escalated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to escalate report" });
  }
}

// ============ MANUFACTURERS MONITORING ============

export async function getManufacturersList(req, res) {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      include: {
        qRCodes: true,
        _count: { select: { qRCodes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = manufacturers.map((mfg) => ({
      id: mfg.id,
      name: mfg.name,
      status: mfg.flagged
        ? "SUSPENDED"
        : mfg.verified
          ? "COMPLIANT"
          : "WARNING",
      riskScore: mfg.flagged ? 85 : Math.random() * 50,
      codesGenerated: mfg._count.qRCodes || 0,
      suspiciousActivity: false,
      updatedAt: mfg.updatedAt,
    }));

    res.status(200).json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve manufacturers" });
  }
}

// ============ AUDIT LOGS ============

export async function getAuditLogs(req, res) {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const enriched = logs.map((log) => ({
      id: log.id,
      user: log.userId,
      action: log.action,
      target: log.target,
      details: log.details,
      severity: log.severity || "MEDIUM",
      timestamp: log.createdAt,
    }));

    res.status(200).json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve audit logs" });
  }
}
