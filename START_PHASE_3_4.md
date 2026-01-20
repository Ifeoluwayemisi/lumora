# ⚡ QUICK START - PHASE 3 & 4

**Time**: ~3.5 hours total  
**Status**: Ready to execute NOW  
**Your next action**: Choose Option A or B below

---

## 🚀 OPTION A: START WITH PHASE 3 TESTING (Recommended First)

### Step 1: Start Backend (2 minutes)
```bash
cd backend
npm run dev
```

**Wait for**: `Server running on port 5000`

### Step 2: Get Admin Token (3 minutes)
```bash
# Open new terminal and run:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lumora.com",
    "password": "admin_password"
  }'
```

**Save the token** from response into `$ADMIN_TOKEN`

### Step 3: Run Quick Tests (10 minutes)
Copy-paste each test below one at a time:

**Test 1: Risk Score**
```bash
ADMIN_TOKEN="your_token_here"

curl -X POST http://localhost:5000/api/admin/security/recalculate-risk/mfg_123 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Test 2: Trust Score**
```bash
curl -X POST http://localhost:5000/api/admin/security/recalculate-trust/mfg_123 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Test 3: Full Check**
```bash
curl -X POST http://localhost:5000/api/admin/security/full-check/mfg_123 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Test 4: Rate Limit Status**
```bash
curl -X GET http://localhost:5000/api/admin/security/rate-limit-status/user_123 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Test 5: Batch Risks**
```bash
curl -X POST http://localhost:5000/api/admin/security/recalculate-all-risks \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Step 4: Verify (5 minutes)
```bash
# Check server logs for errors
# Look for: "✅ [SECURITY JOBS]" messages
# No red error text = SUCCESS ✅
```

**✅ Phase 3 Complete!** → Move to Phase 4

---

## 🎨 OPTION B: START WITH PHASE 4 FRONTEND (If Backend Tests Already Pass)

### Step 1: Create Frontend Structure (5 minutes)

```bash
# In frontend directory
mkdir -p app/admin/security/components
mkdir -p lib/api
mkdir -p lib/types
```

### Step 2: Create Type Definitions (10 minutes)

**File**: `frontend/lib/types/security.ts`
```typescript
export interface RiskScore {
  value: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  detectionRules: string[];
  lastAssessment: Date;
}

