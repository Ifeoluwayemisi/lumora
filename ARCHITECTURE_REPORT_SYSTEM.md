# Report System - Complete Data Architecture & Enhancement Plan

## 1. CURRENT STATE ANALYSIS

### Database Schema Review
```
UserReport Table:
├── reporterId (String, nullable) → User.id
├── reporterEmail (String, nullable) → User.email
├── productName (String, nullable) ← Currently null for old reports
├── productCode (String) ← Available for linking
├── scanType (MANUAL, QR)
├── location (String) ← Geographic location
├── latitude/longitude (Float)
├── reason (String) ← Report reason
├── description (String)
├── imagePath (String, nullable) ← Product photo
├── verificationId (String, nullable) → VerificationLog.id
├── productId (String, nullable) → Product.id
├── manufacturerId (String, nullable) → Manufacturer.id
├── status (NEW, UNDER_REVIEW, ESCALATED, RESOLVED, DISMISSED)
├── riskLevel (PENDING, LOW, MEDIUM, HIGH, CRITICAL)
├── reportedAt (DateTime)
└── adminNotes (String, nullable)

Linked Tables:
├── Code → codeValue (unique identifier)
├── Batch → batchId (product batch/lot number)
├── Manufacturer → manufacturerId
├── Product → productId
└── VerificationLog → verificationId
```

### Current Issues
1. **Missing Product Information**
   - productName is null for old reports
   - No batch/lot information captured
   - No way to identify actual Product record in system
   
2. **Incomplete Reporter Information**
   - reporterEmail might be null for anonymous reports
   - No phone number for follow-up
   - No way to verify if reporter is valid user
   - No authentication method (verified user vs anonymous)
   
3. **Insufficient Context for Linking**
   - productCode captured but not linked to Code record
   - No batch information to identify production run
   - Cannot determine if product is in system or fake
   - No manufacturer information in report despite having manufacturerId field
   
4. **Admin Contact Challenges**
   - Anonymous reports have no contact info
   - Can't verify reporter legitimacy
   - No mechanism to ask follow-up questions
   - No rating/reputation system for reporters

## 2. DATA ENRICHMENT STRATEGY

### A. Automatic Enrichment (Backend Lookup)
When a report is submitted with `productCode`:
```javascript
// Look up in Code table
Code → get batchId, manufacturerId, productId
   ↓
// Look up in Batch table
Batch → get drugId/productId, manufacturerInfo
   ↓
// Look up in Product table
Product → get productName, category, manufacturer
   ↓
// Auto-populate reporterUser info if authenticated
User → get name, phone, email, verified status
```

### B. Form Enhancement (Capture More Info)
**New Fields to Add:**
```
1. Product Information
   - Batch/Lot Number (if visible on packaging)
   - Product Photo (image upload)
   - Manufacturer Name (auto-filled or manual)
   - Expiration Date (if applicable)
   
2. Reporter Information (Optional for anonymous, Required for authenticated)
   - Full Name
   - Email (auto-filled if authenticated)
   - Phone Number (for follow-up)
   - Proof of Purchase (optional - receipt photo)
   
3. Purchase Information
   - Store Name/Location
   - Purchase Date
   - Price Paid
   - Quantity Purchased
   
4. Health Impact (for drugs/food)
   - Any adverse effects? (Yes/No)
   - Symptoms (if yes)
   - Medical attention sought? (Yes/No)
```

### C. Admin Dashboard Enhancements
**Report Detail View Should Show:**
```
1. Product Information
   ├── Product Name (from Code → Batch → Product lookup)
   ├── Product Code (with link to Code record)
   ├── Batch/Lot Number (with link to Batch record)
   ├── Manufacturer (with link to Manufacturer record)
   ├── Category (drugs, food, cosmetics, etc.)
   └── Product Image (if available)

2. Reporter Information
   ├── Reporter Name (or "Anonymous")
   ├── Email (with "Send Email" button)
   ├── Phone (with "Call" button if available)
   ├── Verified User Badge (if authenticated)
   ├── Reporter History (previous reports)
   └── Reporter Reputation Score

3. Report Details
   ├── Reason/Category
   ├── Full Description
   ├── Location (City, State, Country)
   ├── Coordinates (map view)
   ├── Photo Evidence
   └── Submission Time

4. Purchase Information
   ├── Store/Location Where Bought
   ├── Purchase Date
   ├── Price Paid
   └── Batch Info (if provided)

5. Linked Records
   ├── Similar Reports (same product code)
   ├── Verification Logs (attempts to verify this code)
   ├── Related Cases (linked cases)
   └── Manufacturer Info
```

## 3. IMPLEMENTATION ROADMAP

### Phase 1: Backend Enrichment (CRITICAL)
1. Enhance `getUserReportsPaginated()` to include JOINs:
   ```sql
   SELECT ur.*, 
          c.batchId, c.manufacturerId,
          b.productName, b.drugId,
          m.name as manufacturerName,
          u.name as reporterName, u.phone
   FROM UserReport ur
   LEFT JOIN Code c ON ur.productCode = c.codeValue
   LEFT JOIN Batch b ON c.batchId = b.id
   LEFT JOIN Manufacturer m ON c.manufacturerId = m.id
   LEFT JOIN User u ON ur.reporterId = u.id
   ```

2. Create migration script:
   ```javascript
   // For each UserReport:
   // IF productCode → lookup Code → get Batch → get productName
   // IF reporterId → lookup User → get name, phone
   // Update UserReport with missing info
   ```

### Phase 2: Form Enhancement
1. Add fields to report form:
   - Batch/Lot Number
   - Product photo upload
   - Batch expiration date
   - Store name where purchased
   - For authenticated users: Auto-fill name, email, phone
   - For anonymous: Optional contact info
   - For health issues: Symptom description

2. Server-side validation:
   - Require email for follow-up OR authenticated user
   - Validate phone format if provided
   - Require image for certain report types

### Phase 3: Admin Dashboard Improvements
1. Report detail modal shows all linked data
2. Contact buttons (Email, Phone) for follow-up
3. Quick links to:
   - Manufacturer profile
   - Batch details
   - Similar reports
   - Verification logs for this code
4. Reporter history sidebar
5. Action buttons:
   - Send follow-up email
   - Link to case
   - Mark product as counterfeit
   - Request more information

## 4. CONTACT STRATEGY FOR REPORTERS

### For Authenticated Users
- Email on file (required)
- Phone number (optional but requested)
- In-app notifications
- Easy "Contact Reporter" button

### For Anonymous Users
- Email is REQUIRED for follow-up
- Phone is optional but strongly encouraged
- Send validation email to verify address
- Use email as primary contact method

### For Health Issues
- Escalate to NAFDAC if symptoms reported
- Request additional medical documentation
- Offer to connect with health authorities

## 5. IMPLEMENTATION PRIORITY

**HIGH PRIORITY (Week 1):**
- [ ] Enhance userReportService.getUserReportsPaginated() with JOINs
- [ ] Create data enrichment migration script
- [ ] Update admin dashboard detail view with linked data
- [ ] Add email/phone contact fields to form

**MEDIUM PRIORITY (Week 2):**
- [ ] Add product photo upload
- [ ] Add batch/lot number field
- [ ] Add store name field
- [ ] Create email notification system for follow-ups
- [ ] Add reporter reputation tracking

**LOW PRIORITY (Week 3):**
- [ ] Advanced analytics on reports
- [ ] Reporter leaderboard/reputation
- [ ] Automated health alert system
- [ ] Report templates for different product categories
