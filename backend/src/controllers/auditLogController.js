import * as auditLogService from "../services/auditLogService.js";

/**
 * Get all audit logs
 */
export async function getAuditLogsController(req, res) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;

    const filters = {
      adminId: req.query.adminId,
      action: req.query.action,
      resourceType: req.query.resourceType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const result = await auditLogService.getAllAuditLogs(page, limit, filters);

    return res.status(200).json({
      success: true,
      data: result.logs,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages,
      },
    });
  } catch (err) {
    console.error("[GET_AUDIT_LOGS] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch audit logs",
    });
  }
}

/**
 * Get audit logs for a resource
 */
export async function getResourceAuditLogsController(req, res) {
  try {
    const { resourceType, resourceId } = req.params;

    const logs = await auditLogService.getResourceAuditLogs(
      resourceType,
      resourceId,
    );

    return res.status(200).json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (err) {
    console.error("[GET_RESOURCE_LOGS] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch resource logs",
    });
  }
}

/**
 * Get admin action history
 */
export async function getAdminHistoryController(req, res) {
  try {
    const { adminId } = req.params;
    const limit = req.query.limit || 100;

    const history = await auditLogService.getAdminActionHistory(adminId, limit);

    return res.status(200).json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (err) {
    console.error("[GET_ADMIN_HISTORY] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch admin history",
    });
  }
}

/**
 * Export audit logs
 */
export async function exportAuditLogsController(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Start and end dates required",
      });
    }

    const exportData = await auditLogService.exportAuditLogs(
      startDate,
      endDate,
    );

    // Set response headers for file download
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="audit-logs-${new Date().getTime()}.json"`,
    );

    return res.status(200).json(exportData);
  } catch (err) {
    console.error("[EXPORT_LOGS] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to export logs",
    });
  }
}

/**
 * Check for suspicious activity
 */
export async function checkSuspiciousActivityController(req, res) {
  try {
    const { adminId } = req.params;
    const hours = req.query.hours || 1;

    const result = await auditLogService.checkForSuspiciousActivity(
      adminId,
      hours,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("[CHECK_SUSPICIOUS] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to check activity",
    });
  }
}
