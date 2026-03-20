import nodemailer from "nodemailer";
import prisma from "../models/prismaClient.js";

/**
 * Contact Form Controller
 * Handles landing page contact form submissions
 * Sends emails to configured recipients
 */

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const contactController = {
  /**
   * Submit contact form
   * POST /api/contact
   */
  submitContact: async (req, res) => {
    try {
      const { name, email, message } = req.body;

      // Validation
      if (!name || !email || !message) {
        return res.status(400).json({
          error: "Name, email, and message are required",
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Invalid email format",
        });
      }

      // Store contact submission in database
      const contact = await prisma.contact.create({
        data: {
          name,
          email,
          message,
          status: "RECEIVED",
        },
      });

      // Array of recipient emails
      const recipientEmails = [
        "destinifeoluwa@gmail.com",
        "ruqayatfashina414@gmail.com",
      ];

      // Send emails to both recipients
      for (const recipientEmail of recipientEmails) {
        try {
          // Email to recipients (notification)
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: `New Contact Form Submission from ${name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
                  <h2 style="color: #333; margin-bottom: 20px;">New Contact Form Submission</h2>
                  
                  <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                    <p style="margin: 0 0 15px 0;"><strong>Name:</strong> ${name}</p>
                    <p style="margin: 0 0 15px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 0 0 15px 0;"><strong>Message:</strong></p>
                    <p style="margin: 0; white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-left: 3px solid #27ae60;">${message}</p>
                  </div>

                  <p style="color: #666; font-size: 12px; margin: 0;">
                    Submitted at: ${new Date(contact.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            `,
          });

          console.log(`[CONTACT] Email sent to ${recipientEmail}`);
        } catch (emailError) {
          console.error(
            `[CONTACT] Error sending email to ${recipientEmail}:`,
            emailError,
          );
          // Continue sending to other recipients even if one fails
        }
      }

      // Send confirmation email to user
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "We Received Your Message - Lumora",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
                <h2 style="color: #27ae60; margin-bottom: 20px;">Thank You for Contacting Us</h2>
                
                <p style="color: #333; margin-bottom: 15px;">Hi ${name},</p>
                
                <p style="color: #333; margin-bottom: 15px;">
                  We've received your message and appreciate you reaching out to Lumora. 
                  Our team will review your inquiry and get back to you as soon as possible.
                </p>

                <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                  <p style="color: #666; font-size: 14px; margin: 0;">
                    <strong>Your Message:</strong><br/>
                    <span style="color: #333;">${message}</span>
                  </p>
                </div>

                <p style="color: #666; margin-bottom: 15px;">
                  If you have any urgent matters, please feel free to call us or visit our website.
                </p>

                <p style="color: #333;">Best regards,<br/><strong>The Lumora Team</strong></p>
              </div>
            </div>
          `,
        });

        console.log(`[CONTACT] Confirmation email sent to ${email}`);
      } catch (confirmationError) {
        console.error(
          "[CONTACT] Error sending confirmation email:",
          confirmationError,
        );
        // Don't fail the request if confirmation email fails
      }

      return res.status(200).json({
        success: true,
        message: "Thank you for your message. We will get back to you soon.",
        contactId: contact.id,
      });
    } catch (error) {
      console.error("[CONTACT] Submission error:", error);
      return res.status(500).json({
        error: "Failed to submit contact form. Please try again later.",
      });
    }
  },
};

export default contactController;
