import * as userReportService from "../services/userReportService.js";
import * as auditLogService from "../services/auditLogService.js";

/**
 * Get user reports (all or by status)
 */
export async function getUserReportsController(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;

    const result = await userReportService.getUserReportsPaginated(status, page, limit);

    return res.status(200).json({
      success: true,
      data: {
        items: result.reports,
        currentPage: page,
        pageSize: limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (err) {
    console.error("[GET_REPORTS] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch reports",
    });
  }
}

/**
 * Get single user report
 */
export async function getReportDetailController(req, res) {
  try {
    const { reportId } = req.params;

    const report = await userReportService.getUserReport(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    console.error("[GET_REPORT] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch report",
    });
  }
}

/**
 * Mark report as reviewed
 */
export async function markReportReviewedController(req, res) {
  try {
    const adminId = req.admin?.id;
    const { reportId } = req.params;
    const { status, riskLevel, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error:
          "Status required (Valid Concern, False Alarm, Needs Investigation)",
      });
    }

    const report = await userReportService.updateReportStatus(
      reportId,
      status,
      adminId,
      notes,
    );

    if (riskLevel) {
      await userReportService.setReportRiskLevel(reportId, riskLevel);
    }

    // Log action
    await auditLogService.logAdminAction(
      adminId,
      "review_user_report",
      "UserReport",
      reportId,
      null,
      { status, riskLevel },
      notes || `Marked as ${status}`,
      req.ip,
      req.get("user-agent"),
    );

    return res.status(200).json({
      success: true,
      data: report,
      message: "Report reviewed",
    });
  } catch (err) {
    console.error("[MARK_REVIEWED] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to review report",
    });
  }
}

/**
 * Link report to case
 */
export async function linkReportToCaseController(req, res) {
  try {
    const adminId = req.admin?.id;
    const { reportId } = req.params;
    const { caseId } = req.body;

    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: "Case ID required",
      });
    }

    const report = await userReportService.linkReportToCase(reportId, caseId);

    // Log action
    await auditLogService.logAdminAction(
      adminId,
      "link_report_to_case",
      "UserReport",
      reportId,
      null,
      { caseId },
      `Linked to case ${caseId}`,
      req.ip,
      req.get("user-agent"),
    );

    return res.status(200).json({
      success: true,
      data: report,
      message: "Report linked to case",
    });
  } catch (err) {
    console.error("[LINK_REPORT] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to link report",
    });
  }
}

/**
 * Get reports by risk level
 */
export async function getReportsByRiskController(req, res) {
  try {
    const breakdown = await userReportService.getReportsByRiskLevel();

    return res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (err) {
    console.error("[GET_RISK_BREAKDOWN] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch risk breakdown",
    });
  }
}

/**
 * Get report hotspots
 */
export async function getReportHotspotsController(req, res) {
  try {
    const minReports = req.query.minReports || 3;
    const hotspots = await userReportService.getReportHotspots(minReports);

    return res.status(200).json({
      success: true,
      data: hotspots,
      count: hotspots.length,
    });
  } catch (err) {
    console.error("[GET_HOTSPOTS] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch hotspots",
    });
  }
}

/**
 * Get report statistics
 */
export async function getReportStatsController(req, res) {
  try {
    const stats = await userReportService.getReportStats();

    return res.status(200).json({
      success: true,
      data: {
        newCount: stats.new,
        underReviewCount: stats.underReview,
        escalatedCount: stats.escalated,
        closedCount: stats.closed,
        totalCount: stats.total,
      },
    });
  } catch (err) {
    console.error("[GET_STATS] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
}

/**
 * Dismiss report
 */
export async function dismissReportController(req, res) {
  try {
    const adminId = req.admin?.id;
    const { reportId } = req.params;
    const { reason } = req.body;

    const report = await userReportService.updateReportStatus(
      reportId,
      "DISMISSED",
      adminId,
      reason,
    );

    // Log action
    await auditLogService.logAdminAction(
      adminId,
      "dismiss_user_report",
      "UserReport",
      reportId,
      null,
      { status: "DISMISSED" },
      reason || "Report dismissed",
      req.ip,
      req.get("user-agent"),
    );

    return res.status(200).json({
      success: true,
      data: report,
      message: "Report dismissed",
    });
  } catch (err) {
    console.error("[DISMISS_REPORT] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to dismiss report",
    });
  }
}
