import * as adminDashboardService from "../services/adminDashboardService.js";
import * as auditLogService from "../services/auditLogService.js";

/**
 * Get global dashboard metrics
 */
export async function getGlobalMetricsController(req, res) {
  try {
    const metrics = await adminDashboardService.getGlobalMetrics();

    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (err) {
    console.error("[GET_METRICS] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch metrics",
    });
  }
}

/**
 * Get authenticity breakdown
 */
export async function getAuthenticityBreakdownController(req, res) {
  try {
    const breakdown = await adminDashboardService.getAuthenticityBreakdown();

    return res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (err) {
    console.error("[GET_AUTHENTICITY] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch authenticity data",
    });
  }
}

/**
 * Get verification trend
 */
export async function getVerificationTrendController(req, res) {
  try {
    const trend = await adminDashboardService.getVerificationTrend();

    return res.status(200).json({
      success: true,
      data: trend,
    });
  } catch (err) {
    console.error("[GET_TREND] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch trend data",
    });
  }
}

/**
 * Get hotspot clusters (Nigeria counterfeit radar)
 */
export async function getHotspotClustersController(req, res) {
  try {
    const minSuspicious = req.query.minSuspicious || 5;
    const hotspots =
      await adminDashboardService.getHotspotClusters(minSuspicious);

    return res.status(200).json({
      success: true,
      data: {
        hotspots,
        count: hotspots.length,
      },
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
 * Get high-risk manufacturers
 */
export async function getHighRiskManufacturersController(req, res) {
  try {
    const limit = req.query.limit || 10;
    const manufacturers =
      await adminDashboardService.getHighRiskManufacturers(limit);

    return res.status(200).json({
      success: true,
      data: manufacturers,
    });
  } catch (err) {
    console.error("[GET_HIGH_RISK] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch high-risk manufacturers",
    });
  }
}

/**
 * Get AI health score
 */
export async function getAIHealthScoreController(req, res) {
  try {
    const healthScore = await adminDashboardService.getAIHealthScore();

    return res.status(200).json({
      success: true,
      data: healthScore,
    });
  } catch (err) {
    console.error("[GET_AI_HEALTH] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch AI health score",
    });
  }
}

/**
 * Get critical alerts
 */
export async function getCriticalAlertsController(req, res) {
  try {
    const alerts = await adminDashboardService.getCriticalAlerts();

    return res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (err) {
    console.error("[GET_ALERTS] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch alerts",
    });
  }
}

/**
 * Export dashboard data
 */
export async function exportDashboardDataController(req, res) {
  try {
    const adminId = req.admin?.id;
    const data = await adminDashboardService.exportDashboardData();

    // Log export action
    await auditLogService.logAdminAction(
      adminId,
      "dashboard_export",
      "Dashboard",
      "dashboard",
      null,
      { exportDate: data.exportDate },
      "Admin exported dashboard data",
      req.ip,
      req.get("user-agent"),
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("[EXPORT_DASHBOARD] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to export dashboard data",
    });
  }
}

/**
 * Get false positives data
 */
export async function getFalsePositivesController(req, res) {
  try {
    // For now, return mock data for false positives
    // This would be calculated from verification logs in a real implementation
    const falsePositives = [
      {
        id: "fp-1",
        codeValue: "PROD-123456",
        manufacturer: "Sample Pharma",
        flaggedAs: "suspicious",
        actualResult: "genuine",
        confidence: 0.65,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "fp-2",
        codeValue: "MED-789012",
        manufacturer: "Health Labs",
        flaggedAs: "invalid",
        actualResult: "genuine",
        confidence: 0.58,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    return res.status(200).json({
      success: true,
      data: falsePositives,
      total: falsePositives.length,
    });
  } catch (err) {
    console.error("[GET_FALSE_POSITIVES] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch false positives data",
    });
  }
}

/**
 * Get flagged results
 */
export async function getFlaggedResultsController(req, res) {
  try {
    // For now, return mock data for flagged results
    // This would be from suspicious verification logs in a real implementation
    const flaggedResults = [
      {
        id: "flag-1",
        codeValue: "DRUG-456789",
        location: "Lagos, Nigeria",
        riskScore: 0.85,
        reason: "Suspicious pattern detected",
        timestamp: new Date(),
        status: "pending_review",
      },
      {
        id: "flag-2",
        codeValue: "CHEM-321654",
        location: "Abuja, Nigeria",
        riskScore: 0.72,
        reason: "Multiple attempts from same location",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        status: "reviewed",
      },
    ];

    return res.status(200).json({
      success: true,
      data: flaggedResults,
      total: flaggedResults.length,
    });
  } catch (err) {
    console.error("[GET_FLAGGED_RESULTS] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch flagged results",
    });
  }
}
