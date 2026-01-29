import crypto from "crypto";
import prisma from "../models/prismaClient.js";
import nodemailer from "nodemailer";

// Initialize email transporter (same as notificationService)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send webhook notification to regulatory agency
 * Implements retry logic and error handling
 */
export async function sendWebhookNotification(flagData) {
  try {
    const agency = flagData.regulatoryBody?.name;
    if (!agency) {
      console.warn("[WEBHOOK] No agency specified in flag data");
      return false;
    }

    // Get webhook config for this agency
    const webhook = await prisma.regulatoryWebhook.findUnique({
      where: { agency },
    });

    if (!webhook || !webhook.isActive) {
      console.warn(`[WEBHOOK] No active webhook for agency: ${agency}`);
      return false;
    }

    // Create webhook payload
    const payload = {
      event: "code_flagged",
      timestamp: new Date().toISOString(),
      severity: flagData.severity,
      code: flagData.codeValue,
      category: flagData.productCategory,
      manufacturer: flagData.manufacturerName,
      manufacturerId: flagData.manufacturerId,
      reason: flagData.reason,
      additionalInfo: flagData.additionalInfo || {},
    };

    // Generate HMAC signature
    const signature = crypto
      .createHmac("sha256", webhook.secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    // Send webhook with retry logic
    const success = await sendWebhookWithRetry(webhook, payload, signature);

    if (success) {
      // Update webhook metadata
      await prisma.regulatoryWebhook.update({
        where: { id: webhook.id },
        data: {
          lastSuccessfulWebhook: new Date(),
          failureReason: null,
        },
      });
      console.log(`[WEBHOOK] Successfully sent to ${agency}`);
    } else {
      // Log failure
      await prisma.regulatoryWebhook.update({
        where: { id: webhook.id },
        data: {
          lastFailedWebhook: new Date(),
        },
      });
      console.warn(`[WEBHOOK] Failed to send to ${agency}`);
    }

    return success;
  } catch (error) {
    console.error("[WEBHOOK] Error in sendWebhookNotification:", error.message);
    return false;
  }
}

/**
 * Send webhook with exponential backoff retry logic
 */
async function sendWebhookWithRetry(
  webhook,
  payload,
  signature,
  attemptNum = 1,
) {
  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Lumora-Signature": signature,
      "X-Lumora-Timestamp": new Date().toISOString(),
      ...(webhook.headers ? JSON.parse(webhook.headers) : {}),
    };

    const response = await fetch(webhook.webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      timeout: webhook.timeoutSeconds * 1000,
    });

    // Log webhook attempt
    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        eventType: "code_flagged",
        payload,
        statusCode: response.status,
        responseBody: await response.text(),
        attempt: attemptNum,
        success: response.ok,
        errorMessage: response.ok ? null : `HTTP ${response.status}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error(`[WEBHOOK] Attempt ${attemptNum} failed:`, error.message);

    // Log failed attempt
    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        eventType: "code_flagged",
        payload,
        attempt: attemptNum,
        success: false,
        errorMessage: error.message,
        nextRetryAt:
          attemptNum < webhook.retryAttempts
            ? new Date(Date.now() + webhook.retryIntervalSeconds * 1000)
            : null,
      },
    });

    // Retry if attempts remaining
    if (attemptNum < webhook.retryAttempts) {
      const delayMs = webhook.retryIntervalSeconds * 1000 * attemptNum; // Exponential backoff
      console.log(
        `[WEBHOOK] Retrying in ${delayMs / 1000}s (attempt ${attemptNum + 1}/${webhook.retryAttempts})`,
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return sendWebhookWithRetry(webhook, payload, signature, attemptNum + 1);
    }

    return false;
  }
}

/**
 * Register a new regulatory agency webhook
 */
export async function registerWebhook(
  agency,
  webhookUrl,
  customHeaders = null,
) {
  try {
    const secret = crypto.randomBytes(32).toString("hex");

    const webhook = await prisma.regulatoryWebhook.upsert({
      where: { agency },
      update: {
        webhookUrl,
        secret,
        headers: customHeaders ? JSON.stringify(customHeaders) : null,
      },
      create: {
        agency,
        webhookUrl,
        secret,
        headers: customHeaders ? JSON.stringify(customHeaders) : null,
        hourlyResetAt: new Date(),
        dailyResetAt: new Date(),
      },
    });

    console.log(`[WEBHOOK] Registered webhook for ${agency}`);
    return webhook;
  } catch (error) {
    console.error("[WEBHOOK] Error registering webhook:", error.message);
    throw error;
  }
}

/**
 * Test webhook by sending a test payload
 */
export async function testWebhook(agency) {
  try {
    const webhook = await prisma.regulatoryWebhook.findUnique({
      where: { agency },
    });

    if (!webhook) {
      throw new Error(`Webhook not found for agency: ${agency}`);
    }

    const testPayload = {
      event: "webhook_test",
      timestamp: new Date().toISOString(),
      message: "This is a test webhook from Lumora Verification System",
      agency,
    };

    const signature = crypto
      .createHmac("sha256", webhook.secret)
      .update(JSON.stringify(testPayload))
      .digest("hex");

    const response = await fetch(webhook.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Lumora-Signature": signature,
        "X-Lumora-Timestamp": new Date().toISOString(),
        "X-Lumora-Event": "webhook_test",
      },
      body: JSON.stringify(testPayload),
      timeout: 30000,
    });

    const responseBody = await response.text();

    // Log test
    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        eventType: "webhook_test",
        payload: testPayload,
        statusCode: response.status,
        responseBody,
        attempt: 1,
        success: response.ok,
        errorMessage: response.ok ? null : `HTTP ${response.status}`,
      },
    });

    return {
      success: response.ok,
      statusCode: response.status,
      responseBody,
    };
  } catch (error) {
    console.error("[WEBHOOK] Error testing webhook:", error.message);
    throw error;
  }
}

/**
 * Get webhook delivery status
 */
export async function getWebhookStatus(agency) {
  try {
    const webhook = await prisma.regulatoryWebhook.findUnique({
      where: { agency },
      include: {
        webhookLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!webhook) {
      throw new Error(`Webhook not found for agency: ${agency}`);
    }

    return {
      agency,
      isActive: webhook.isActive,
      lastSuccessful: webhook.lastSuccessfulWebhook,
      lastFailed: webhook.lastFailedWebhook,
      failureReason: webhook.failureReason,
      recentLogs: webhook.webhookLogs,
      successRate:
        webhook.webhookLogs.length > 0
          ? (webhook.webhookLogs.filter((l) => l.success).length /
              webhook.webhookLogs.length) *
            100
          : 0,
    };
  } catch (error) {
    console.error("[WEBHOOK] Error getting status:", error.message);
    throw error;
  }
}
