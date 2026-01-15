# Manufacturer Features - Complete Implementation Guide

## Overview

This document details all manufacturer features implemented in Lumora, the anti-counterfeit verification platform. The system enables manufacturers to manage products, generate verification codes, and track product authenticity.

---

## 1. Authentication & Onboarding

### Two-Step Signup Flow
- **Location**: `/auth/register/select-role`
- **Features**:
  - Beautiful role intent picker with visual cards
  - Green card for Consumer, Blue card for Manufacturer
  - Smooth animations and hover effects
  - Redirects to role-specific registration form

### Manufacturer Registration
- **Location**: `/auth/register?role=manufacturer`
- **Fields**:
  - Email (auto-filled from intent picker)
  - Password
  - Company Name (required)
  - Country (required)
  - Phone Number (optional)
- **Backend**: `/auth/signup` with manufacturer-specific validation
- **Account Status**: "pending_verification" initially
- **Plan**: "BASIC" by default (50 codes/day limit)

---

## 2. Dashboard

### Manufacturer Dashboard Overview
- **Location**: `/dashboard/manufacturer`
- **Features**:
  - Account Status Badge (Verified ✓, Pending ⏳, Rejected ✗)
  - Pending Verification Alert with document upload link
  - **Statistics Cards**:
    - Total Products
    - Total Batches
    - Codes Generated (total)
    - Total Verifications
    - Suspicious Attempts
  - **Daily Quota Progress Bar** (color-coded: green < 50%, yellow 50-80%, red > 80%)
  - **Plan Information** with upgrade CTA
  - **Quick Action Buttons**:
    - Generate Codes
    - Manage Products
    - View Analytics (placeholder)
  - **Recent Alerts Section** with severity levels

### Quota System
- **BASIC Plan**: 50 codes/day
- **PREMIUM Plan**: 1000 codes/day
- **Reset**: Midnight UTC daily
- **Display**: Real-time quota remaining, percentage used
- **API**: `/manufacturer/dashboard` returns `quota: {used, limit, remaining}`

---

## 3. Products Management

### Products List Page
- **Location**: `/dashboard/manufacturer/products`
- **Features**:
  - Desktop: Responsive table with 6 columns
    - Product Name
    - Category
    - Code Count
    - Batch Count
    - Created Date
    - Actions (Edit, Delete)
  - Mobile: Card-based grid view
  - **Search**: By product name or description
  - **Filter**: By category (Electronics, Pharmaceuticals, Beverages, Fashion, Cosmetics, Other)
  - **Pagination**: 10 items per page
  - **Create Product Modal**: Name, Description, Category, SKU Prefix
  - **Edit Product Modal**: Disabled if codes already generated
  - **Delete Confirmation**: Warning if codes/batches exist

### Backend Product Endpoints

#### GET `/manufacturer/products`
- **Query Parameters**: `page`, `limit`, `search`, `category`
- **Response**: Paginated product list with code/batch counts
- **Auth**: Required (MANUFACTURER role)

#### POST `/manufacturer/products`
- **Body**: `{name, description, category, skuPrefix}`
- **Validation**: 
  - name: required, max 255 chars
  - description: max 1000 chars
  - Category: from predefined list
- **Business Rules**: Only verified manufacturers can create
- **Response**: Created product object

#### GET `/manufacturer/products/:id`
- **Response**: Single product with associated batches and code count
- **Validation**: Ownership check

#### PATCH `/manufacturer/products/:id`
- **Body**: `{name, description, category, skuPrefix}`
- **Business Rule**: Cannot edit if codes already generated
- **Response**: Updated product

#### DELETE `/manufacturer/products/:id`
- **Business Rules**: 
  - Cannot delete if codes generated
  - Cannot delete if batches exist
  - Returns 409 error with specific reason
- **Response**: Success message

---

## 4. Batch & Code Generation

