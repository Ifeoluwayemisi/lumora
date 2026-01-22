import prisma from "../models/prismaClient.js";
import { createNotification } from "./notificationService.js";

/**
 * Create batch recall
 */
export async function createBatchRecall(
  batchId,
  manufacturerId,
  reason,
  description,
) {
  const batch = await prisma.batch.findFirst({
    where: { id: batchId, manufacturerId },
  });

  if (!batch) {
    throw new Error("Batch not found");
  }

  const recall = await prisma.batchRecall.create({
    data: {
      batchId,
      manufacturerId,
      reason,
      description,
      status: "active",
    },
  });

  // Create notification
  await createNotification(
    batch.manufacturerId,
    "BATCH_RECALL",
    `Batch ${batch.batchNumber} has been recalled: ${reason}`,
  );

  return recall;
}

/**
 * Get batch recalls
 */
export async function getBatchRecalls(manufacturerId, status = null) {
  const where = { manufacturerId };
  if (status) where.status = status;

  return prisma.batchRecall.findMany({
    where,
    orderBy: { initiatedAt: "desc" },
  });
}

/**
 * Update batch recall status
 */
export async function updateBatchRecallStatus(
  recallId,
  manufacturerId,
  newStatus,
) {
  const recall = await prisma.batchRecall.findFirst({
    where: { id: recallId, manufacturerId },
  });

  if (!recall) {
    throw new Error("Batch recall not found");
  }

  return prisma.batchRecall.update({
    where: { id: recallId },
    data: {
      status: newStatus,
      closedAt: newStatus === "closed" ? new Date() : recall.closedAt,
    },
  });
}

/**
 * Check for expired batches and mark them
 */
export async function checkAndMarkExpiredBatches(manufacturerId) {
  const now = new Date();

  const expiredBatches = await prisma.batch.findMany({
    where: {
      manufacturerId,
      expirationDate: { lt: now },
    },
  });

  // Create audit log for each expired batch
  for (const batch of expiredBatches) {
    await prisma.analyticsAudit.create({
      data: {
        manufacturerId,
        actionType: "batch_expired",
        details: {
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          expirationDate: batch.expirationDate,
        },
      },
    });
  }

  return expiredBatches;
}

/**
 * Get batch expiration metrics
 */
export async function getBatchExpirationMetrics(manufacturerId) {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const [expired, expiringSoon, active] = await Promise.all([
    prisma.batch.count({
      where: {
        manufacturerId,
        expirationDate: { lt: now },
      },
    }),
    prisma.batch.count({
      where: {
        manufacturerId,
        expirationDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
    }),
    prisma.batch.count({
      where: {
        manufacturerId,
        expirationDate: { gt: thirtyDaysFromNow },
      },
    }),
  ]);

  return {
    expired,
    expiringWithin30Days: expiringWithin30Days,
    active,
    total: expired + expiringWithin30Days + active,
  };
}

/**
 * Get batches by expiration date range
 */
export async function getBatchesByExpirationRange(
  manufacturerId,
  startDate,
  endDate,
) {
  return prisma.batch.findMany({
    where: {
      manufacturerId,
      expirationDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { expirationDate: "asc" },
  });
}

/**
 * Send batch expiration alerts
 */
export async function sendBatchExpirationAlerts(manufacturerId) {
  const alerts = await checkAndMarkExpiredBatches(manufacturerId);

  // Create notification for each alert
  for (const batch of alerts) {
    const daysExpired = Math.floor(
      (new Date() - batch.expirationDate) / (1000 * 60 * 60 * 24),
    );

    await createNotification(
      manufacturerId,
      "BATCH_EXPIRED",
      `Batch ${batch.batchNumber} expired ${daysExpired} days ago`,
    );
  }

  return alerts.length;
}

/**
 * Get batch performance metrics
 */
export async function getBatchPerformanceMetrics(batchId, manufacturerId) {
  const batch = await prisma.batch.findFirst({
    where: { id: batchId, manufacturerId },
  });

  if (!batch) {
    throw new Error("Batch not found");
  }

  // Get verification data for this batch
  const verifications = await prisma.verificationLog.findMany({
    where: { batchId },
  });

  const genuine = verifications.filter(
    (v) => v.verificationState === "GENUINE",
  ).length;
  const suspicious = verifications.filter(
    (v) => v.verificationState === "SUSPICIOUS_PATTERN",
  ).length;
  const invalid = verifications.filter(
    (v) => v.verificationState === "INVALID",
  ).length;

  return {
    batchNumber: batch.batchNumber,
    totalVerifications: verifications.length,
    genuineCount: genuine,
    suspiciousCount: suspicious,
    invalidCount: invalid,
    authenticityRate:
      verifications.length > 0 ? (genuine / verifications.length) * 100 : 0,
    productionDate: batch.productionDate,
    expirationDate: batch.expirationDate,
    daysUntilExpiration: Math.floor(
      (batch.expirationDate - new Date()) / (1000 * 60 * 60 * 24),
    ),
  };
}

/**
 * Get all batch performance metrics for manufacturer
 */
export async function getAllBatchPerformanceMetrics(manufacturerId) {
  const batches = await prisma.batch.findMany({
    where: { manufacturerId },
  });

  const metrics = [];
  for (const batch of batches) {
    const metric = await getBatchPerformanceMetrics(batch.id, manufacturerId);
    metrics.push(metric);
  }

  return metrics;
}
