# Admin Dashboard Frontend - Implementation Plan

## Overview

**Status**: Backend complete, Frontend ready to begin  
**Scope**: 7 admin pages + components  
**Tech Stack**: Next.js 14+, React, TailwindCSS, Recharts  
**Estimated Duration**: 5-7 days  
**Lines of Code Expected**: 3,500-4,000 lines

---

## Frontend Architecture

```
frontend/
├── app/
│   └── admin/
│       ├── layout.tsx              # Admin layout with sidebar
│       ├── login/
│       │   └── page.tsx            # 2-step login page
│       ├── dashboard/
│       │   └── page.tsx            # Main dashboard overview
│       ├── manufacturers/
│       │   ├── page.tsx            # Review queue list
│       │   └── [id]/
│       │       └── page.tsx        # Single review detail
│       ├── reports/
│       │   ├── page.tsx            # Report queue
│       │   └── [id]/
│       │       └── page.tsx        # Single report detail
│       ├── cases/
│       │   ├── page.tsx            # Case list
│       │   └── [id]/
│       │       └── page.tsx        # Case detail with notes
│       ├── audit/
│       │   └── page.tsx            # Audit log viewer
│       └── oversight/
│           └── page.tsx            # AI oversight dashboard
├── components/
│   └── admin/
│       ├── LoginForm.tsx           # 2-step login component
│       ├── DashboardMetrics.tsx    # Metrics card components
│       ├── HotspotMap.tsx          # Geographic heatmap
│       ├── TrendChart.tsx          # 30-day trend chart
│       ├── ManufacturerCard.tsx    # Review queue item
│       ├── ReportCard.tsx          # Report queue item
│       ├── CaseCard.tsx            # Case queue item
│       ├── AuditLogTable.tsx       # Audit log viewer
│       ├── Sidebar.tsx             # Admin navigation
│       ├── RoleGuard.tsx           # Role-based access
│       └── Modals/
│           ├── ApproveModal.tsx    # Approve manufacturer
│           ├── RejectModal.tsx     # Reject/dismiss
│           ├── LinkCaseModal.tsx   # Link to case
│           ├── CreateCaseModal.tsx # Create new case
│           └── NotesModal.tsx      # Add case notes
├── services/
│   └── adminApi.ts                 # Admin API client
├── hooks/
│   ├── useAdmin.ts                 # Admin context
│   ├── useAdminAuth.ts             # Auth hooks
│   └── usePagination.ts            # Pagination hook
└── lib/
    └── adminUtils.ts               # Utility functions
```

---

## Page Specifications

### 1. Admin Login Page

**Path**: `/admin/login`  
**Components**: LoginForm, 2FA input  
**Features**:

- Email + password input (Step 1)
- 2FA code input (Step 2)
- QR code display for first-time setup
- Error handling (invalid credentials, expired tokens)
- Session persistence

**User Flow**:

1. User enters email/password
2. Backend validates → returns tempToken
3. User enters 2FA code from authenticator app
4. Backend validates → returns authToken
5. Redirect to dashboard

**Key Functions**:

```typescript
async function step1Login(email: string, password: string);
// Request to: POST /api/admin/auth/login/step1
// Returns: {tempToken, expiresIn}

async function step2Login(tempToken: string, code: string);
// Request to: POST /api/admin/auth/login/step2
// Returns: {authToken, user}

async function generate2FAQRCode();
// For first-time admin setup
// Shows QR code to scan with authenticator
```

**Components Needed**:

- EmailPasswordForm
- 2FACodeInput
- LoadingState
- ErrorMessage

**State Management**:

- tempToken (Step 1 output)
- authToken (Step 2 output)
- isLoading
- error

---

### 2. Dashboard Overview

**Path**: `/admin/dashboard`  
**Access**: MODERATOR+ (all roles except SUPPORT)  
**Components**: Metrics cards, charts, hotspot map, alerts list

**Layout**:

