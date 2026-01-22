import prisma from "../models/prismaClient.js";
import {
  createApiKey,
  getManufacturerApiKeys,
  verifyApiKey,
  revokeApiKey,
  updateApiKeyScope,
  updateApiKeyRateLimit,
  deleteApiKey,
  checkRateLimit,
  recordApiKeyUsage,
  hashApiKey,
  getAuditLogs,
} from "../services/apiKeyService.js";

/**
 * POST /manufacturer/api-keys
 * Create new API key
 */
export async function createApiKeyController(req, res) {
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

    const { name, scope, rateLimit = 1000 } = req.body;

    if (!name || !scope) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, scope",
      });
    }

    const apiKey = await createApiKey(manufacturer.id, name, scope, rateLimit);

    // Log audit
    await prisma.analyticsAudit.create({
      data: {
        manufacturerId: manufacturer.id,
        actionType: "api_key_created",
        details: {
          keyId: apiKey.id,
          keyName: name,
          scope,
        },
        ipAddress: req.ip,
      },
    });

    res.status(201).json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    console.error("[CREATE_API_KEY] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /manufacturer/api-keys
 * Get all API keys for manufacturer
 */
export async function getApiKeysController(req, res) {
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

    const apiKeys = await getManufacturerApiKeys(manufacturer.id);

    res.json({
      success: true,
      data: apiKeys,
      total: apiKeys.length,
    });
  } catch (error) {
    console.error("[GET_API_KEYS] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PUT /manufacturer/api-keys/:keyId/scope
 * Update API key scope
 */
export async function updateApiKeyScopeController(req, res) {
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

    const { keyId } = req.params;
    const { scope } = req.body;

    if (!scope) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: scope",
      });
    }

    const updated = await updateApiKeyScope(keyId, manufacturer.id, scope);

    // Log audit
    await prisma.analyticsAudit.create({
      data: {
        manufacturerId: manufacturer.id,
        actionType: "api_key_scope_updated",
        details: {
          keyId,
          newScope: scope,
        },
        ipAddress: req.ip,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[UPDATE_API_KEY_SCOPE] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PUT /manufacturer/api-keys/:keyId/rate-limit
 * Update API key rate limit
 */
export async function updateApiKeyRateLimitController(req, res) {
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

    const { keyId } = req.params;
    const { rateLimit } = req.body;

    if (!rateLimit || rateLimit < 1) {
      return res.status(400).json({
        success: false,
        error: "Invalid rateLimit",
      });
    }

    const updated = await updateApiKeyRateLimit(keyId, manufacturer.id, rateLimit);

    // Log audit
    await prisma.analyticsAudit.create({
      data: {
        manufacturerId: manufacturer.id,
        actionType: "api_key_rate_limit_updated",
        details: {
          keyId,
          newRateLimit: rateLimit,
        },
        ipAddress: req.ip,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[UPDATE_API_KEY_RATE_LIMIT] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * DELETE /manufacturer/api-keys/:keyId
 * Revoke API key
 */
export async function revokeApiKeyController(req, res) {
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

    const { keyId } = req.params;

    const revoked = await revokeApiKey(keyId, manufacturer.id);

    // Log audit
    await prisma.analyticsAudit.create({
      data: {
        manufacturerId: manufacturer.id,
        actionType: "api_key_revoked",
        details: {
          keyId,
        },
        ipAddress: req.ip,
      },
    });

    res.json({
      success: true,
      data: revoked,
    });
  } catch (error) {
    console.error("[REVOKE_API_KEY] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * DELETE /manufacturer/api-keys/:keyId/delete
 * Delete API key
 */
export async function deleteApiKeyController(req, res) {
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

    const { keyId } = req.params;

    await deleteApiKey(keyId, manufacturer.id);

    // Log audit
    await prisma.analyticsAudit.create({
      data: {
        manufacturerId: manufacturer.id,
        actionType: "api_key_deleted",
        details: {
          keyId,
        },
        ipAddress: req.ip,
      },
    });

    res.json({
      success: true,
      message: "API key deleted",
    });
  } catch (error) {
    console.error("[DELETE_API_KEY] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /manufacturer/audit-logs
 * Get audit logs
 */
export async function getAuditLogsController(req, res) {
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

    const { days = 30 } = req.query;

    const logs = await getAuditLogs(manufacturer.id, parseInt(days));

    res.json({
      success: true,
      data: logs,
      total: logs.length,
    });
  } catch (error) {
    console.error("[GET_AUDIT_LOGS] Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