### Batches Management Page
- **Location**: `/dashboard/manufacturer/batches`
- **Features**:
  - **Quota Display**:
    - Remaining quota for today
    - Percentage used
    - "Run low" warning if < 10 remaining
    - "Exhausted" alert if 0 remaining
  - **Generate Batch Modal**:
    - Product selector (shows existing code count)
    - Production Date (optional, defaults to today)
    - Expiration Date (required, must be future)
    - Quantity (1-10,000, respects quota)
    - Real-time quota validation
  - **Batches Table**:
    - Product name
    - Code count
    - Expiration date
    - Created date
    - View & Download buttons
  - **CSV Download**: Per batch, includes all codes

### Batch Detail Page
- **Location**: `/dashboard/manufacturer/batch/:id`
- **Features**:
  - Batch info card (product, total codes, expiration, created date)
  - **Code Status Statistics** (Unused, Verified, Flagged, Blacklisted)
  - **Code Search & Filter**:
    - Search by code value
    - Filter by status
  - **Codes Table**:
    - Code value (monospace)
    - Status badge (color-coded)
    - Created date
    - Copy to clipboard button
  - **CSV Download Button**
  - **Info Box**: Tips for code management

### Backend Batch Endpoints

#### POST `/manufacturer/batch`
- **Body**: `{productId, productionDate, expiryDate, quantity}`
- **Quota Enforcement**:
  - Queries codes generated today
  - Checks plan limit (50 BASIC, 1000 PREMIUM)
  - Returns 429 if quota exceeded with `{used, limit, remaining}`
- **Validation**:
  - Product exists and belongs to manufacturer
  - Expiry date is in future
  - Quantity between 1-10,000
  - Manufacturer is verified
- **Response**: `{batch, codesGenerated, quota}`

#### GET `/manufacturer/batches`
- **Query Parameters**: `page`, `limit`, `productId`
- **Response**: Paginated batch list with code counts
- **Auth**: Required

#### GET `/manufacturer/batch/:id`
- **Response**: Batch detail with all codes
  ```json
  {
    "batch": {
      "id": "...",
      "productId": "...",
      "product": {...},
      "quantity": 100,
      "codes": [{code, status, createdAt}, ...],
      "productionDate": "...",
      "expirationDate": "...",
      "createdAt": "..."
    }
  }
  ```

#### GET `/manufacturer/batch/:id/download`
- **Response**: CSV file with columns:
  - Code
  - Status
  - Created Date
  - Product
  - Batch ID
  - Expiration Date
- **Download**: Triggered in browser as attachment

---

## 5. Code Management & Verification History

### Codes & Verification Page
- **Location**: `/dashboard/manufacturer/codes`
- **Features**:
  - **Statistics**:
    - Total codes
    - Verified codes
    - Suspicious activity count
  - **Search & Filter**:
    - Search codes by value
    - Filter by product
  - **Verification Log Table**:
    - Code value (truncated)
    - Verification status badge
    - Verified date & time
    - Location (lat/long with Google Maps link)
  - **Status Badges**:
    - ✓ Verified (green)
    - ⚠️ Suspicious Pattern (red)
    - 🔄 Code Already Used (yellow)
  - **Pagination**: 50 items per page

### Backend Verification History

#### GET `/manufacturer/history`
- **Query Parameters**: `page`, `limit`, `productId`, `batchId`, `from`, `to`
- **Response**: Verification log entries ordered by most recent
- **Fields**: 
  - id, code, verificationState, latitude, longitude, createdAt
- **Auth**: Required

---

## 6. Manufacturer Profile & Verification

### Profile Page
- **Location**: `/dashboard/manufacturer/profile`
- **Features**:
  - **Company Information Form**:
    - Company Name
    - Email Address
    - Phone Number
    - Country
    - Official Website URL
    - Save button with validation
  - **Account Status Card**:
    - Verification Status (Verified, Pending, Rejected)
    - Trust Score (0-100%) with visual progress bar
    - Risk Level (Low, Medium, High) with color coding
  - **Verification Documents Section**:
    - CAC/Business Registration (required)
    - Trademark Certificate (required)
    - NAFDAC/FDA Approval (required)
    - Factory License (required)
    - Official Website URL (required)
    - Distribution Contracts (optional)
    - Authorization Letters (optional)
    - File upload buttons for each document
  - **Support Info**: Contact support link

