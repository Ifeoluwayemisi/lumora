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

    // Get manufacturer and user info
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      include: { userId: false }, // Will get email from User table
    });

    if (!manufacturer) return;

    // Get user email
    const user = await prisma.user.findFirst({
      where: { id: manufacturer.userId },
    });

    if (!user) return;

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
    await prisma.userNotifications.create({
      data: {
        userId: user.id,
        title: subject,
        message,
        type: "verification",
        status: "unread",
        metadata: {
          codeValue,
          verificationState,
          location,
          timestamp: new Date().toISOString(),
        },
      },
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
          <p><a href="${process.env.FRONTEND_URL || "https://lumora-x91f.vercel.app"}/dashboard/manufacturer">View Dashboard</a></p>
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
        title: subject,
        message,
        type: "payment",
        status: "unread",
        metadata: {
          amount,
          planId,
          status,
          reference,
          timestamp: new Date().toISOString(),
        },
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
          <p><a href="${process.env.FRONTEND_URL || "https://lumora-x91f.vercel.app"}/dashboard/manufacturer/billing">View Billing</a></p>
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
        title: subject,
        message:
          message || `Your account status has been updated to: ${status}`,
        type: "account",
        status: "unread",
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
          <p><a href="${process.env.FRONTEND_URL || "https://lumora-x91f.vercel.app"}/dashboard">Go to Dashboard</a></p>
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
        title: subject,
        message,
        type: "alert",
        status: "unread",
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
          <p><a href="${process.env.FRONTEND_URL || "https://lumora-x91f.vercel.app"}/dashboard/user/settings">Security Settings</a></p>
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
