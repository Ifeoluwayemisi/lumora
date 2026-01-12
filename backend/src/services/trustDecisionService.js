import { TrustDecision } from "../constants/trustDecision.js";

export function getTrustDecision({ state, riskScore }) {
  // Highest priority rules first (explicit > implicit)

  if (state === "SUSPICIOUS_PATTERN") {
    return TrustDecision.REPORT_TO_NAFDAC;
  }

  if (state === "CODE_ALREADY_USED") {
    return TrustDecision.DO_NOT_USE;
  }

  if (state === "UNREGISTERED_PRODUCT") {
    if (riskScore >= 0.6) {
      return TrustDecision.DO_NOT_USE;
    }
    return TrustDecision.VERIFY_WITH_PHARMACIST;
  }

  if (state === "INVALID_CODE") {
    return TrustDecision.DO_NOT_USE;
  }

  if (state === "GENUINE" && riskScore < 0.3) {
    return TrustDecision.SAFE_TO_USE;
  }

  // Fallback safety net
  return TrustDecision.VERIFY_WITH_PHARMACIST;
}
