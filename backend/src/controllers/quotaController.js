import { getQuotaInfo, canCreateCode } from "../services/quotaService.js";

/**
 * Get quota info for manufacturer
 */
export async function getQuotaStatus(req, res) {
  try {
    const manufacturerId = req.user?.id;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const quotaInfo = await getQuotaInfo(manufacturerId);

    res.json({
      success: true,
      data: quotaInfo,
    });
  } catch (error) {
    console.error("[GET_QUOTA] Error:", error.message);
    res.status(500).json({
      error: "Failed to get quota information",
    });
  }
}

/**
 * Check if manufacturer can create code
 */
export async function checkCanCreateCode(req, res) {
  try {
    const manufacturerId = req.user?.id;

    if (!manufacturerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await canCreateCode(manufacturerId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[CHECK_QUOTA] Error:", error.message);
    res.status(500).json({
      error: "Failed to check quota",
    });
  }
}