export interface TrustScore {
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

export interface WebsiteCheck {
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

export interface DocumentCheck {
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

export interface RateLimit {
  action: string;
  used: number;
  limit: number;
  remaining: number;
  resetsAt: Date;
}
```

### Step 3: Create API Client (15 minutes)

**File**: `frontend/lib/api/security.ts`
```typescript
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const securityAPI = {
  // Risk Scoring
  recalculateRisk: (manufacturerId: string) =>
    axios.post(`${API_BASE}/admin/security/recalculate-risk/${manufacturerId}`),
  
  recalculateAllRisks: () =>
    axios.post(`${API_BASE}/admin/security/recalculate-all-risks`),
  
  // Trust Scoring
  recalculateTrust: (manufacturerId: string) =>
    axios.post(`${API_BASE}/admin/security/recalculate-trust/${manufacturerId}`),
  
  recalculateAllTrusts: () =>
    axios.post(`${API_BASE}/admin/security/recalculate-all-trust`),
  
  getTrustTrend: (manufacturerId: string, days: number = 90) =>
    axios.get(`${API_BASE}/admin/security/trust-trend/${manufacturerId}?days=${days}`),
  
  // Website Checks
  checkWebsite: (manufacturerId: string, website: string) =>
    axios.post(`${API_BASE}/admin/security/check-website/${manufacturerId}`, { website }),
  
  getWebsiteHistory: (manufacturerId: string, limit: number = 10) =>
    axios.get(`${API_BASE}/admin/security/website-history/${manufacturerId}?limit=${limit}`),
  
  recheckAllWebsites: () =>
    axios.post(`${API_BASE}/admin/security/recheck-all-websites`),
  
  // Document Checks
  checkDocument: (manufacturerId: string, documentType: string, filePath: string) =>
    axios.post(`${API_BASE}/admin/security/check-document/${manufacturerId}`, {
      documentType,
      filePath,
    }),
  
  getDocumentHistory: (manufacturerId: string, limit: number = 10) =>
    axios.get(`${API_BASE}/admin/security/document-history/${manufacturerId}?limit=${limit}`),
  
  // Rate Limiting
  getRateLimitStatus: (userId: string) =>
    axios.get(`${API_BASE}/admin/security/rate-limit-status/${userId}`),
  
  resetRateLimit: (userId: string) =>
    axios.post(`${API_BASE}/admin/security/reset-rate-limit/${userId}`),
  
  getRateLimitStats: () =>
    axios.get(`${API_BASE}/admin/security/rate-limit-stats`),
  
  // Full Check
  fullCheck: (manufacturerId: string) =>
    axios.post(`${API_BASE}/admin/security/full-check/${manufacturerId}`),
};
```

### Step 4: Create Main Dashboard (30 minutes)

**File**: `frontend/app/admin/security/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import RiskScoreCard from './components/RiskScoreCard';
import TrustScoreCard from './components/TrustScoreCard';
import WebsiteCheckCard from './components/WebsiteCheckCard';
import DocumentCheckCard from './components/DocumentCheckCard';
import RateLimitCard from './components/RateLimitCard';

export default function SecurityDashboard() {
  const [manufacturerId, setManufacturerId] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            🔐 Security Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Monitor risk scores, trust ratings, and security verifications
          </p>
        </div>

        {/* Manufacturer Input */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Enter Manufacturer ID"
            value={manufacturerId}
            onChange={(e) => setManufacturerId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dashboard Cards */}
        {manufacturerId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RiskScoreCard manufacturerId={manufacturerId} />
            <TrustScoreCard manufacturerId={manufacturerId} />
            <WebsiteCheckCard manufacturerId={manufacturerId} />
            <DocumentCheckCard manufacturerId={manufacturerId} />
            <RateLimitCard userId={manufacturerId} />
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 5: Create Component Cards (60 minutes)

**Start with**: `frontend/app/admin/security/components/RiskScoreCard.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { securityAPI } from '@/lib/api/security';

export default function RiskScoreCard({ manufacturerId }: { manufacturerId: string }) {
  const [riskScore, setRiskScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      const response = await securityAPI.recalculateRisk(manufacturerId);
      setRiskScore(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
        🎯 Risk Score
      </h3>
      
      {riskScore ? (
        <>
          <div className="text-4xl font-bold mb-2">
            {riskScore.riskScore}/100
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Level: {riskScore.riskLevel}
          </div>
          <button
            onClick={handleRecalculate}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Recalculate'}
          </button>
        </>
      ) : (
        <button
          onClick={handleRecalculate}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Check Risk Score'}
        </button>
      )}
    </div>
  );
}
```

**Repeat for**:
- TrustScoreCard.tsx
- WebsiteCheckCard.tsx
- DocumentCheckCard.tsx
- RateLimitCard.tsx

### Step 6: Install Dependencies (5 minutes)
```bash
cd frontend
npm install recharts lucide-react swr
npm run dev
```

### Step 7: Test Frontend (10 minutes)
```bash
# Visit http://localhost:3000/admin/security
# Enter a manufacturer ID
# Click buttons to test features
```

---

## 🎯 CHOOSE YOUR PATH

### ✅ PATH 1: Phase 3 First (Recommended)
```
1. Start backend (5 min)
2. Run 9 tests (15 min)
3. Verify results (5 min)
4. Review PHASE_3_4_EXECUTION_PLAN.md (5 min)
5. Then do Phase 4 (90 min)
```

**Total**: ~2 hours

### ✅ PATH 2: Phase 4 (If Tests Already Pass)
```
1. Create frontend structure (5 min)
2. Create types & API (25 min)
3. Create dashboard (30 min)
4. Create components (60 min)
5. Install & test (15 min)
```

**Total**: ~2 hours

### ✅ PATH 3: Parallel (If Experienced)
```
1. Start backend testing
2. In second terminal: build frontend
3. Sync as you go
```

**Total**: ~3 hours

---

## 📋 CHECKLIST

### Before You Start
- [ ] Read PHASE_3_4_EXECUTION_PLAN.md
- [ ] Backend code reviewed
- [ ] Frontend folder structure ready
- [ ] Node/npm versions compatible
- [ ] Environment variables set

### Phase 3 Completion
- [ ] Test 1: Risk Score PASS
- [ ] Test 2: Trust Score PASS
- [ ] Test 3: Full Check PASS
- [ ] Test 4: Rate Limits PASS
- [ ] Test 5: Batch Ops PASS
- [ ] No errors in logs
- [ ] Ready for Phase 4

### Phase 4 Completion
- [ ] Dashboard loads
- [ ] All cards render
- [ ] API calls work
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Ready for deployment

---

## 🚀 START NOW

**Choose one:**

```bash
# Option A: Test backend first
npm run dev  # in backend folder
# Then run curl tests from QUICK_TEST_GUIDE.md

# Option B: Build frontend
# Create the files in Phase 4 section above
# Test at http://localhost:3000/admin/security
```

---

## ❓ COMMON ISSUES

**Issue**: "Token expired" error
**Fix**: Get new token from login endpoint

**Issue**: "API not found" error
**Fix**: Ensure backend is running on port 5000

**Issue**: Frontend won't load
**Fix**: Check .env files and npm run dev in frontend folder

**Issue**: "CORS error"
**Fix**: Backend CORS already configured for localhost:3000

---

## 📚 REFERENCE DOCS

- **Full Details**: `PHASE_3_4_EXECUTION_PLAN.md`
- **API Endpoints**: `API_QUICK_REFERENCE.md`
- **Test Cases**: `QUICK_TEST_GUIDE.md`
- **Deployment**: `DEPLOYMENT_READINESS.md`

---

**Ready? Pick your path and START! 🚀**

Questions? Check the docs or see PHASE_3_4_EXECUTION_PLAN.md for detailed instructions.

