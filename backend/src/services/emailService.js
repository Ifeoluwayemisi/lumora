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

/**
 * Send report received confirmation email
 */
export async function sendReportReceivedEmail(
  reporterEmail,
  reporterName,
  codeValue,
  caseNumber,
) {
  if (!reporterEmail) return false;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #27ae60;">Thank You for Your Report</h2>
      <p>Dear ${reporterName || "Valued Reporter"},</p>
      
      <p>We have successfully received your report regarding the product with code:</p>
      <p style="background: #f0f0f0; padding: 10px; border-left: 4px solid #27ae60; font-family: monospace;">
        ${codeValue}
      </p>
      
      <p><strong>Case Reference Number:</strong> ${caseNumber}</p>
      
      <p>Our team will review your report and take appropriate action within 48 hours. 
      We may reach out if we need additional information.</p>
      
      <h3>What happens next?</h3>
      <ul>
        <li>Our team verifies the product information</li>
        <li>We investigate the manufacturer and distributor</li>
        <li>If counterfeit is confirmed, we escalate to authorities</li>
        <li>You will be notified of the outcome</li>
      </ul>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        If you have any questions, reply to this email or contact our support team.
      </p>
    </div>
  `;

  const text = `Thank you for your report on product code ${codeValue}. Case Reference: ${caseNumber}. We will review and take action within 48 hours.`;

  return sendEmailWithText({
    to: reporterEmail,
    subject: "Your Report Has Been Received - Lumora",
    html,
    text,
  })
    .then(() => true)
    .catch(() => false);
}

/**
 * Send health alert escalation email
 */
export async function sendHealthAlertEmail(
  reporterEmail,
  reporterName,
  codeValue,
  healthSymptoms,
) {
  if (!reporterEmail) return false;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #fff3cd; border-left: 4px solid #e74c3c; padding: 15px; margin-bottom: 20px;">
        <h2 style="color: #e74c3c; margin-top: 0;">⚠️ URGENT HEALTH CONCERN</h2>
      </div>
      
      <p>Dear ${reporterName || "Reporter"},</p>
      
      <p>Thank you for reporting health concerns related to product code <strong>${codeValue}</strong>.</p>
      
      <p><strong>IMPORTANT SAFETY INFORMATION:</strong></p>
      <ul style="color: #e74c3c;">
        <li>If experiencing severe symptoms, seek medical attention immediately</li>
        <li>Do not use this product</li>
        <li>Keep the packaging for medical records</li>
        <li>Report to nearest hospital/health facility</li>
      </ul>
      
      <p>Your report has been <strong>escalated to NAFDAC</strong> (National Agency for Food and Drug Administration and Control) as a health emergency.</p>
      
      <p>Health authorities will contact you for follow-up.</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Your safety is our priority. Thank you for protecting other consumers.
      </p>
    </div>
  `;

  const text = `URGENT: Health concern reported for product ${codeValue}. Symptoms: ${healthSymptoms}. Escalated to NAFDAC.`;

  return sendEmailWithText({
    to: reporterEmail,
    subject: `URGENT: Health Concern - Product ${codeValue}`,
    html,
    text,
  })
    .then(() => true)
    .catch(() => false);
}

/**
 * Notify authorities of health alert
 */
export async function notifyAuthoritiesHealthAlert(reportData) {
  const nafdacEmail =
    process.env.NAFDAC_REPORT_EMAIL || "reports@nafdac.gov.ng";

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #e74c3c;">URGENT HEALTH ALERT FROM LUMORA</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Product Code:</strong></td><td>${reportData.codeValue}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reporter:</strong></td><td>${reportData.reporterName || "Anonymous"}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Health Impact:</strong></td><td>${reportData.healthImpact}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Symptoms:</strong></td><td>${reportData.healthSymptoms}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Report ID:</strong></td><td>${reportData.reportId}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Location:</strong></td><td>${reportData.location}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Submitted:</strong></td><td>${new Date(reportData.reportedAt).toLocaleString()}</td></tr>
      </table>
    </div>
  `;

  return sendEmailWithText({
    to: nafdacEmail,
    subject: `[URGENT] Health Alert - Product Code ${reportData.codeValue}`,
    html,
    text: `Health alert for product ${reportData.codeValue}. Symptoms: ${reportData.healthSymptoms}`,
  })
    .then(() => true)
    .catch(() => false);
}
