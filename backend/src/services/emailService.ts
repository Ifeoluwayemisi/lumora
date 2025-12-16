import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM || "noreply@lumora.com",
    to,
    subject,
    text: text || "",
    html,
  });
  return info;
}