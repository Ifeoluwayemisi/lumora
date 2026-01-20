# 🧪 QUICK TEST GUIDE - PHASE 3

**Purpose**: Validate all 7 critical features work correctly  
**Time**: ~30 minutes  
**Prerequisites**: Backend running, admin token available

---

## 🔧 SETUP

### 1. Get Admin Token
```bash
# Login as admin user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lumora.com",
    "password": "admin_password"
  }'

# Copy the token from response
TOKEN="your_token_here"
```

### 2. Generate Test Encryption Key
```bash
# Only if ENCRYPTION_KEY not set
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ TEST CASES

### Test 1: Risk Score Calculation
**Purpose**: Verify dynamic risk scoring works

```bash
# Single manufacturer risk recalculation
curl -X POST http://localhost:5000/api/admin/security/recalculate-risk/mfg_123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
# {
#   "success": true,
#   "message": "Risk score recalculated",
#   "data": {
#     "manufacturerId": "mfg_123",
#     "riskScore": 45,
#     "riskLevel": "MEDIUM",
#     "lastAssessment": "2024-01-15T10:30:00Z"
#   }
# }
```

**Validation**:
- [ ] Response status 200
- [ ] Risk score between 0-100
- [ ] Timestamp is current

---

### Test 2: Trust Score Calculation
**Purpose**: Verify 5-component trust scoring

```bash
# Single manufacturer trust recalculation
curl -X POST http://localhost:5000/api/admin/security/recalculate-trust/mfg_123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
# {
#   "success": true,
#   "message": "Trust score recalculated",
#   "data": {
#     "manufacturerId": "mfg_123",
#     "trustScore": 72,
#     "components": {
#       "verification": 85,
#       "payment": 70,
#       "compliance": 65,
#       "activity": 60,
#       "quality": 75
#     }
#   }
# }
```

**Validation**:
- [ ] Response status 200
- [ ] Trust score between 0-100
- [ ] All components populated
- [ ] Components sum correctly

---

### Test 3: Trust Score Trend
**Purpose**: Verify trend analysis over 90 days

```bash
# Get trust score trend
curl -X GET "http://localhost:5000/api/admin/security/trust-trend/mfg_123?days=90" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "manufacturerId": "mfg_123",
#     "trend": "IMPROVING",
#     "history": [
#       { "date": "2024-01-01", "score": 50 },
#       { "date": "2024-01-02", "score": 52 },
#       ...
#     ]
#   }
# }
```

**Validation**:
- [ ] Trend is IMPROVING, STABLE, or DECLINING
- [ ] History array has data
- [ ] Dates are in order

---

### Test 4: Website Legitimacy Check
**Purpose**: Verify website verification

```bash
# Check website legitimacy
curl -X POST http://localhost:5000/api/admin/security/check-website/mfg_123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "website": "https://manufacturer.com"
  }'

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "domain": "manufacturer.com",
#     "riskScore": 25,
#     "verdict": "LEGITIMATE",
#     "checks": {
#       "domainAge": "PASS",
#       "ssl": "PASS",
#       "reputation": "PASS",
#       "companyName": "PASS"
#     }
#   }
# }
```

**Validation**:
- [ ] Response status 200
- [ ] Verdict is LEGITIMATE, MODERATE, or SUSPICIOUS
- [ ] Risk score between 0-100
- [ ] All checks have status

---

### Test 5: Document Forgery Detection
**Purpose**: Verify document analysis

```bash
# Check document for forgery
curl -X POST http://localhost:5000/api/admin/security/check-document/mfg_123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "NAFDAC_LICENSE",
    "filePath": "uploads/nafdac_license.jpg"
  }'

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "documentType": "NAFDAC_LICENSE",
#     "riskScore": 15,
#     "verdict": "LEGITIMATE",
#     "checks": {
#       "elaResult": "CLEAN",
#       "metadataResult": "CLEAN",
#       "qualityScore": 85,
#       "hasSecurityFeatures": true
#     }
#   }
# }
```

**Validation**:
- [ ] Response status 200
- [ ] Verdict is LEGITIMATE, MODERATE_RISK, SUSPICIOUS, or LIKELY_FORGED
- [ ] Risk score between 0-100
- [ ] Quality score between 0-100

---

### Test 6: Rate Limiting
**Purpose**: Verify rate limiting works

```bash
# Check rate limit status
curl -X GET http://localhost:5000/api/admin/security/rate-limit-status/user_123 \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "userId": "user_123",
#     "limits": {
#       "CODE_GENERATION": { "used": 45, "limit": 100, "remaining": 55 },
#       "VERIFICATION": { "used": 500, "limit": 1000, "remaining": 500 },
#       "API": { "used": 2000, "limit": 10000, "remaining": 8000 },
#       "BATCH_CREATION": { "used": 10, "limit": 50, "remaining": 40 },
#       "TEAM_INVITE": { "used": 5, "limit": 10, "remaining": 5 }
#     }
#   }
# }
```

**Validation**:
- [ ] Response status 200
- [ ] All action types present
- [ ] Remaining = limit - used
- [ ] All values are non-negative

---

### Test 7: Encryption Service
**Purpose**: Verify encryption/decryption

```bash
# Test via code (in backend console):
const encryptionService = require('./src/services/encryptionService');

