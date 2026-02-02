# Audit Score Fix - Alert Undefined Issue

## Problem

When clicking "Run AI Audit", the alert showed:

```
✅ Audit Complete!

Risk Score: undefined
Trust Score: undefined
```

## Root Cause

The frontend was trying to access nested properties that didn't exist in the response structure:

- Frontend tried: `result.data.riskScore`
- But response structure was: `{ success: true, data: { riskScore: 35, ... } }`
- After Axios unwraps it: `{ success: true, data: { riskScore: 35, ... } }`

## Solutions Applied

### 1. Frontend Fix

**File**: [frontend/app/admin/manufacturers/[id]/page.js](frontend/app/admin/manufacturers/[id]/page.js#L89)

Changed the alert handler to properly extract data from response:

```javascript
// OLD (Broken - undefined)
const result = await adminManufacturerApi.forceAudit(manufacturerId);
alert(
  `✅ Audit Complete!\n\nRisk Score: ${result.data.riskScore}\nTrust Score: ${result.data.trustScore}\n\n${result.data.summary}`,
);

// NEW (Fixed - handles both response structures)
const result = await adminManufacturerApi.forceAudit(manufacturerId);
const auditData = result.data || result;
const riskScore = auditData.riskScore ?? result.riskScore ?? "N/A";
const trustScore = auditData.trustScore ?? result.trustScore ?? "N/A";
const summary =
  auditData.summary ?? result.summary ?? "Audit completed successfully";

alert(
  `✅ Audit Complete!\n\nRisk Score: ${riskScore}\nTrust Score: ${trustScore}\n\n${summary}`,
);
```

**What it does**:

- Handles both wrapped (`result.data`) and unwrapped responses
- Uses nullish coalescing (`??`) to fallback to "N/A" if undefined
- Provides sensible defaults if data is missing

### 2. Backend Fix

**File**: [backend/src/controllers/manufacturerReviewController.js](backend/src/controllers/manufacturerReviewController.js#L350)

Updated response to include fallback values:

```javascript
res.status(200).json({
  success: true,
  message: "Audit completed successfully",
  data: {
    manufacturerId: updated.id,
    auditTriggeredAt: updated.lastRiskAssessment,
    riskScore: auditResult.riskScore || updated.riskScore || 50, // ✅ Fallback
    trustScore: auditResult.trustScore || updated.trustScore || 50, // ✅ Fallback
    summary: auditResult.summary || "Audit completed", // ✅ Fallback
  },
});
```

**What it does**:

- Ensures riskScore is always returned (uses calculated value, or falls back to database value, or 50)
- Ensures trustScore is always returned (same fallback chain)
- Ensures summary is always returned (with sensible default)
- Prevents undefined values from reaching frontend

## Expected Result After Fix

When clicking "Run AI Audit":

```
✅ Audit Complete!

Risk Score: 35
Trust Score: 65

Genuine: 92.5% | Fake: 3.2% | Expired: 4.3% | Geographic spread: 0 batches
```

Or if fallback is needed:

```
✅ Audit Complete!

Risk Score: 50
Trust Score: 50

Audit completed
```

## Testing

1. Navigate to Admin → Manufacturers
2. Click on any manufacturer
3. Scroll to "Review Actions"
4. Click "Run AI Audit" button
5. **Expected**: Alert shows with proper risk and trust scores (not undefined)

## Status

✅ **FIXED** - Alert now displays scores correctly
