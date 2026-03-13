# LUMORA Platform Architecture & Data Flow

## 🏗️ System Overview

Lumora is a **product authentication & regulatory monitoring platform** with three primary user roles:

```
┌─────────────────────────────────────────────────────────┐
│                    LUMORA PLATFORM                      │
├─────────────────────────────────────────────────────────┤
│  👤 CONSUMERS      │  🏭 MANUFACTURERS  │  🏛️ REGULATORS │
│  Verify products  │  Register products │  Monitor cases  │
│  Report issues    │  Generate codes    │  Escalate issues│
│  Get advisories   │  Track trust score │  Track hotspots│
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Core Data Models & Relationships

### **1. User Ecosystem**

**User Types** (Role enum):

- `CONSUMER` - General users verifying products, filing reports
- `MANUFACTURER` - Companies registering products & managing batches
- `ADMIN` - Platform administrators (review queue management)
- `NAFDAC` - Regulatory officials (escalated case monitoring)

**Key User Tables**:

- `User` - Base user account (email, password, role)
- `Manufacturer` - Extended profile for manufacturing users
  - trustScore: Calculated AI trust metric (0-100)
  - riskLevel: LOW/MEDIUM/HIGH
  - accountStatus: pending_verification, verified, rejected

---

### **2. Product Verification Flow**

#### **Step 1: Manufacturer Registration**

```
Manufacturer.signup()
  ↓
Creates → ManufacturerReview (status: pending)
  ↓
Admin.reviewManufacturer()
  ↓
If approved → Manufacturer.status = verified
If rejected → Manufacturer.status = rejected
```

**Data Model**: `ManufacturerReview`

- manufacturerId: Link to manufacturer
- status: pending | approved | rejected | needs_docs
- trustScore: AI-calculated trust metric
- riskAssessment: AI risk summary
- documentVerification: Document verification status (JSON)

#### **Step 2: Product Registration**

```
Manufacturer.registerProduct()
  → Creates Batch records
  → Generates Code records (QR codes)
  → Each code linked to batch & manufacturer
```

**Data Models**:

- `Drug` - Product information
- `Batch` - Production batches (batch number, prod date, expiry)
- `Code` - Individual QR codes (unique codeValue)

#### **Step 3: Consumer Verification**

```
Consumer.verifyCode(qrCode)
  ↓
Creates → VerificationLog
  ↓
Calls → AIRiskService.calculateRisk()
  ↓
Returns → { riskScore, riskLevel, advisory, safetyTips }
```

**Data Model**: `VerificationLog`

- codeValue: The scanned QR code
- userId: Consumer performing verification
- verificationState: GENUINE | CODE_ALREADY_USED | INVALID | UNREGISTERED_PRODUCT | SUSPICIOUS_PATTERN
- riskScore: 0-100 (from AI)
- latitude/longitude: Geographic location (optional)

---

### **3. Reporting & Case Management**

#### **Step 1: Consumer Reports Counterfeit**

```
Consumer.reportProduct({
  codeValue,
  description: "Found expired packaging",
  location: "Lagos market",
  reason: "Looks fake"
})
  ↓
Creates → UserReport (status: NEW)
  ↓
**Auto-creates** → CaseFile (status: open)
```

**Data Model**: `UserReport`

- reporterId: Consumer ID
- codeValue: Product code being reported
- reason: Quality issue | Counterfeit | Wrong packaging | Expired | Other
- location/latitude/longitude: Geographic data
- status: NEW | UNDER_REVIEW | ESCALATED | RESOLVED | DISMISSED
- riskLevel: PENDING | LOW | MEDIUM | HIGH | CRITICAL

#### **Step 2: Admin Reviews & Escalates**

```
Admin.openDashboard()
  → Views CaseFile list
  → Sees related UserReports
  → Can escalate with nafdacReported=true

If escalated:
  CaseFile.nafdacReported = true
  CaseFile.nafdacStatus = "pending"
  Creates → Incident (NAFDAC visibility)
```

**Data Model**: `CaseFile`

- caseNumber: Unique case ID
- status: open | under_review | escalated | closed
- severity: low | medium | high | critical
- nafdacReported: Boolean (escalation flag)
- nafdacReportDate: When escalated to NAFDAC
- nafdacStatus: pending | acknowledged | investigating | resolved
- nafdacReference: NAFDAC ticket number

---

### **4. NAFDAC Regulatory Monitoring**

#### **Incident Tracking**

```
When CaseFile escalated (nafdacReported=true)
  ↓
