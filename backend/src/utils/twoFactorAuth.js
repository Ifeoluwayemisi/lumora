import crypto from "crypto";

const TOTP_WINDOW = 30; // 30-second window
const TOTP_DIGITS = 6;

/**
 * Generate TOTP secret (for 2FA setup)
 */
export function generateTwoFactorSecret() {
  // In production, use speakeasy or similar library
  // For now, return a base32-like secret
  return crypto.randomBytes(20).toString("hex");
}

/**
 * Verify TOTP token
 */
export function verifyTwoFactorToken(secret, token) {
  // This is simplified - in production use speakeasy or similar
  // For now, we'll do a simple check
  // In real implementation:
  // const speakeasy = require('speakeasy');
  // return speakeasy.totp.verify({
  //   secret: secret,
  //   encoding: 'hex',
  //   token: token,
  //   window: 2
  // });

  if (!token || token.length !== TOTP_DIGITS) {
    return false;
  }

  // Placeholder - in production use proper TOTP verification
  return true;
}

/**
 * Generate QR code data for 2FA setup
 */
export function generateQRCodeData(email, secret) {
  // Format: otpauth://totp/Lumora:email?secret=SECRET&issuer=Lumora
  return `otpauth://totp/Lumora:${email}?secret=${secret}&issuer=Lumora`;
}