```
┌─────────────────────────────────────────────────────────┐
│                    GLOBAL METRICS                        │
├──────────────┬──────────────┬──────────────┬─────────────┤
│ Verifications│   Verified   │  Suspicious  │   Invalid   │
│   Today: XX  │   Today: XX  │  Today: XX   │  Today: XX  │
│   All: XXXX  │   All: XXXX  │  All: XXXX   │  All: XXXX  │
├─────────────────────────────────────────────────────────┤
│  AUTHENTICITY BREAKDOWN (Pie Chart)  │  HOTSPOT MAP    │
│                                       │                 │
│  - Genuine: 88%                      │  [Nigeria Map   │
│  - Suspicious: 10%                   │   with heatmap] │
│  - Invalid: 2%                       │                 │
├─────────────────────────────────────────────────────────┤
│         VERIFICATION TREND (30-day Line Chart)          │
│                                                          │
│  [Chart showing daily verification counts]              │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  HIGH-RISK MANUFACTURERS  │  CRITICAL ALERTS             │
│  1. Mfg A (Risk: 89)      │  • Hotspot detected: Lagos   │
│  2. Mfg B (Risk: 76)      │  • 5 reports same product    │
│  3. Mfg C (Risk: 68)      │  • AI confidence drop: 12%   │
└─────────────────────────────────────────────────────────┘
```

**Data Endpoints**:

```typescript
GET /api/admin/dashboard/metrics?period=today|7days|alltime
GET /api/admin/dashboard/authenticity
GET /api/admin/dashboard/trend?days=30
GET /api/admin/dashboard/hotspots
GET /api/admin/dashboard/high-risk-manufacturers
GET /api/admin/dashboard/ai-health
GET /api/admin/dashboard/alerts
```

**Components Needed**:

- MetricsCard (reusable for stats)
- PieChart (Recharts)
- LineChart (30-day trend)
- HotspotMap (Leaflet or MapBox)
- ManufacturerRiskList
- AlertsFeed

**Interactivity**:

- Period selector (Today/7days/All time) → updates all metrics
- Click manufacturer → navigate to manufacturer review page
- Click alert → navigate to related resource (case/report)

---

### 3. Manufacturer Review Queue

**Path**: `/admin/manufacturers`  
**Access**: MODERATOR+  
**Components**: Review list, detail page, approval modals

**List Page**:

```
┌─────────────────────────────────────────────────────────┐
│ MANUFACTURER REVIEW QUEUE                               │
├─────────────────────────────────────────────────────────┤
│ Status Filter: [Pending▼] [Approved▼] [Rejected▼] [Needs Docs▼] │
├─────────────────────────────────────────────────────────┤
│ Queue Stats: Pending: 12 | Approved: 45 | Rejected: 8  │
├─────────────────────────────────────────────────────────┤
│ Mfg Name    │ Status   │ Trust Score │ Created    │ Action │
├─────────────┼──────────┼─────────────┼────────────┼────────┤
│ Pharma Inc  │ Pending  │ —           │ Jan 20     │ Review │
│ MediCorp    │ Needs... │ 65          │ Jan 19     │ Review │
│ Pharma Plus │ Pending  │ —           │ Jan 18     │ Review │
└─────────────────────────────────────────────────────────┘
```

**Detail Page** (`/admin/manufacturers/[id]`):

```
┌─────────────────────────────────────────────────────────┐
│ MANUFACTURER: Pharma Inc                                 │
├─────────────────────────────────────────────────────────┤
│ Company Info:                                            │
│ - Name: Pharma Inc                                       │
│ - License: REG-2024-001234                              │
│ - Registration: 2024-01-15                              │
│ - NAFDAC Verified: Yes                                   │
│                                                          │
│ Documents:                                               │
│ - CAC Certificate: ✓ Verified                           │
│ - NAFDAC License: ✓ Verified                            │
│ - Business Photo ID: ✓ Verified                         │
│ - Website Legitimacy: ✓ Good (Score: 92)                │
│                                                          │
│ AI Risk Assessment:                                      │
│ - Risk Score: 15/100 (LOW)                              │
│ - Confidence: 98%                                        │
│ - Suspicious Indicators: None                           │
│                                                          │
│ Recommendation: ✅ APPROVE                              │
│                                                          │
│ [Approve] [Reject] [Request Docs] [Suspend]            │
└─────────────────────────────────────────────────────────┘
```

**Data Endpoints**:

```typescript
GET /api/admin/manufacturers/review-queue?status=pending
GET /api/admin/manufacturers/review-queue/stats
GET /api/admin/manufacturers/:id/review
GET /api/admin/manufacturers/:id/admin-view
POST /api/admin/manufacturers/:id/approve
POST /api/admin/manufacturers/:id/reject
POST /api/admin/manufacturers/:id/request-docs
POST /api/admin/manufacturers/:id/suspend
```