// Test encryption
const plaintext = "sensitive_data_123";
const encrypted = encryptionService.encryptData(plaintext);
const decrypted = encryptionService.decryptData(encrypted);

console.log("Original:", plaintext);
console.log("Decrypted:", decrypted);
console.log("Match:", plaintext === decrypted); // Should be true
```

**Validation**:
- [ ] Decrypted matches original
- [ ] Encrypted is different from original
- [ ] No errors thrown

---

### Test 8: Background Jobs
**Purpose**: Verify scheduled jobs run

```bash
# Check server logs
# Look for:
# ✅ [SECURITY JOBS] All security jobs initialized successfully
# ✅ [DAILY RISK CALC] Recalculating risk scores...
# ✅ [DAILY TRUST CALC] Recalculating trust scores...
# ✅ [HEALTH CHECK] System healthy

# Monitor for 5 minutes to see jobs run
tail -f backend.log | grep "SECURITY JOBS"
```

**Validation**:
- [ ] Jobs start without errors
- [ ] Health checks run every 5 minutes
- [ ] No memory leaks over time

---

### Test 9: Full Check (Combined)
**Purpose**: Run all checks at once

```bash
# Run comprehensive check on manufacturer
curl -X POST http://localhost:5000/api/admin/security/full-check/mfg_123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "manufacturerId": "mfg_123",
#     "riskScore": { "value": 35, "level": "LOW" },
#     "trustScore": { "value": 78, "components": {...} },
#     "websiteCheck": { "verdict": "LEGITIMATE", ... },
#     "documentChecks": [
#       { "type": "NAFDAC_LICENSE", "verdict": "LEGITIMATE", ... }
#     ],
#     "rateLimitStatus": {...},
#     "completedAt": "2024-01-15T10:45:00Z"
#   }
# }
```

**Validation**:
- [ ] Response status 200
- [ ] All check types included
- [ ] No null/undefined values
- [ ] Completion timestamp is current

---

## 📊 BATCH TESTS

### Batch Test 1: Recalculate All Risks
```bash
curl -X POST http://localhost:5000/api/admin/security/recalculate-all-risks \
  -H "Authorization: Bearer $TOKEN"

# Expected: Processes all manufacturers
```

### Batch Test 2: Recalculate All Trusts
```bash
curl -X POST http://localhost:5000/api/admin/security/recalculate-all-trust \
  -H "Authorization: Bearer $TOKEN"

# Expected: Processes all manufacturers
```

### Batch Test 3: Recheck All Websites
```bash
curl -X POST http://localhost:5000/api/admin/security/recheck-all-websites \
  -H "Authorization: Bearer $TOKEN"

# Expected: Checks all manufacturer websites
```

---

## 🔍 TROUBLESHOOTING

### Test Fails with 401
**Issue**: Admin token invalid or missing
**Fix**:
```bash
# Regenerate token
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"admin@lumora.com","password":"admin_pass"}'
```

### Test Fails with 404
**Issue**: Route not registered
**Fix**:
```bash
# Check app.js has security routes
grep "adminSecurityRoutes" backend/src/app.js

# Restart server
npm run dev
```

### Test Fails with 500
**Issue**: Service error
**Fix**:
```bash
# Check logs
npm run dev 2>&1 | grep ERROR

# Check .env variables
ENCRYPTION_KEY=present
DATABASE_URL=valid
```

### Rate Limit Tests Show 0 Usage
**Issue**: First run, no history yet
**Fix**: Run some operations first, then check limits

---

## 📈 PERFORMANCE VALIDATION

### Measure Response Times
```bash
# Time risk calculation
time curl -X POST http://localhost:5000/api/admin/security/recalculate-risk/mfg_123 \
  -H "Authorization: Bearer $TOKEN"

# Should complete in <500ms
```

### Check Database Query Performance
```bash
# In database:
SELECT COUNT(*) FROM "WebsiteLegitimacyCheck";
SELECT COUNT(*) FROM "DocumentForgerCheck";
SELECT COUNT(*) FROM "TrustScoreHistory";

# Should be fast (<100ms)
```

---

## ✅ SIGN-OFF CHECKLIST

- [ ] Test 1: Risk Score - PASS
- [ ] Test 2: Trust Score - PASS
- [ ] Test 3: Trust Trend - PASS
- [ ] Test 4: Website Check - PASS
- [ ] Test 5: Document Check - PASS
- [ ] Test 6: Rate Limiting - PASS
- [ ] Test 7: Encryption - PASS
- [ ] Test 8: Background Jobs - PASS
- [ ] Test 9: Full Check - PASS
- [ ] Batch Test 1: Risks - PASS
- [ ] Batch Test 2: Trusts - PASS
- [ ] Batch Test 3: Websites - PASS
- [ ] Performance: All <1 second - PASS
- [ ] No errors in logs - PASS

---

## 🎉 NEXT STEPS

Once all tests pass:
1. Deploy to Render staging
2. Run tests on staging
3. Deploy to production
4. Monitor logs for 24 hours
5. Begin Phase 4: Frontend Integration

**Estimated Time**: 1-2 hours for complete validation