Creates → Incident
  ↓
NAFDAC.dashboard displays:
  - All OPEN incidents
  - Geographic hotspots
  - Risk trends
  - Severity indicators
```

**Data Model**: `Incident`

- codeValue: Product code in question
- riskScore: Risk severity (0-100)
- status: OPEN | ACKNOWLEDGED | ESCALATED | CLOSED
- latitude/longitude: Geographic location (hotspot identification)
- createdAt: When incident created

#### **Hotspot Detection**

```
NAFDAC.getHotspots()
  → Groups VerificationLogs by location
  → Filters for suspicious patterns:
    - CODE_ALREADY_USED
    - SUSPICIOUS_PATTERN
    - UNREGISTERED_PRODUCT
  → Returns heat map data
```

**AI Predicted Hotspots** (Coming Soon):

- Uses historical data + machine learning
- Predicts future high-risk areas
- Helps preventive enforcement

---

## 🔄 Complete Data Flow: User → Manufacturer → NAFDAC

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CONSUMER VERIFICATION                                        │
├─────────────────────────────────────────────────────────────────┤
│ Consumer scans QR → VerificationLog created                     │
│ AI analyzes → RiskScore calculated → Advisory shown            │
│ If suspicious → User can file report                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. REPORT CREATION                                              │
├─────────────────────────────────────────────────────────────────┤
│ UserReport created (status: NEW)                                │
│ → Auto-creates CaseFile (status: open)                          │
│ → Linked to Manufacturer                                        │
│ → AI risk scoring on case creation                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. ADMIN REVIEW                                                 │
├─────────────────────────────────────────────────────────────────┤\n│ Admin views Case Queue                                           │\n│ Sees trust/risk scores (calculated by AI)                       │\n│ Reviews linked UserReports                                      │\n│ Analyzes Manufacturer reputation                                │\n│ Can:                                                            │\n│   • Request more documentation                                  │\n│   • Mark manufacturer as suspicious                             │\n│   • Escalate case to NAFDAC                                     │\n└─────────────────────────────────────────────────────────────────┘\n                            ↓\n┌─────────────────────────────────────────────────────────────────┐\n│ 4. ESCALATION TO NAFDAC                                        │\n├─────────────────────────────────────────────────────────────────┤\n│ Admin sets CaseFile.nafdacReported = true                       │\n│ → CaseFile.status = \"escalated\"                                 │\n│ → Incident automatically created                                │\n│ → NAFDAC users see new incident in their dashboard              │\n└─────────────────────────────────────────────────────────────────┘\n                            ↓\n┌─────────────────────────────────────────────────────────────────┐\n│ 5. NAFDAC MONITORING & ENFORCEMENT                              │\n├─────────────────────────────────────────────────────────────────┤\n│ NAFDAC Dashboard shows:                                         │\n│   • Current incidents (OPEN status)                             │\n│   • Geographic hotspots (clustering)                            │\n│   • Risk trends (7-day chart)                                   │\n│   • Case details with full evidence                             │\n│                                                                 │\n│ NAFDAC can:                                                     │\n│   • Acknowledge incident                                        │\n│   • Update status                                               │\n│   • Add notes & findings                                        │\n│   • Close cases                                                 │\n│   • Generate reports                                            │\n└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Frontend Architecture

### **Dashboard Hierarchy**

```
/admin/
  ├─ dashboard/        → Main stats & overview
  ├─ manufacturers/   → Review queue (trust/risk scores)
  ├─ cases/           → Case management
  └─ reports/         → User report processing

/nafdac/
  ├─ (dashboard)      → Incidents overview
  ├─ cases/           → Escalated cases list
  └─ alerts/          → Real-time incident monitoring
