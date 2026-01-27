import nodemailer from "nodemailer";

/**
 * Email Service
 * Handles sending emails for the application
 */

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
 * Send email with subject and HTML content
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.from - Sender email (optional)
 * @returns {Promise<object>} Send mail result
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = `"Lumora" <${process.env.EMAIL_USER || "noreply@lumora.app"}>`,
}) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("[EMAIL_SERVICE] Email not configured, skipping send");
      return { skipped: true };
    }

    const result = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL_SERVICE] Email sent to ${to}: ${subject}`);
    return result;
  } catch (err) {
    console.error(
      `[EMAIL_SERVICE] Failed to send email to ${to}:`,
      err.message,
    );
    throw err;
  }
}

/**
 * Send email with text fallback
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text fallback
 * @returns {Promise<object>} Send mail result
 */
export async function sendEmailWithText({
  to,
  subject,
  html,
  text,
  from = `"Lumora" <${process.env.EMAIL_USER || "noreply@lumora.app"}>`,
}) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("[EMAIL_SERVICE] Email not configured, skipping send");
      return { skipped: true };
    }

    const result = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });

    console.log(`[EMAIL_SERVICE] Email sent to ${to}: ${subject}`);
    return result;
  } catch (err) {
    console.error(
      `[EMAIL_SERVICE] Failed to send email to ${to}:`,
      err.message,
    );
    throw err;
  }
}

/**
 * Verify email configuration
 * @returns {Promise<boolean>} True if configured and working
 */
export async function verifyEmailConfiguration() {
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