**Modals**:

- **Approve Modal**: Input trust score (0-100), optional notes
- **Reject Modal**: Required reason dropdown + notes
- **Request Docs Modal**: Select missing document types
- **Suspend Modal**: Reason + warning confirmation

**Components Needed**:

- ManufacturerListTable
- ManufacturerDetailCard
- DocumentVerificationStatus
- ApproveModal
- RejectModal
- RequestDocsModal

---

### 4. User Reports & Incidents

**Path**: `/admin/reports`  
**Access**: MODERATOR+  
**Components**: Report queue, detail page, hotspot map

**List Page**:

```
┌─────────────────────────────────────────────────────────┐
│ USER REPORTS & INCIDENTS                                 │
├─────────────────────────────────────────────────────────┤
│ Status Filter: [NEW▼] [UNDER_REVIEW▼] [ESCALATED▼] [RESOLVED▼] │
│ Risk Filter: [ALL▼] [LOW▼] [MEDIUM▼] [HIGH▼] [CRITICAL▼]      │
├─────────────────────────────────────────────────────────┤
│ Report Stats: NEW: 45 | Under Review: 12 | Escalated: 8 │
├─────────────────────────────────────────────────────────┤
│ Report ID  │ Product       │ Location │ Risk   │ Status │
├────────────┼───────────────┼──────────┼────────┼────────┤
│ RPT-00145  │ Drug ABC      │ Lagos    │ HIGH   │ NEW    │
│ RPT-00144  │ Aspirin Pack  │ Ibadan   │ MEDIUM │ Review │
│ RPT-00143  │ Drug XYZ      │ Abuja    │ CRIT   │ Escal. │
└─────────────────────────────────────────────────────────┘
```

**Detail Page** (`/admin/reports/[id]`):

```
┌─────────────────────────────────────────────────────────┐
│ REPORT: RPT-00145                                        │
├─────────────────────────────────────────────────────────┤
│ Reporter: Anonymous User                                 │
│ Reported At: Jan 22, 10:30 AM                           │
│                                                          │
│ Product Details:                                         │
│ - Product: Drug ABC                                      │
│ - Product Code: ABCD-123456                             │
│ - Scan Type: MANUAL                                      │
│                                                          │
│ Incident Details:                                        │
│ - Reason: Looks fake                                     │
│ - Location: Lagos (6.5244°N, 3.3792°E)                 │
│ - Description: Packaging looks counterfeit, expired date │
│ - Photo: [View/Download]                                 │
│                                                          │
│ Risk Assessment:                                         │
│ - Risk Level: HIGH                                       │
│ - Frequency: 3 similar reports (same product, same area) │
│ - Recommendation: Escalate to case                       │
│                                                          │
│ Admin Actions:                                           │
│ - Status: NEW                                            │
│ - Reviewed By: —                                         │
│ - Linked Case: —                                         │
│                                                          │
│ [Review & Set Risk] [Link to Case] [Dismiss] [Escalate] │
└─────────────────────────────────────────────────────────┘
```

**Hotspots Page** (`/admin/reports/hotspots`):

```
Nigeria Counterfeit Radar - Geographic heatmap showing:
- Report density by location
- Size of hotspots = number of reports
- Color intensity = risk level (green→yellow→red)
- Click to drill down into location
```

**Data Endpoints**:

```typescript
GET /api/admin/reports?status=NEW&skip=0&take=50
GET /api/admin/reports/:id
GET /api/admin/reports/stats
GET /api/admin/reports/risk-breakdown
GET /api/admin/reports/hotspots
POST /api/admin/reports/:id/review
POST /api/admin/reports/:id/link-case
POST /api/admin/reports/:id/dismiss
```

**Components Needed**:

- ReportListTable
- ReportDetailCard
- RiskAssessmentCard
- HotspotMap
- ReviewModal
- LinkCaseModal

---

### 5. Case Management

**Path**: `/admin/cases`  
**Access**: MODERATOR+  
**Components**: Case list, detail page, notes, escalation

**List Page**:

