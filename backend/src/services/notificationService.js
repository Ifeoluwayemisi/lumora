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
