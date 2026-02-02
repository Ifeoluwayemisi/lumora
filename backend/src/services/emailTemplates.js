/**
 * Email templates for report follow-ups and notifications
 */

export const emailTemplates = {
  /**
   * Template: Report Received Confirmation
   */
  reportReceived: (reporterName, codeValue, caseNumber) => ({
    subject: "Your Report Has Been Received - Lumora",
    html: `
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
    `,
    text: `Thank you for your report on product code ${codeValue}. Case Reference: ${caseNumber}. We will review and take action within 48 hours.`,
  }),

  /**
   * Template: More Information Requested
   */
  moreInfoRequested: (reporterName, codeValue, additionalInfo) => ({
    subject: "We Need More Information - Lumora Report ${codeValue}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Additional Information Needed</h2>
        <p>Dear ${reporterName || "Reporter"},</p>
        
        <p>Thank you for reporting product code <strong>${codeValue}</strong>.</p>
        
        <p>To help us investigate further, we need the following information:</p>
        
        <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0;">
          ${additionalInfo.map((item) => `<p>• ${item}</p>`).join("")}
        </div>
        
        <p>Please reply to this email with the requested details. Your cooperation helps us protect consumers.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Thank you for helping us fight counterfeit products.
        </p>
      </div>
    `,
    text: `We need additional information about your report on ${codeValue}: ${additionalInfo.join(", ")}`,
  }),

  /**
   * Template: Investigation Completed
   */
  investigationComplete: (reporterName, codeValue, result) => ({
    subject: "Investigation Result - Lumora Report ${codeValue}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${result.status === "confirmed" ? "#e74c3c" : "#27ae60"};">
          Investigation Complete
        </h2>
        <p>Dear ${reporterName || "Reporter"},</p>
        
        <p>Thank you for reporting product code <strong>${codeValue}</strong>.</p>
        
        <p><strong>Investigation Result:</strong></p>
        <div style="background: #f0f0f0; padding: 15px; border-left: 4px solid ${result.status === "confirmed" ? "#e74c3c" : "#27ae60"};">
          <p><strong>${result.status === "confirmed" ? "COUNTERFEIT CONFIRMED" : "GENUINE PRODUCT"}</strong></p>
          <p>${result.details}</p>
        </div>
        
        ${result.status === "confirmed" ? `
          <p>
            <strong>Actions Taken:</strong>
            <ul>
              <li>Product marked as counterfeit</li>
              <li>Distributor flagged for investigation</li>
              <li>Report escalated to NAFDAC</li>
              <li>Consumers advised to avoid this product</li>
            </ul>
          </p>
        ` : ""}
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Thank you for helping us protect Nigerian consumers.
        </p>
      </div>
    `,
    text: `Investigation of ${codeValue}: ${result.status === "confirmed" ? "COUNTERFEIT CONFIRMED" : "GENUINE"}. ${result.details}`,
  }),

  /**
   * Template: Health Alert Escalation
   */
  healthAlertEscalation: (reporterName, codeValue, symptoms) => ({
    subject: "URGENT: Health Concern - Product ${codeValue}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fff3cd; border-left: 4px solid #e74c3c; padding: 15px; margin-bottom: 20px;">
          <h2 style="color: #e74c3c; margin-top: 0;">⚠️ URGENT HEALTH CONCERN</h2>
        </div>
        
        <p>Dear ${reporterName || "Reporter"},</p>
        
        <p>Thank you for reporting health concerns related to product code <strong>${codeValue}</strong>.</p>
        
        <p><strong>Your Symptoms:</strong></p>
        <p style="background: #f0f0f0; padding: 15px;">
          ${symptoms}
        </p>
        
        <p style="color: #e74c3c;"><strong>IMPORTANT:</strong></p>
        <ul>
          <li>If experiencing severe symptoms, seek medical attention immediately</li>
          <li>Do not use this product</li>
          <li>Keep the packaging for medical records</li>
          <li>Report to nearest hospital/health facility</li>
        </ul>
        
        <p>Your report has been <strong>escalated to NAFDAC (National Agency for Food and Drug Administration and Control)</strong> as a health emergency.</p>
        
        <p>You will be contacted by health authorities for follow-up.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Your safety is our priority. Thank you for protecting other consumers.
        </p>
      </div>
    `,
    text: `URGENT: Health concern reported for product ${codeValue}. Symptoms: ${symptoms}. Escalated to NAFDAC.`,
  }),
};