```
┌─────────────────────────────────────────────────────────┐
│ CASE MANAGEMENT                                          │
├─────────────────────────────────────────────────────────┤
│ Status: [Open▼] [Under Review▼] [Escalated▼] [Closed▼]  │
│ Severity: [All▼] [Low▼] [Medium▼] [High▼] [Critical▼]   │
├─────────────────────────────────────────────────────────┤
│ Open: 23 | Under Review: 8 | Escalated: 3 | Closed: 156 │
├─────────────────────────────────────────────────────────┤
│ Case #         │ Title                │ Severity │ Status │
├────────────────┼──────────────────────┼──────────┼────────┤
│ CASE-2026-0001 │ Counterfeit Drug ABC │ CRITICAL │ Escal. │
│ CASE-2026-0002 │ Fake Aspirin Supply  │ HIGH     │ Review │
│ CASE-2026-0003 │ Wrong Packaging      │ MEDIUM   │ Open   │
└─────────────────────────────────────────────────────────┘
```

**Detail Page** (`/admin/cases/[id]`):

```
┌─────────────────────────────────────────────────────────┐
│ CASE: CASE-2026-0001                                     │
│ Status: [Open▼] → Under Review / Escalated / Closed     │
├─────────────────────────────────────────────────────────┤
│ Case Details:                                            │
│ - Title: Counterfeit Drug ABC                           │
│ - Severity: CRITICAL                                     │
│ - Created: Jan 20, 2026                                  │
│ - Assigned To: John Admin                                │
│                                                          │
│ Linked Reports: (3 total)                               │
│ • RPT-00145 (HIGH) - Looks fake, Lagos                  │
│ • RPT-00146 (HIGH) - Wrong packaging, Lagos             │
│ • RPT-00147 (MEDIUM) - Expired date, Ibadan             │
│                                                          │
│ AI Analysis:                                             │
│ - Risk Score: 94/100                                     │
│ - Confidence: 97%                                        │
│ - Recommendation: Escalate to NAFDAC                     │
│                                                          │
│ NAFDAC Status:                                           │
│ - Reported: Yes (Jan 21, 2026)                          │
│ - NAFDAC Case #: NAFDAC-2026-5432                       │
│ - Last Update: Under Investigation                       │
│                                                          │
│ ────────────────── CASE NOTES ──────────────────────    │
│ Jan 22, 11:00 - John: Confirmed counterfeit packaging   │
│ Jan 21, 14:30 - Jane: Escalated to NAFDAC               │
│ Jan 20, 09:00 - Bob: Created case from report           │
│                                                          │
│ [Add Note] [Change Status] [Escalate to NAFDAC] [Close] │
└─────────────────────────────────────────────────────────┘
```

**Data Endpoints**:

```typescript
GET /api/admin/cases?status=open&skip=0&take=50
POST /api/admin/cases
GET /api/admin/cases/:id
GET /api/admin/cases/stats
GET /api/admin/cases/search?q=query
POST /api/admin/cases/:id/status
POST /api/admin/cases/:id/notes
POST /api/admin/cases/:id/escalate-nafdac
```

**Components Needed**:

- CaseListTable
- CaseDetailCard
- CaseNotesSection
- LinkedReportsCard
- NAFDACStatusCard
- ChangeStatusModal
- AddNoteModal
- EscalateNAFDACModal

---

### 6. Audit Logs

**Path**: `/admin/audit`  
**Access**: SUPER_ADMIN only  
**Components**: Log table, filters, export

**Layout**:

```
┌─────────────────────────────────────────────────────────┐
│ AUDIT LOGS - IMMUTABLE RECORD                            │
├─────────────────────────────────────────────────────────┤
│ Admin: [All Admins▼]  | Action: [All▼]  | From: [Date]  │
│                                                          │
│ Export: [JSON] [CSV] [PDF]                              │
├─────────────────────────────────────────────────────────┤
│ Timestamp          │ Admin      │ Action         │ Resource │
├────────────────────┼────────────┼────────────────┼──────────┤
│ Jan 22, 11:45 AM   │ John Admin │ approve        │ Mfg-123  │
│ Jan 22, 11:30 AM   │ Jane Mod   │ create_case    │ Case-001 │
│ Jan 22, 11:15 AM   │ John Admin │ escalate_nafdac│ Case-001 │
│ Jan 22, 11:00 AM   │ Bob Analyst│ review_report  │ Rpt-145  │
└────────────────────┴────────────┴────────────────┴──────────┘

Click on log entry to see:
- Before State (JSON)
- After State (JSON)
- IP Address
- User Agent
```

