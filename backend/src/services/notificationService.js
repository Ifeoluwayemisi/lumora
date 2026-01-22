import nodemailer from "nodemailer";
import prisma from "../models/prismaClient.js";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://lumora-gold.vercel.app";
const APP_NAME = "Lumora";

/**
 * Email Templates - HTML templates for various notification types
 */
const emailTemplates = {
  /**
   * Account Approval Email
   */
  accountApproval: (manufacturerName, trustScore, riskLevel) => ({
    subject: "✅ Your Lumora Account Has Been Approved!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Account Approved!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151; margin-top: 0;">
            Hi ${manufacturerName},
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Great news! Your ${APP_NAME} manufacturer account has been verified and approved by our NAFDAC team. You can now start generating verification codes and protecting your products.
          </p>
          
          <div style="background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #1f2937;">Your Account Status:</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Trust Score:</strong> ${trustScore}/100</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Risk Level:</strong> ${riskLevel}</p>
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            You can now:
          </p>
          <ul style="font-size: 16px; color: #374151; line-height: 1.8;">
            <li>✅ Create products and batches</li>
            <li>✅ Generate verification codes</li>
            <li>✅ View detailed analytics</li>
            <li>✅ Manage your team (Premium feature)</li>
            <li>✅ Export verification data</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/dashboard/manufacturer" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">© 2026 ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  /**
   * Account Rejection Email
   */
  accountRejection: (manufacturerName, reason) => ({
    subject: "❌ Lumora Account - Verification Not Approved",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">⚠️ Verification Status Update</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151; margin-top: 0;">
            Hi ${manufacturerName},
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Thank you for submitting your verification documents to ${APP_NAME}. After careful review by our NAFDAC team, we were unable to approve your account at this time.
          </p>
          
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #7f1d1d;">Rejection Reason:</p>
            <p style="margin: 0; color: #374151;">${reason}</p>
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            <strong>What can you do?</strong>
          </p>
          <ul style="font-size: 16px; color: #374151; line-height: 1.8;">
            <li>📤 Re-submit corrected documents</li>
            <li>💬 Contact our support team for clarification</li>
            <li>📋 Review our document requirements</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/dashboard/manufacturer/profile" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Re-submit Documents
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            Our team is here to help. Reply to this email or contact support@lumora.app for assistance.
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">© 2026 ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  /**
   * Quota Warning Email
   */
  quotaWarning: (manufacturerName, remaining, limit, percentageRemaining) => ({
    subject: `⚠️ Daily Code Quota Running Low (${percentageRemaining}% remaining)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">⚠️ Quota Alert</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151; margin-top: 0;">
            Hi ${manufacturerName},
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Your daily code generation quota is running low today.
          </p>
          
          <div style="background: white; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400e;">Quota Status:</p>
            <div style="margin: 10px 0;">
              <div style="background: #e5e7eb; border-radius: 4px; height: 20px; overflow: hidden;">
                <div style="background: #f59e0b; height: 100%; width: ${100 - percentageRemaining}%; transition: width 0.3s;"></div>
              </div>
            </div>
            <p style="margin: 5px 0; color: #374151;"><strong>${remaining} / ${limit}</strong> codes remaining (${percentageRemaining}%)</p>
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            ${percentageRemaining <= 10 ? "🔴 <strong>CRITICAL:</strong> You only have a few codes left today. Your quota will reset at midnight." : "Once you reach your daily limit, you won't be able to generate more codes until tomorrow (midnight UTC)."}
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            <strong>Want unlimited codes?</strong> Upgrade to our Premium plan for unlimited daily code generation.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/dashboard/manufacturer/billing" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Upgrade to Premium
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            <strong>Current Plan:</strong> Basic (${limit} codes/day)<br/>
            <strong>Premium Plan:</strong> Unlimited codes/day + advanced features
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">© 2026 ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  /**
   * Suspicious Activity Alert Email
   */
  suspiciousActivityAlert: (
    manufacturerName,
    codeValue,
    alertType,
    details,
    location,
  ) => ({
    subject: `🚨 Security Alert: Suspicious Activity Detected`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🚨 Security Alert</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151; margin-top: 0;">
            Hi ${manufacturerName},
          </p>
          
          <p style="font-size: 16px; color: #ef4444; font-weight: bold; line-height: 1.6;">
            We detected suspicious activity on your account. Please review immediately.
          </p>
          
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #7f1d1d;">Alert Type:</p>
            <p style="margin: 5px 0; color: #374151;"><strong>${alertType}</strong></p>
            <p style="margin: 5px 0; color: #374151;"><strong>Code:</strong> ${codeValue.substring(0, 8)}...</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Details:</strong> ${details}</p>
            ${location ? `<p style="margin: 5px 0; color: #374151;"><strong>Location:</strong> ${location}</p>` : ""}
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            <strong>What this means:</strong>
          </p>
          <ul style="font-size: 16px; color: #374151; line-height: 1.8;">
            <li>🔍 Unusual verification pattern detected</li>
            <li>⚠️ Possible counterfeit product detected</li>
            <li>📍 Multiple locations in short timeframe</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/dashboard/manufacturer/codes" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Review Code Activity
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            Our security team is monitoring this. You can flag this code as counterfeit or suspicious in your dashboard.
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">© 2026 ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  /**
   * Document Upload Confirmation Email
   */
  documentUploadConfirmation: (manufacturerName, documentType) => ({
    subject: `📄 Document Received: ${documentType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">📄 Document Received</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151; margin-top: 0;">
            Hi ${manufacturerName},
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Your ${documentType} document has been received and is now under review by our NAFDAC team.
          </p>
          
          <div style="background: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e40af;">Status:</p>
            <p style="margin: 5px 0; color: #374151;"><strong>📋 Pending Review</strong></p>
            <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">Usually reviewed within 1-3 business days</p>
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            You'll receive an email once the review is complete. In the meantime, you can upload additional documents to expedite the process.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/dashboard/manufacturer/profile" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
              View Document Status
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            Questions? Check our <a href="${FRONTEND_URL}/dashboard/manufacturer/help" style="color: #3b82f6;">Help Center</a> or contact support.
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">© 2026 ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Send code verification notification
 * Notifies manufacturer when their code is verified
 */
export async function sendVerificationNotification(verificationData) {
  try {
    const {
      manufacturerId,
      codeValue,
      verificationState,
      userEmail,
      location,
    } = verificationData;

    console.log(
      "[NOTIFICATION_DEBUG] Starting verification notification for:",
      {
        manufacturerId,
        codeValue: codeValue?.substring(0, 8),
        verificationState,
      },
    );

    // Get manufacturer and user info
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      include: { userId: false }, // Will get email from User table
    });

    if (!manufacturer) {
      console.warn(
        "[NOTIFICATION_DEBUG] Manufacturer not found:",
        manufacturerId,
      );
      return;
    }

    console.log("[NOTIFICATION_DEBUG] Found manufacturer:", {
      id: manufacturer.id,
      userId: manufacturer.userId,
    });

    // Get user email
    const user = await prisma.user.findFirst({
      where: { id: manufacturer.userId },
    });

    if (!user) {
      console.warn(
        "[NOTIFICATION_DEBUG] User not found for userId:",
        manufacturer.userId,
      );
      return;
    }

    console.log("[NOTIFICATION_DEBUG] Found user:", {
      id: user.id,
      email: user.email,
    });

    // Determine notification type
    let subject = "";
    let message = "";
    let severity = "info";

    if (verificationState === "GENUINE") {
      subject = "✓ Code Verified - Authentic Product";
      message = `Your product code <strong>${codeValue?.substring(
        0,
        8,
      )}...</strong> was successfully verified as genuine.`;
      severity = "success";
    } else if (verificationState === "SUSPICIOUS_PATTERN") {
      subject = "⚠️ Suspicious Activity Detected";
      message = `Unusual verification pattern detected for code <strong>${codeValue?.substring(
        0,
        8,
      )}...</strong>. Multiple rapid verifications from the same location.`;
      severity = "warning";
    } else if (verificationState === "CODE_ALREADY_USED") {
      subject = "⚠️ Code Reuse Attempt";
      message = `Code <strong>${codeValue?.substring(
        0,
        8,
      )}...</strong> was already verified. This may indicate counterfeit activity.`;
      severity = "warning";
    } else if (verificationState === "UNREGISTERED_PRODUCT") {
      subject = "❌ Unregistered Product Code";
      message = `Code <strong>${codeValue?.substring(
        0,
        8,
      )}...</strong> is not registered in your inventory.`;
      severity = "error";
    }

    // Store in database
    const notification = await prisma.userNotifications.create({
      data: {
        userId: user.id,
        type: "VERIFICATION",
        message: `${subject} - ${message}`,
        read: false,
      },
    });

    console.log("[NOTIFICATION_DEBUG] Notification created in DB:", {
      id: notification.id,
      userId: user.id,
      type: "VERIFICATION",
      messageLength: notification.message.length,
    });

    // Send email if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"Lumora Alerts" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html: `
          <h2>${subject}</h2>
          <p>${message}</p>
          <p>Product Code: <code>${codeValue}</code></p>
          ${location ? `<p>Location: ${location.latitude}, ${location.longitude}</p>` : ""}
          <p>Time: ${new Date().toLocaleString()}</p>
          <hr/>
          <p><a href="${process.env.FRONTEND_URL || "https://lumora-gold.vercel.app"}/dashboard/manufacturer">View Dashboard</a></p>
        `,
      });
    }

    console.log(`[NOTIFICATION] Sent ${severity} alert to ${user.email}`);
  } catch (error) {
    console.error(
      "[NOTIFICATION] Error sending verification notification:",
      error.message,
    );
  }
}

/**
 * Send payment confirmation notification
 */
export async function sendPaymentNotification(paymentData) {
  try {
    const { manufacturerId, amount, planId, status, reference } = paymentData;

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
    });

    if (!manufacturer) return;

    const user = await prisma.user.findFirst({
      where: { id: manufacturer.userId },
    });

    if (!user) return;

    const isPaid = status === "success";
    const subject = isPaid
      ? "✓ Payment Successful - Plan Upgraded"
      : "❌ Payment Failed";
    const message = isPaid
      ? `Your payment of ₦${(amount / 100).toLocaleString()} for ${planId} plan has been processed successfully.`
      : `Your payment of ₦${(amount / 100).toLocaleString()} could not be processed. Please try again.`;

    // Store notification
    await prisma.userNotifications.create({
      data: {
        userId: user.id,
        type: "PAYMENT",
        message: `${subject} - ₦${(amount / 100).toLocaleString()} for ${planId}`,
        read: false,
      },
    });

    // Send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"Lumora Billing" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html: `
          <h2>${subject}</h2>
          <p>${message}</p>
          <p><strong>Amount:</strong> ₦${(amount / 100).toLocaleString()}</p>
          <p><strong>Plan:</strong> ${planId}</p>
          <p><strong>Reference:</strong> ${reference}</p>
          <p><strong>Status:</strong> ${status.toUpperCase()}</p>
          <hr/>
          <p><a href="${process.env.FRONTEND_URL || "https://lumora-gold.vercel.app"}/dashboard/manufacturer/billing">View Billing</a></p>
        `,
      });
    }

    console.log(
      `[PAYMENT_NOTIFICATION] Sent ${status} notification to ${user.email}`,
    );
  } catch (error) {
    console.error(
      "[PAYMENT_NOTIFICATION] Error sending payment notification:",
      error.message,
    );
  }
}

/**
 * Send account verification status notification
 */
export async function sendAccountStatusNotification(userId, status, message) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    const subject =
      status === "verified"
        ? "✓ Account Verified"
        : status === "rejected"
          ? "❌ Account Rejected"
          : "⏳ Account Under Review";

    await prisma.userNotifications.create({
      data: {
        userId,
        type: "ACCOUNT",
        message:
          message || `Your account status has been updated to: ${status}`,
        read: false,
      },
    });

    // Send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"Lumora Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html: `
          <h2>${subject}</h2>
          <p>${message || `Your account status has been updated to: ${status}`}</p>
          <hr/>
          <p><a href="${process.env.FRONTEND_URL || "https://lumora-gold.vercel.app"}/dashboard">Go to Dashboard</a></p>
        `,
      });
    }

    console.log(`[ACCOUNT_NOTIFICATION] Sent status update to ${user.email}`);
  } catch (error) {
    console.error("[ACCOUNT_NOTIFICATION] Error:", error.message);
  }
}

/**
 * Send suspicious activity alert
 */
export async function sendSuspiciousActivityAlert(manufacturerId, details) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
    });

    if (!manufacturer) return;

    const user = await prisma.user.findFirst({
      where: { id: manufacturer.userId },
    });

    if (!user) return;

    const subject = "🚨 Suspicious Activity Alert";
    const message = `Unusual activity detected on your account: ${details}`;

    await prisma.userNotifications.create({
      data: {
        userId: user.id,
        type: "ALERT",
        message,
        read: false,
      },
    });

    // Send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"Lumora Security" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html: `
          <h2>${subject}</h2>
          <p>We detected unusual activity on your account:</p>
          <p><strong>${details}</strong></p>
          <p>If this wasn't you, please secure your account immediately.</p>
          <hr/>
          <p><a href="${process.env.FRONTEND_URL || "https://lumora-gold.vercel.app"}/dashboard/user/settings">Security Settings</a></p>
        `,
      });
    }

    console.log(`[SECURITY_ALERT] Sent alert to ${user.email}`);
  } catch (error) {
    console.error("[SECURITY_ALERT] Error:", error.message);
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration() {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️  Email service not configured");
      return false;
    }

    await transporter.verify();
    console.log("✓ Email service configured and working");
    return true;
  } catch (error) {
    console.error("❌ Email service configuration error:", error.message);
    return false;
  }
}

/**
 * Create in-app notification for a user
 * @param {string} userId - User ID
 * @param {string} type - Notification type (VERIFICATION, ALERT, QUOTA_WARNING, SUSPICIOUS_ACTIVITY, etc.)
 * @param {string} message - Notification message
 */
export async function createNotification(userId, type, message) {
  try {
    const notification = await prisma.userNotifications.create({
      data: {
        userId,
        type,
        message,
        read: false,
      },
    });

    console.log(
      `[NOTIFICATION_IN_APP] Created ${type} notification for user ${userId}`,
    );
    return notification;
  } catch (error) {
    console.error(
      "[NOTIFICATION_IN_APP] Error creating notification:",
      error.message,
    );
    return null;
  }
}

/**
 * Create suspicious activity alert
 * @param {string} manufacturerId - Manufacturer ID
 * @param {string} details - Alert details
 * @param {string} alertType - Type of suspicious activity
 */
export async function createSuspiciousActivityAlert(
  manufacturerId,
  details,
  alertType = "SUSPICIOUS_ACTIVITY",
) {
  try {
    // Get manufacturer's user
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true, email: true, name: true },
    });

    if (!manufacturer) {
      console.warn(
        "[SUSPICIOUS_ALERT] Manufacturer not found:",
        manufacturerId,
      );
      return null;
    }

    // Create in-app notification
    const notification = await createNotification(
      manufacturer.userId,
      alertType,
      details,
    );

    return notification;
  } catch (error) {
    console.error("[SUSPICIOUS_ALERT] Error:", error.message);
    return null;
  }
}

/**
 * Create quota warning notification
 * @param {string} manufacturerId - Manufacturer ID
 * @param {number} remaining - Remaining codes
 * @param {number} limit - Daily limit
 */
export async function createQuotaWarning(manufacturerId, remaining, limit) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true, name: true },
    });

    if (!manufacturer) {
      console.warn("[QUOTA_WARNING] Manufacturer not found:", manufacturerId);
      return null;
    }

    const percentageRemaining = ((remaining / limit) * 100).toFixed(0);
    let message = `Your daily code quota is running low: ${remaining}/${limit} remaining`;
    let alertType = "QUOTA_WARNING";

    // Critical warning if less than 10% remaining
    if (remaining <= Math.ceil(limit * 0.1)) {
      message = `⚠️ CRITICAL: Only ${remaining} codes remaining today (${percentageRemaining}%)`;
      alertType = "QUOTA_CRITICAL";
    } else if (remaining <= Math.ceil(limit * 0.25)) {
      // Warning if less than 25% remaining
      message = `⚠️ Warning: ${remaining} codes remaining (${percentageRemaining}% of daily limit)`;
    }

    const notification = await createNotification(
      manufacturer.userId,
      alertType,
      message,
    );

    return notification;
  } catch (error) {
    console.error("[QUOTA_WARNING] Error:", error.message);
    return null;
  }
}

/**
 * Send account approval email to manufacturer
 */
export async function sendAccountApprovalEmail(manufacturerId) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      include: { userId: false },
    });

    if (!manufacturer || !manufacturer.email) {
      console.warn("[EMAIL] Manufacturer email not found:", manufacturerId);
      return false;
    }

    const { subject, html } = emailTemplates.accountApproval(
      manufacturer.name,
      manufacturer.trustScore || 75,
      manufacturer.riskLevel || "MEDIUM",
    );

    await transporter.sendMail({
      from: `"${APP_NAME} Team" <${process.env.EMAIL_USER}>`,
      to: manufacturer.email,
      subject,
      html,
    });

    console.log(`[EMAIL] Account approval email sent to ${manufacturer.email}`);
    return true;
  } catch (error) {
    console.error("[EMAIL] Account approval email error:", error.message);
    return false;
  }
}

/**
 * Send account rejection email to manufacturer
 */
export async function sendAccountRejectionEmail(manufacturerId, reason) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      include: { userId: false },
    });

    if (!manufacturer || !manufacturer.email) {
      console.warn("[EMAIL] Manufacturer email not found:", manufacturerId);
      return false;
    }

    const { subject, html } = emailTemplates.accountRejection(
      manufacturer.name,
      reason || "Your documents did not meet our verification requirements.",
    );

    await transporter.sendMail({
      from: `"${APP_NAME} Team" <${process.env.EMAIL_USER}>`,
      to: manufacturer.email,
      subject,
      html,
    });

    console.log(
      `[EMAIL] Account rejection email sent to ${manufacturer.email}`,
    );
    return true;
  } catch (error) {
    console.error("[EMAIL] Account rejection email error:", error.message);
    return false;
  }
}

/**
 * Send quota warning email to manufacturer
 */
export async function sendQuotaWarningEmail(manufacturerId, remaining, limit) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      include: { userId: false },
    });

    if (!manufacturer || !manufacturer.email) {
      console.warn("[EMAIL] Manufacturer email not found:", manufacturerId);
      return false;
    }

    const percentageRemaining = ((remaining / limit) * 100).toFixed(0);
    const { subject, html } = emailTemplates.quotaWarning(
      manufacturer.name,
      remaining,
      limit,
      percentageRemaining,
    );

    await transporter.sendMail({
      from: `"${APP_NAME} Team" <${process.env.EMAIL_USER}>`,
      to: manufacturer.email,
      subject,
      html,
    });

    console.log(`[EMAIL] Quota warning email sent to ${manufacturer.email}`);
    return true;
  } catch (error) {
    console.error("[EMAIL] Quota warning email error:", error.message);
    return false;
  }
}

/**
 * Send suspicious activity alert email to manufacturer
 */
export async function sendSuspiciousActivityEmail(
  manufacturerId,
  codeValue,
  alertType,
  details,
  location,
) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      include: { userId: false },
    });

    if (!manufacturer || !manufacturer.email) {
      console.warn("[EMAIL] Manufacturer email not found:", manufacturerId);
      return false;
    }

    const { subject, html } = emailTemplates.suspiciousActivityAlert(
      manufacturer.name,
      codeValue,
      alertType,
      details,
      location,
    );

    await transporter.sendMail({
      from: `"${APP_NAME} Team" <${process.env.EMAIL_USER}>`,
      to: manufacturer.email,
      subject,
      html,
    });

    console.log(
      `[EMAIL] Suspicious activity email sent to ${manufacturer.email}`,
    );
    return true;
  } catch (error) {
    console.error("[EMAIL] Suspicious activity email error:", error.message);
    return false;
  }
}

/**
 * Send document upload confirmation email
 */
export async function sendDocumentUploadEmail(manufacturerId, documentType) {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      include: { userId: false },
    });

    if (!manufacturer || !manufacturer.email) {
      console.warn("[EMAIL] Manufacturer email not found:", manufacturerId);
      return false;
    }

    const { subject, html } = emailTemplates.documentUploadConfirmation(
      manufacturer.name,
      documentType,
    );

    await transporter.sendMail({
      from: `"${APP_NAME} Team" <${process.env.EMAIL_USER}>`,
      to: manufacturer.email,
      subject,
      html,
    });

    console.log(
      `[EMAIL] Document upload confirmation sent to ${manufacturer.email}`,
    );
    return true;
  } catch (error) {
    console.error("[EMAIL] Document upload email error:", error.message);
    return false;
  }
}