### Document Upload (Placeholder)
- **Backend Ready**: Routes and functions for document upload
- **Frontend**: Upload buttons for all required documents
- **Validation**: Will verify document types and sizes
- **Status**: Pending, Approved, Rejected

---

## 7. Navigation & Sidebar

### Manufacturer Sidebar Menu
- Dashboard
- Products
- Batches
- Codes (Verification History)
- Profile

### Dashboard Quick Actions
- Generate Codes → `/dashboard/manufacturer/batches`
- Manage Products → `/dashboard/manufacturer/products`
- View Analytics → (Placeholder)

---

## 8. API Response Formats

### Dashboard Response
```json
{
  "manufacturer": {
    "id": "...",
    "name": "...",
    "email": "...",
    "verified": true,
    "accountStatus": "verified",
    "trustScore": 85,
    "riskLevel": "LOW",
    "plan": "PREMIUM"
  },
  "stats": {
    "totalProducts": 5,
    "totalBatches": 12,
    "totalCodes": 500,
    "totalVerifications": 450,
    "suspiciousAttempts": 2
  },
  "quota": {
    "used": 450,
    "limit": 1000,
    "remaining": 550
  },
  "recentAlerts": [
    {
      "id": "...",
      "title": "Suspicious Pattern Detected",
      "message": "...",
      "severity": "high",
      "timestamp": "..."
    }
  ],
  "plan": {
    "name": "Premium",
    "type": "premium",
    "dailyCodeLimit": 1000
  }
}
```

### Batch Creation Response
```json
{
  "batch": {
    "id": "...",
    "productId": "...",
    "quantity": 100,
    "productionDate": "...",
    "expirationDate": "...",
    "createdAt": "..."
  },
  "codesGenerated": 100,
  "quota": {
    "limit": 1000,
    "used": 550,
    "remaining": 450,
    "requestedQuantity": 100
  }
}
```

---

## 9. Business Rules & Constraints

### Product Management
- ✓ Only verified manufacturers can create products
- ✓ Cannot edit product if codes already generated
- ✓ Cannot delete product with existing codes
- ✓ Cannot delete product with existing batches
- ✓ Product names max 255 characters
- ✓ Description max 1000 characters

### Code Generation
- ✓ Only verified manufacturers can generate codes
- ✓ BASIC plan: 50 codes/day limit
- ✓ PREMIUM plan: 1000 codes/day limit
- ✓ Daily quota resets at midnight UTC
- ✓ Quantity: 1-10,000 per batch
- ✓ Expiration date must be in future

### Quota System
- ✓ Enforced at batch creation
- ✓ Returns 429 error if quota exceeded
- ✓ Error includes remaining quota info
- ✓ Quota info returned in all batch responses

### Account Status
- ✓ pending_verification: Cannot generate codes
- ✓ verified: Full access to all features
- ✓ rejected: Account disabled, contact support

---

## 10. Error Handling

### Validation Errors
- Missing required fields: 400
- Invalid data format: 400
- Product not found: 404
- Access denied (ownership): 403

### Business Rule Violations
- Quota exceeded: 429 with quota details
- Cannot edit/delete locked product: 409
- Unverified manufacturer: 403

### Server Errors
- Database errors: 500
- Service unavailable: 503

### Error Response Format
```json
{
  "error": "Short error title",
  "message": "Detailed user-friendly message",
  "quota": {...}  // Included for quota-related errors
}
```

---

## 11. Frontend Components & Pages

### Key Files
- **Layout**: `/app/dashboard/manufacturer/` (shared layout)
- **Pages**:
  - `page.js` - Dashboard overview
  - `products/page.js` - Products CRUD
  - `batches/page.js` - Batch management & generation
  - `batch/[id]/page.js` - Batch detail with codes
  - `codes/page.js` - Verification history
  - `profile/page.js` - Company info & documents

