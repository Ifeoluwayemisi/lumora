import { TrustDecision } from "../constants/trustDecision.js";

/**
 * Determine trust decision based on verification state and risk score
 * riskScore: 0-100 (0 = safe, 100 = suspicious)
 * state: verification state (GENUINE, UNREGISTERED_PRODUCT, CODE_ALREADY_USED, PRODUCT_EXPIRED, SUSPICIOUS_PATTERN)
 */
export function getTrustDecision({ state, riskScore = 0 }) {
  // Normalize riskScore to 0-100 if needed
  const score = typeof riskScore === "number" ? riskScore : 0;

  // Highest priority rules first (explicit > implicit)
  if (state === "SUSPICIOUS_PATTERN") {
    return TrustDecision.REPORT_TO_NAFDAC;
  }

  if (state === "CODE_ALREADY_USED") {
    return TrustDecision.DO_NOT_USE;
  }

  if (state === "PRODUCT_EXPIRED") {
    return TrustDecision.DO_NOT_USE;
  }

  if (state === "UNREGISTERED_PRODUCT") {
    // Use 60 as threshold for 0-100 scale
    if (score >= 60) {
      return TrustDecision.DO_NOT_USE;
    }
    return TrustDecision.VERIFY_WITH_PHARMACIST;
  }

  if (state === "INVALID_CODE") {
    return TrustDecision.DO_NOT_USE;
  }

  if (state === "GENUINE" && score < 30) {
    // Low risk = safe
    return TrustDecision.SAFE_TO_USE;
  }

  if (state === "GENUINE" && score >= 30 && score < 60) {
    // Medium risk = verify with pharmacist
    return TrustDecision.VERIFY_WITH_PHARMACIST;
  }

  if (state === "GENUINE" && score >= 60) {
    // High risk = do not use
    return TrustDecision.DO_NOT_USE;
  }

  // Fallback safety net
  return TrustDecision.VERIFY_WITH_PHARMACIST;
}