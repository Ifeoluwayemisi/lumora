import prisma from "../models/prismaClient.js";
import {
  createBatchRecall,
  getBatchRecalls,
  updateBatchRecallStatus,
  getBatchExpirationMetrics,
  getBatchesByExpirationRange,
  sendBatchExpirationAlerts,
  getBatchPerformanceMetrics,
  getAllBatchPerformanceMetrics,
} from "../services/batchManagementService.js";

/**
 * POST /manufacturer/batches/:batchId/recall
 * Create batch recall
 */
export async function createBatchRecallController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const { batchId } = req.params;
    const { reason, description, recalledUnits } = req.body;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: reason, description",
      });
    }

    const recall = await createBatchRecall(
      batchId,
      manufacturer.id,
      reason,
      description,
    );

    // Log audit
    await prisma.analyticsAudit.create({
      data: {
        manufacturerId: manufacturer.id,
        actionType: "batch_recalled",
        details: {
          batchId,
          reason,
          recalledUnits: recalledUnits || null,
        },
        ipAddress: req.ip,
      },
    });

    res.status(201).json({
      success: true,
      data: recall,
    });
  } catch (error) {
    console.error("[CREATE_BATCH_RECALL] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /manufacturer/batches/recalls
 * Get batch recalls
 */
export async function getBatchRecallsController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const { status } = req.query;

    const recalls = await getBatchRecalls(manufacturer.id, status);

    res.json({
      success: true,
      data: recalls,
      total: recalls.length,
    });
  } catch (error) {
    console.error("[GET_BATCH_RECALLS] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PUT /manufacturer/batches/recalls/:recallId
 * Update batch recall status
 */
export async function updateBatchRecallStatusController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const { recallId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: status",
      });
    }

    const updated = await updateBatchRecallStatus(
      recallId,
      manufacturer.id,
      status,
    );

    // Log audit
    await prisma.analyticsAudit.create({
      data: {
        manufacturerId: manufacturer.id,
        actionType: "batch_recall_status_updated",
        details: {
          recallId,
          newStatus: status,
        },
        ipAddress: req.ip,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[UPDATE_BATCH_RECALL_STATUS] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /manufacturer/batches/expiration-metrics
 * Get batch expiration metrics
 */
export async function getBatchExpirationMetricsController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const metrics = await getBatchExpirationMetrics(manufacturer.id);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("[GET_BATCH_EXPIRATION_METRICS] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /manufacturer/batches/expiring
 * Get batches expiring in date range
 */
export async function getExpiringBatchesController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Missing required query params: startDate, endDate",
      });
    }

    const batches = await getBatchesByExpirationRange(
      manufacturer.id,
      new Date(startDate),
      new Date(endDate),
    );

    res.json({
      success: true,
      data: batches,
      total: batches.length,
    });
  } catch (error) {
    console.error("[GET_EXPIRING_BATCHES] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /manufacturer/batches/send-expiration-alerts
 * Send batch expiration alerts
 */
export async function sendBatchExpirationAlertsController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const count = await sendBatchExpirationAlerts(manufacturer.id);

    // Log audit
    await prisma.analyticsAudit.create({
      data: {
        manufacturerId: manufacturer.id,
        actionType: "batch_expiration_alerts_sent",
        details: {
          alertsCount: count,
        },
        ipAddress: req.ip,
      },
    });

    res.json({
      success: true,
      message: `${count} expiration alerts sent`,
    });
  } catch (error) {
    console.error("[SEND_BATCH_EXPIRATION_ALERTS] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /manufacturer/batches/:batchId/performance
 * Get batch performance metrics
 */
export async function getBatchPerformanceController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const { batchId } = req.params;

    const metrics = await getBatchPerformanceMetrics(batchId, manufacturer.id);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("[GET_BATCH_PERFORMANCE] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /manufacturer/batches/performance/all
 * Get all batch performance metrics
 */
export async function getAllBatchPerformanceController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    const metrics = await getAllBatchPerformanceMetrics(manufacturer.id);

    res.json({
      success: true,
      data: metrics,
      total: metrics.length,
    });
  } catch (error) {
    console.error("[GET_ALL_BATCH_PERFORMANCE] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