### Components
- `DashboardSidebar.js` - Manufacturer navigation
- `DashboardNav.js` - Top navigation (shared)

### Styling
- Tailwind CSS
- Dark mode support
- Responsive design (mobile-first)
- Animations and transitions

---

## 12. Backend Files

### Key Endpoints
- **File**: `/src/routes/manufacturerRoutes.js`
- **Controller**: `/src/controllers/manufacturerController.js`
- **Service**: `/src/services/manufacturerService.js`

### Functions
- `getDashboard()` - Dashboard overview
- `getProducts()` - Product list with filters
- `getProduct()` - Single product detail
- `addProduct()` - Create product
- `updateProduct()` - Edit product
- `deleteProduct()` - Delete product
- `addBatch()` - Create batch with quota enforcement
- `getBatches()` - Batch list with pagination
- `getBatchDetail()` - Batch detail with codes
- `downloadBatchCodes()` - CSV export
- `getManufacturerHistory()` - Verification logs

---

## 13. Security Features

### Authentication
- JWT-based authentication
- Role-based middleware (MANUFACTURER role required)
- All routes protected

### Authorization
- Ownership checks on all operations
- Manufacturer can only access their own products/batches/codes
- Verified status validation for sensitive operations

### Data Protection
- Query parameters validated
- Request body validation
- SQL injection prevention (Prisma ORM)

---

## 14. Next Steps & Future Enhancements

### In Progress
- Document upload functionality
- QR code generation per code
- PDF export functionality

### Planned Features
- Analytics dashboard with charts
- Batch status tracking (archived, active, expired)
- Bulk operations (delete multiple products)
- Email notifications for verification alerts
- API keys for programmatic access
- Webhook support for verification events
- Advanced reporting
- NAFDAC integration for approval workflow

### Admin Features Needed
- Manufacturer verification approval panel
- Document review interface
- Trust score adjustment
- Risk level management
- Batch size limits
- Plan management

---

## 15. Testing Scenarios

### Happy Path
1. ✓ Sign up as manufacturer
2. ✓ Create product
3. ✓ Generate batch of codes
4. ✓ Download codes as CSV
5. ✓ View batch details
6. ✓ Search codes by status

### Edge Cases
- [ ] Generate codes exceeding daily quota
- [ ] Try to edit product with existing codes
- [ ] Try to delete product with batches
- [ ] Unverified manufacturer tries to generate codes
- [ ] Invalid expiration date (past date)
- [ ] Zero or negative quantity

### Error Handling
- [ ] Network timeout during batch creation
- [ ] File download fails
- [ ] Search with special characters
- [ ] Pagination edge cases

---

## 16. Deployment Status

### Frontend
- Deployed: Vercel (https://lumora-x91f.vercel.app)
- Framework: Next.js 16.0.10
- Build: Turbopack
- Status: ✓ Live

### Backend
- Deployed: Render (https://lumoraorg.onrender.com)
- Framework: Node.js + Express
- Database: PostgreSQL (Prisma)
- Status: ✓ Live

### Database
- Provider: Prisma at db.prisma.io
- Type: PostgreSQL
- Status: ✓ Connected

---

## 17. Documentation References

- **API Docs**: See `API_ENDPOINTS.md`
- **Backend Implementation**: See `BACKEND_IMPLEMENTATION.md`
- **Database Schema**: See `prisma/schema.prisma`
- **Production Guide**: See `PRODUCTION_DEPLOYMENT_GUIDE.md`

---

## 18. Support & Maintenance

### Issues & Debugging
- Check browser console for frontend errors
- Check backend logs on Render dashboard
- Check database connection in Prisma Studio

### Performance
- Products pagination: 10 items/page
- Batch codes pagination: 50 items/page
- Verification history: 20 items/page
- Database queries optimized with Prisma `include`

### Monitoring
- Monitor daily quota resets
- Track trust score calculations
- Alert on suspicious pattern detection

---

**Last Updated**: Session 4 - Batch Management & Code Generation
**Status**: ✓ Complete - Ready for deployment
