import * as caseManagementService from "../services/caseManagementService.js";
import * as nafdacService from "../services/nafdacIntegrationService.js";
import * as auditLogService from "../services/auditLogService.js";

/**
 * Get all case files
 */
export async function getCaseFilesController(req, res) {
  try {
    const status = req.query.status || null;
    const cases = await caseManagementService.getCaseFiles(status);

    return res.status(200).json({
      success: true,
      data: cases,
      count: cases.length,
    });
  } catch (err) {
    console.error("[GET_CASES] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch cases",
    });
  }
}

/**
 * Get single case file
 */
export async function getCaseDetailController(req, res) {
  try {
    const { caseId } = req.params;
    const caseFile = await caseManagementService.getCaseFile(caseId);

    if (!caseFile) {
      return res.status(404).json({
        success: false,
        error: "Case not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: caseFile,
    });
  } catch (err) {
    console.error("[GET_CASE] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch case",
    });
  }
}

/**
 * Create case file
 */
export async function createCaseController(req, res) {
  try {
    const adminId = req.admin?.id;
    const {
      title,
      description,
      productId,
      batchId,
      manufacturerId,
      severity,
      locations,
      primaryReportId,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Title required",
      });
    }

    const caseFile = await caseManagementService.createCaseFile({
      title,
      description,
      productId,
      batchId,
      manufacturerId,
      severity: severity || "medium",
      locations,
      primaryReportId,
      assignedAdminId: adminId,
    });

    // Log action
    await auditLogService.logAdminAction(
      adminId,
      "create_case",
      "CaseFile",
      caseFile.id,
      null,
      { title, severity },
      `Case created: ${title}`,
      req.ip,
      req.get("user-agent"),
    );

    return res.status(201).json({
      success: true,
      data: caseFile,
      message: "Case created",
    });
  } catch (err) {
    console.error("[CREATE_CASE] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to create case",
    });
  }
}

/**
 * Update case status
 */
export async function updateCaseStatusController(req, res) {
  try {
    const adminId = req.admin?.id;
    const { caseId } = req.params;
    const { status, closedReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status required",
      });
    }

    const caseFile = await caseManagementService.updateCaseStatus(
      caseId,
      status,
      closedReason,
    );

    // Log action
    await auditLogService.logAdminAction(
      adminId,
      "update_case_status",
      "CaseFile",
      caseId,
      null,
      { status },
      `Status changed to ${status}`,
      req.ip,
      req.get("user-agent"),
    );

    return res.status(200).json({
      success: true,
      data: caseFile,
      message: "Case updated",
    });
  } catch (err) {
    console.error("[UPDATE_CASE] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to update case",
    });
  }
}

/**
 * Add note to case
 */
export async function addCaseNoteController(req, res) {
  try {
    const adminId = req.admin?.id;
    const { caseId } = req.params;
    const { content, isInternal } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Note content required",
      });
    }

    const note = await caseManagementService.addCaseNote(
      caseId,
      adminId,
      content,
      isInternal !== false,
    );

    // Log action
    await auditLogService.logAdminAction(
      adminId,
      "add_case_note",
      "CaseFile",
      caseId,
      null,
      { noteLength: content.length },
      "Note added to case",
      req.ip,
      req.get("user-agent"),
    );

    return res.status(201).json({
      success: true,
      data: note,
      message: "Note added",
    });
  } catch (err) {
    console.error("[ADD_NOTE] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to add note",
    });
  }
}

/**
 * Escalate case to NAFDAC
 */
export async function escalateCaseToNAFDACController(req, res) {
  try {
    const adminId = req.admin?.id;
    const { caseId } = req.params;

    const caseFile = await caseManagementService.reportCaseToNAFDAC(caseId);

    // Prepare and send to NAFDAC
    const bundleData = await nafdacService.prepareCaseForNAFDAC(caseId);
    const nafdacResponse = await nafdacService.sendToNAFDACAPI(bundleData);

    // Update with NAFDAC reference
    await caseManagementService.updateNAFDACStatus(caseId, "pending");

    // Log action
    await auditLogService.logAdminAction(
      adminId,
      "escalate_to_nafdac",
      "CaseFile",
      caseId,
      null,
      { nafdacReference: nafdacResponse.nafdacReferenceNumber },
      `Escalated to NAFDAC`,
      req.ip,
      req.get("user-agent"),
    );

    return res.status(200).json({
      success: true,
      data: {
        caseFile,
        nafdacResponse,
      },
      message: "Case escalated to NAFDAC",
    });
  } catch (err) {
    console.error("[ESCALATE_NAFDAC] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to escalate to NAFDAC",
    });
  }
}

/**
 * Get case statistics
 */
export async function getCaseStatsController(req, res) {
  try {
    const stats = await caseManagementService.getCaseStats();

    return res.status(200).json({
      success: true,
      data: stats,
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
 * Search cases
 */
export async function searchCasesController(req, res) {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query required",
      });
    }

    const results = await caseManagementService.searchCases(query);

    return res.status(200).json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (err) {
    console.error("[SEARCH_CASES] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to search cases",
    });
  }
}