**Data Endpoints**:

```typescript
GET /api/admin/audit-logs?skip=0&take=50&adminId=xxx&action=yyy
GET /api/admin/audit-logs/:resourceType/:resourceId
GET /api/admin/audit-logs/admin/:adminId
POST /api/admin/audit-logs/suspicious/:adminId
GET /api/admin/audit-logs/export
```

**Components Needed**:

- AuditLogTable
- FilterBar (admin, action, date range)
- LogDetailModal (shows before/after JSON)
- ExportButton

---

### 7. AI Oversight

**Path**: `/admin/oversight`  
**Access**: ANALYST+  
**Components**: Health metrics, anomaly detection, analysis

**Layout**:

```
┌─────────────────────────────────────────────────────────┐
│ AI SYSTEM OVERSIGHT                                      │
├─────────────────────────────────────────────────────────┤
│          AI HEALTH SCORE: 94/100 ✅                      │
│    ┌──────────────────────────────┐                      │
│    │ Overall Confidence: 96.5%    │                      │
│    │ False Positive Rate: 2.1%    │                      │
│    │ Model Accuracy: 97.3%        │                      │
│    └──────────────────────────────┘                      │
├─────────────────────────────────────────────────────────┤
│ ANOMALY DETECTION                                        │
│ • Abnormal Velocity: Lagos (2,400 verif/24h, +300%)     │
│ • Cross-Region Leakage: Product ABC seen in 5 states    │
│ • Confidence Drop: Model 2 dropped 8% (monitoring)       │
├─────────────────────────────────────────────────────────┤
│ MODEL PERFORMANCE                                        │
│ Model 1: 97.8% | Model 2: 94.2% | Model 3: 96.1%       │
├─────────────────────────────────────────────────────────┤
│ HISTORICAL ANALYSIS                                      │
│ [Line chart showing accuracy over last 30 days]          │
└─────────────────────────────────────────────────────────┘
```

**Data Endpoints**:

```typescript
GET /api/admin/dashboard/ai-health
GET /api/admin/dashboard/alerts
GET /api/admin/oversight (new endpoint - grouping anomalies)
```

**Components Needed**:

- HealthScoreCard
- AnomalyAlerts
- ModelPerformanceTable
- HistoricalChart

---

## Shared Components

### Sidebar Navigation

```
┌─────────────────┐
│ LUMORA ADMIN    │
├─────────────────┤
│ 👤 Admin User   │
├─────────────────┤
│ 📊 Dashboard    │
│ 🏭 Mfg Review   │
│ 📢 Reports      │
│ 📁 Cases        │
│ 📋 Audit Logs   │
│ 🤖 AI Oversight │
├─────────────────┤
│ ⚙️ Settings     │
│ 🚪 Logout       │
└─────────────────┘
```

### Role Guard Component

```typescript
<RoleGuard requiredRoles={["SUPER_ADMIN", "MODERATOR"]}>
  <SensitiveComponent />
</RoleGuard>
// Shows 403 page if user lacks permissions
```

### Pagination

```typescript
<Pagination
  currentPage={page}
  pageSize={50}
  total={1250}
  onPageChange={setPage}
/>
```

### Modal Pattern

```typescript
<Modal isOpen={isOpen} onClose={onClose} title="Approve Manufacturer">
  <form onSubmit={handleApprove}>
    <Input label="Trust Score" type="number" min={0} max={100} />
    <TextArea label="Notes" />
    <Button type="submit">Approve</Button>
  </form>
</Modal>
```

---

## State Management Strategy

### Global Admin Context

```typescript
interface AdminContextType {
  // Auth
  authToken: string | null;
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (tempToken, code) => Promise<void>;
  logout: () => Promise<void>;

  // Permissions
  hasRole: (role: string) => boolean;
  hasPermission: (action: string) => boolean;
}

// Usage
const { authToken, adminUser, hasRole } = useAdmin();
```

### Per-Page State (useReducer or useState)

- Filters (status, risk, date range)
- Pagination (page, pageSize)
- Sort (column, direction)
- Search query
- Modal state (isOpen, selectedItem)

---

## API Integration

### Admin API Client (`services/adminApi.ts`)