```

### **Shared Patterns (Admin & NAFDAC)**

Both dashboards follow these patterns:

1. **Authentication**:

   ```javascript
   // useAdmin hook provides:
   const { adminUser, isHydrated, logout, hasRole } = useAdmin();
   ```

2. **Role-Based Redirect** (in login):

   ```javascript
   if (user.role === "NAFDAC") router.push("/nafdac");
   else router.push("/admin/dashboard");
   ```

3. **Component Protection**:

   ```javascript
   if (!adminUser || adminUser.role !== "NAFDAC") {
     router.push("/admin/dashboard");
     return;
   }
   ```

4. **Error Handling**:

   ```javascript
   try {
     const res = await fetch(url, {
       headers: { Authorization: `Bearer ${adminToken}` },
     });
     if (!res.ok) throw new Error("Request failed");
   } catch (err) {
     setError(err.message);
   }
   ```

5. **Loading States**:
   ```javascript
   if (!isHydrated || isLoading) return <LoadingSpinner />;
   if (error) return <ErrorDisplay />;
   ```

---

## 🔐 Security Layers

### **Backend Security** (app.js):

- **Security Headers**: X-Frame-Options, CSP, HSTS
- **CORS**: Restricted to frontend origin
- **Rate Limiting**: Via middleware
- **JWT Authentication**: Token verification
- **Error Handling**: Masked errors in production

### **Frontend Security**:

- **Auth Middleware**: Token validation in useAdmin
- **Role-Based Access**: Checked before rendering
- **SSR Hydration**: isHydrated checks prevent flash
- **Token Storage**: admin_token in localStorage (encrypted in production)
- **Input Validation**: Form validation before API calls

---

## 📈 AI & Risk Scoring

### **Trust Score Calculation** (Dynamic)

Combines:

- Document verification (NAFDAC license, CAC)
- Website legitimacy check
- Document authenticity check
- Historical verification patterns
- User report frequency
- Geographic anomalies

**Score Range**: 0-100

- 0-30: HIGH RISK (red)
- 31-70: MEDIUM RISK (yellow)
- 71-100: LOW RISK (green)

### **Risk Assessment** (Verification-time):

```javascript
calculateRisk({
  code: codeValue,
  verificationState,
  userLocation,
  previousVerifications,
});
// Returns: { riskScore, riskLevel, advisory, safetyTips }
```

---

## 🚀 Deployment Architecture

### **Backend** (Fastify + PostgreSQL):

- API: `https://api.lumora.ng/api/`
- Database: Neon PostgreSQL (connection pooling)
- Authentication: JWT tokens (admin_token, or token for users)
- Background Jobs: Hourly/daily analytics, security checks

### **Frontend** (Next.js 16):

- Main: `https://lumora.ng/`
- Routes: /auth, /admin, /nafdac, /dashboard
- Static: Vercel CDN
- API calls: Auto-retry with exponential backoff

### **Data Synchronization**:

- Real-time: WebSocket for live incident updates (future)
- Polling: 30-second dashboard refresh
- Batch: Hourly analytics aggregation

---

## 📋 Complete API Endpoint Map

### **Public Endpoints** (Consumer verification):

- `POST /api/verify/code` - Verify QR code
- `POST /api/reports` - File counterfeit report
- `GET /api/analytics/public` - Public statistics

### **Admin Endpoints** (Authentication required):

- `GET /api/admin/manufacturers/review-queue` - Pending reviews
- `PATCH /api/admin/manufacturers/:id/approve` - Approve manufacturer
- `GET /api/admin/cases` - Case list
- `PATCH /api/admin/cases/:id/escalate-nafdac` - Escalate case

### **NAFDAC Endpoints** (NAFDAC role required):

- `GET /api/nafdac/incidents` - List incidents
- `PATCH /api/nafdac/incidents/:id/status` - Update incident status
- `GET /api/nafdac/hotspots` - Geographic hotspots
- `GET /api/nafdac/hotspots/predicted` - AI predicted hotspots

---

## ✅ Production Readiness Checklist

- ✅ Authentication & authorization working
- ✅ AI risk scoring functional
- ✅ Trust scores calculated dynamically
- ✅ Admin dashboard operational
- ✅ NAFDAC dashboard built & role-routed
- ✅ Security headers added
- ✅ Error handling implemented
- ⏳ End-to-end testing
- ⏳ Performance optimization
- ⏳ Monitoring & alerting setup

---

## 🔧 Quick Troubleshooting

**"NAFDAC can't see cases"**:

- Check: Admin escalated case (`nafdacReported=true`)
- Check: NAFDAC user has correct role in database
- Check: Case has valid status (escalated, not rejected)

**"Trust scores showing NULL"**:

- Already fixed! Scores calculated on list/detail fetch
- If still null: Check `calculateDynamicTrustScore()` running

**"AI risk not showing in verification"**:

- Check: OPENAI_API_KEY configured
- Check: ENABLE_AI_RISK=true env var
- Check: verificationService calling calculateRisk()

**"Cases not auto-creating from reports"**:

- Check: UserReport creation triggering CaseFile creation
- Check: Database cascade rules intact
- Check: Admin configured to auto-create on report
