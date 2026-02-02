import prisma from "../models/prismaClient.js";
import crypto from "crypto";

/**
 * Send webhook notification to regulatory agency with retry logic
 */
export async function sendWebhookNotification(flagData) {
  try {
    const {
      agency,
      codeValue,
      reason,
      severity,
      manufacturerName,
      manufacturerId,
      productCategory,
    } = flagData;

    // Check if webhook is configured and active for this agency
    const webhook = await prisma.regulatoryWebhook.findUnique({
      where: { agency },
    });

    if (!webhook || !webhook.isActive) {
      console.log(
        `[WEBHOOK] No active webhook for ${agency}, skipping notification`,
      );
      return { success: false, reason: "No webhook configured" };
    }

    // Prepare payload
    const payload = {
      timestamp: new Date().toISOString(),
      agency,
      alert: {
        codeValue,
        reason,
        severity,
        manufacturerName,
        manufacturerId,
        productCategory,
      },
    };

    // Generate HMAC signature for security
    const signature = generateWebhookSignature(payload, webhook.secret);

    // Send webhook with retry logic
    const result = await sendWebhookWithRetry(
      webhook,
      payload,
      signature,
      1,
      webhook.retryAttempts || 3,
    );

    return result;
  } catch (error) {
    console.error("[WEBHOOK] Error sending notification:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send webhook with exponential backoff retry
 */
async function sendWebhookWithRetry(
  webhook,
  payload,
  signature,
  attemptNum = 1,
  maxAttempts = 3,
) {
  try {
    const timeout = webhook.timeoutSeconds || 30;
    const headers = {
      "Content-Type": "application/json",
      "X-Webhook-Signature": signature,
      "X-Webhook-Attempt": attemptNum.toString(),
      ...(webhook.headers || {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

    const response = await fetch(webhook.webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Log delivery attempt
    await logWebhookDelivery(webhook.id, {
      status: response.ok ? "success" : "failed",
      responseStatus: response.status,
      attemptNumber: attemptNum,
      message: response.ok
        ? "Delivered successfully"
        : `HTTP ${response.status}`,
    });

    if (response.ok) {
      // Update webhook last successful delivery
      await prisma.regulatoryWebhook.update({
        where: { id: webhook.id },
        data: { lastSuccessfulWebhook: new Date() },
      });

      console.log(
        `[WEBHOOK] ✓ Delivered to ${webhook.agency} (attempt ${attemptNum})`,
      );
      return { success: true, attempt: attemptNum };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    console.warn(`[WEBHOOK] Attempt ${attemptNum} failed: ${error.message}`);

    // Update webhook last failed delivery
    await prisma.regulatoryWebhook.update({
      where: { id: webhook.id },
      data: { lastFailedWebhook: new Date() },
    });

    // Log failed attempt
    await logWebhookDelivery(webhook.id, {
      status: "failed",
      responseStatus: 0,
      attemptNumber: attemptNum,
      message: error.message,
    });

    // Retry with exponential backoff
    if (attemptNum < maxAttempts) {
      const delaySeconds =
        Math.pow(2, attemptNum - 1) * (webhook.retryIntervalSeconds || 300);
      console.log(`[WEBHOOK] Retrying in ${delaySeconds}s...`);

      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
      return sendWebhookWithRetry(
        webhook,
        payload,
        signature,
        attemptNum + 1,
        maxAttempts,
      );
    }

    return { success: false, attempt: attemptNum, error: error.message };
  }
}

/**
 * Generate HMAC-SHA256 signature for webhook
 */
function generateWebhookSignature(payload, secret) {
  const payloadString = JSON.stringify(payload);
  return crypto
    .createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex");
}

/**
 * Log webhook delivery attempt
 */
async function logWebhookDelivery(webhookId, deliveryInfo) {
  try {
    await prisma.webhookLog.create({
      data: {
        webhookId,
        status: deliveryInfo.status,
        responseStatus: deliveryInfo.responseStatus,
        attemptNumber: deliveryInfo.attemptNumber,
        message: deliveryInfo.message,
        deliveredAt: deliveryInfo.status === "success" ? new Date() : null,
      },
    });
  } catch (error) {
    console.error("[WEBHOOK] Failed to log delivery:", error.message);
  }
}

/**
 * Calculate webhook success rate
 */
export async function updateWebhookSuccessRate(webhookId) {
  try {
    const logs = await prisma.webhookLog.findMany({
      where: { webhookId },
      select: { status: true },
      take: 100, // Last 100 attempts
    });

    if (logs.length === 0) return;

    const successCount = logs.filter((log) => log.status === "success").length;
    const successRate = (successCount / logs.length) * 100;

    await prisma.regulatoryWebhook.update({
      where: { id: webhookId },
      data: { successRate: Math.round(successRate) },
    });
  } catch (error) {
    console.error("[WEBHOOK] Error updating success rate:", error.message);
  }
}