```typescript
export const adminApi = {
  // Auth
  auth: {
    loginStep1: (email, password) => POST /api/admin/auth/login/step1,
    loginStep2: (tempToken, code) => POST /api/admin/auth/login/step2,
    logout: () => POST /api/admin/auth/logout,
    getProfile: () => GET /api/admin/auth/profile,
  },

  // Dashboard
  dashboard: {
    getMetrics: (period) => GET /api/admin/dashboard/metrics,
    getAuthenticityBreakdown: () => GET /api/admin/dashboard/authenticity,
    getTrend: (days) => GET /api/admin/dashboard/trend,
    getHotspots: () => GET /api/admin/dashboard/hotspots,
    getHighRiskManufacturers: () => GET /api/admin/dashboard/high-risk-manufacturers,
    getAIHealth: () => GET /api/admin/dashboard/ai-health,
    getAlerts: () => GET /api/admin/dashboard/alerts,
  },

  // Manufacturers
  manufacturers: {
    getReviewQueue: (status) => GET /api/admin/manufacturers/review-queue,
    getReview: (id) => GET /api/admin/manufacturers/:id/review,
    approve: (id, trustScore, reason) => POST /api/admin/manufacturers/:id/approve,
    reject: (id, reason) => POST /api/admin/manufacturers/:id/reject,
    suspend: (id, reason) => POST /api/admin/manufacturers/:id/suspend,
  },

  // ... similar for reports, cases, audit logs
}
```

---

## Styling & Design System

### Colors

- Primary: Lumora brand color
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Neutral: Gray palette

### Typography

- H1: 32px bold (page title)
- H2: 24px bold (section title)
- H3: 20px semibold (card title)
- Body: 16px regular (content)
- Small: 14px regular (captions)

### Spacing

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Components

- Card: White background, subtle shadow
- Button: Primary/secondary variants
- Input: TailwindCSS styling with error states
- Table: Striped rows, sticky header
- Modal: Dark backdrop, centered, slide-in animation

---

## Testing Plan

### Unit Tests (Jest + React Testing Library)

- Login component with 2FA
- Modal components
- Filter/pagination logic
- Role guard functionality

### Integration Tests

- Full login flow (step 1 → step 2)
- Manufacturer approval workflow
- Case creation and status update
- Report linking to case

### E2E Tests (Cypress)

- Admin dashboard daily workflow
- Manufacturer review process
- Case escalation to NAFDAC
- Audit log filtering and export

---

## Development Workflow

### Day 1-2: Setup & Authentication

- [ ] Create admin layout
- [ ] Build login page (2-step 2FA)
- [ ] Setup admin context
- [ ] Admin middleware/guards

### Day 3: Dashboard

- [ ] Metrics cards
- [ ] Charts (Pie, Line)
- [ ] Hotspot map
- [ ] Alerts feed

### Day 4: Manufacturer & Reports

- [ ] Manufacturer review queue
- [ ] Review detail page
- [ ] Approval/rejection modals
- [ ] Report queue
- [ ] Report hotspots

### Day 5: Cases & Audit

- [ ] Case list
- [ ] Case detail with notes
- [ ] Escalation modal
- [ ] Audit log viewer
- [ ] Export functionality

### Day 6: Oversight & Polish

- [ ] AI oversight dashboard
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design

### Day 7: Testing & Deployment

- [ ] E2E testing
- [ ] Performance optimization
- [ ] Accessibility check
- [ ] Production build

---

## Performance Considerations

### Optimization Strategies

1. **Pagination**: Fetch 50 items per page (not all)
2. **Lazy Loading**: Load chart/map components on demand
3. **Caching**: Cache dashboard metrics (5-min TTL)
4. **Image Optimization**: Next.js Image component for photos
5. **Code Splitting**: Dynamic imports for heavy components

### Metrics to Monitor

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## Accessibility Requirements

- WCAG 2.1 AA compliance
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader support (semantic HTML)
- Color contrast ratios (4.5:1 for text)
- ARIA labels for icons/buttons
- Form error announcements

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] Authentication working
- [ ] 404 error page
- [ ] Loading states complete
- [ ] Error boundaries added
- [ ] Analytics integrated
- [ ] Sentry error tracking
- [ ] Security headers set
- [ ] CSP policy configured

---

_Admin Dashboard Frontend Plan_  
_Updated: January 22, 2026_
