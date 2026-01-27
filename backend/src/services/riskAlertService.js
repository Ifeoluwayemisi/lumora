import prisma from "../models/prismaClient.js";
import { sendEmail } from "./emailService.js";

/**
 * Risk Alert Service
 * Monitors product risk scores and sends alerts when thresholds are exceeded
 */

const RISK_ALERT_THRESHOLDS = {
  CRITICAL: 70, // Send alert when risk >= 70%
  HIGH: 50, // Send alert when risk >= 50%
};

const ALERT_COOLDOWN_HOURS = 24; // Don't send same alert more than once per day

/**
 * Check product risk and send alert if needed
 */
export async function checkAndSendProductRiskAlert(
  manufacturerId,
  productId,
  riskScore,
  riskLevel,
) {
  try {
    console.log(
      `[RISK_ALERT] Checking risk for product ${productId}, risk: ${riskScore}`,
    );

    // Only alert for HIGH or CRITICAL risk
    if (
      riskScore < RISK_ALERT_THRESHOLDS.HIGH ||
      riskLevel === "LOW" ||
      riskLevel === "MEDIUM"
    ) {
      console.log(
        `[RISK_ALERT] Risk ${riskScore} below threshold, skipping alert`,
      );
      return null;
    }

    // Check if we already sent an alert recently
    const recentAlert = await prisma.riskAlert.findFirst({
      where: {
        manufacturerId,
        productId,
        createdAt: {
          gte: new Date(Date.now() - ALERT_COOLDOWN_HOURS * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentAlert) {
      console.log(
        `[RISK_ALERT] Recent alert already sent for this product, cooldown active`,
      );
      return recentAlert;
    }

    // Get manufacturer and product details
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { email: true, name: true },
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, category: true },
    });

    if (!manufacturer || !product) {
      console.warn(`[RISK_ALERT] Manufacturer or product not found for alert`);
      return null;
    }

    // Create alert record
    const alert = await prisma.riskAlert.create({
      data: {
        manufacturerId,
        productId,
        riskScore,
        riskLevel,
        status: "pending",
      },
    });

    console.log(`[RISK_ALERT] Created alert ${alert.id}`);

    // Send email notification
    await sendProductRiskAlertEmail(
      manufacturer.email,
      manufacturer.name,
      product.name,
      product.category,
      riskScore,
      riskLevel,
    );

    // Mark alert as sent
    await prisma.riskAlert.update({
      where: { id: alert.id },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    console.log(`[RISK_ALERT] Alert email sent successfully`);

    return alert;
  } catch (err) {
    console.error(`[RISK_ALERT] Error:`, {
      message: err?.message,
      productId,
      manufacturerId,
    });

    // Create failed alert record for tracking
    try {
      await prisma.riskAlert.create({
        data: {
          manufacturerId,
          productId,
          riskScore,
          riskLevel,
          status: "failed",
          failureReason: err?.message,
        },
      });
    } catch (dbErr) {
      console.error(`[RISK_ALERT] Failed to record alert failure:`, dbErr);
    }

    return null;
  }
}

/**
 * Send product risk alert email
 */
async function sendProductRiskAlertEmail(
  email,
  manufacturerName,
  productName,
  category,
  riskScore,
  riskLevel,
) {
  const isCritical = riskScore >= RISK_ALERT_THRESHOLDS.CRITICAL;

  const subject = isCritical
    ? `🚨 CRITICAL RISK ALERT: ${productName}`
    : `⚠️ HIGH RISK ALERT: ${productName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${isCritical ? "#dc2626" : "#ea580c"}; color: white; padding: 20px; border-radius: 8px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">
          ${isCritical ? "🚨 CRITICAL RISK DETECTED" : "⚠️ HIGH RISK DETECTED"}
        </h1>
      </div>

      <div style="padding: 30px; background-color: #f9fafb;">
        <p>Hello ${manufacturerName},</p>

        <p>Your product <strong>${productName}</strong> has reached a <strong>${riskLevel}</strong> risk level:</p>

        <div style="background-color: white; border-left: 4px solid ${isCritical ? "#dc2626" : "#ea580c"}; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 10px 0;">
            <strong>Product:</strong> ${productName}<br/>
            <strong>Category:</strong> ${category}<br/>
            <strong>Risk Score:</strong> <span style="font-size: 24px; color: ${isCritical ? "#dc2626" : "#ea580c"}; font-weight: bold;">${riskScore}%</span><br/>
            <strong>Risk Level:</strong> ${riskLevel}
          </p>
        </div>

        <h2 style="color: #1f2937; font-size: 18px;">What This Means:</h2>
        ${
          isCritical
            ? `
          <p style="color: #dc2626; font-weight: bold;">
            ⚠️ This product has a critical risk of counterfeiting. Immediate action is recommended:
          </p>
          <ul style="color: #374151;">
            <li>Review recent verification patterns</li>
            <li>Check for suspicious batches</li>
            <li>Consider issuing a batch recall</li>
            <li>Contact affected distributors</li>
          </ul>
        `
            : `
          <p style="color: #ea580c; font-weight: bold;">
            This product is showing signs of counterfeiting risk. Please investigate:
          </p>
          <ul style="color: #374151;">
            <li>Monitor verification patterns</li>
            <li>Review recent batches</li>
            <li>Check geographic distribution of suspicious verifications</li>
          </ul>
        `
        }

        <div style="margin-top: 30px; padding: 15px; background-color: white; border-radius: 4px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 10px 0;"><strong>Next Steps:</strong></p>
          <ol style="margin: 0; padding-left: 20px; color: #374151;">
            <li>Log into your dashboard</li>
            <li>Go to Analytics → Risk Assessment</li>
            <li>Review this product's verification history</li>
            <li>Take appropriate action (recall, alert distributors, etc.)</li>
          </ol>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #e0f2fe; border-radius: 4px; border-left: 4px solid #0284c7;">
          <p style="margin: 0; color: #0c4a6e; font-size: 12px;">
            <strong>Note:</strong> You will not receive another alert for this product within 24 hours. Continue monitoring your dashboard for updates.
          </p>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;">
          This is an automated alert from Lumora's product verification system.<br/>
          © 2026 Lumora. All rights reserved.
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject,
      html,
    });

    console.log(`[RISK_ALERT_EMAIL] Sent to ${email}`);
  } catch (err) {
    console.error(`[RISK_ALERT_EMAIL] Failed to send:`, err?.message);
    throw err;
  }
}

/**
 * Get recent alerts for manufacturer
 */
export async function getManufacturerRiskAlerts(manufacturerId, limit = 20) {
  try {
    const alerts = await prisma.riskAlert.findMany({
      where: { manufacturerId },
      select: {
        id: true,
        productId: true,
        riskScore: true,
        riskLevel: true,
        status: true,
        createdAt: true,
        sentAt: true,
        product: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return alerts;
  } catch (err) {
    console.error(`[GET_RISK_ALERTS] Error:`, err?.message);
    throw err;
  }
}
