import prisma from "../models/prismaClient.js";

/**
 * Log an admin action (immutable)
 * This service NEVER deletes logs - they're permanent
 */
export async function logAdminAction(
  adminId,
  action,
  resourceType,
  resourceId,
  beforeState = null,
  afterState = null,
  reason = null,
  ipAddress = null,
  userAgent = null,
) {
  return prisma.adminAuditLog.create({
    data: {
      adminId,
      action,
      resourceType,
      resourceId,
      beforeState,
      afterState,
      reason,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    },
  });
}

/**
 * Get audit logs for a resource
 */
export async function getResourceAuditLogs(resourceType, resourceId) {
  return prisma.adminAuditLog.findMany({
    where: {
      resourceType,
      resourceId,
    },
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
    orderBy: { timestamp: "desc" },
  });
}

/**
 * Get all audit logs (paginated)
 */
export async function getAllAuditLogs(page = 1, limit = 50, filters = {}) {
  const skip = (page - 1) * limit;

  const where = {};
  if (filters.adminId) where.adminId = filters.adminId;
  if (filters.action) where.action = filters.action;
  if (filters.resourceType) where.resourceType = filters.resourceType;
  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) where.timestamp.gte = new Date(filters.startDate);
    if (filters.endDate) where.timestamp.lte = new Date(filters.endDate);
  }

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
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
      orderBy: { timestamp: "desc" },
      skip,
      take: limit,
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get audit logs for an admin user
 */
export async function getAdminActionHistory(adminId, limit = 100) {
  return prisma.adminAuditLog.findMany({
    where: { adminId },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}

/**
 * Export audit logs as JSON (for compliance)
 */
export async function exportAuditLogs(startDate, endDate) {
  const logs = await prisma.adminAuditLog.findMany({
    where: {
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    include: {
      admin: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    orderBy: { timestamp: "asc" },
  });

  return {
    exportDate: new Date().toISOString(),
    period: `${startDate} to ${endDate}`,
    totalRecords: logs.length,
    logs,
  };
}

/**
 * Check if action is suspicious (multiple attempts, failed logins, etc)
 */
export async function checkForSuspiciousActivity(adminId, hours = 1) {
  const recentLogs = await prisma.adminAuditLog.findMany({
    where: {
      adminId,
      timestamp: {
        gte: new Date(Date.now() - hours * 60 * 60 * 1000),
      },
    },
  });

  // Flag if many actions in short time
  if (recentLogs.length > 50) {
    return {
      suspicious: true,
      reason: "High action frequency detected",
      actionCount: recentLogs.length,
      timeWindow: `${hours} hour(s)`,
    };
  }

  // Check for sensitive action patterns
  const sensitiveActions = recentLogs.filter((log) =>
    [
      "reject_manufacturer",
      "suspend_manufacturer",
      "escalate_to_nafdac",
    ].includes(log.action),
  );

  if (sensitiveActions.length > 10) {
    return {
      suspicious: true,
      reason: "Multiple sensitive actions detected",
      sensitiveActionCount: sensitiveActions.length,
    };
  }

  return { suspicious: false };
}
