# Phase 2 & 3 Features - Deployment Checklist

## Overview
You've successfully implemented:
- ✅ Product photo uploads (Phase 2)
- ✅ Email notification system (Phase 2)
- ✅ Reporter reputation tracking (Phase 3)
- ✅ Advanced analytics dashboard (Phase 3)

All code is complete and ready to deploy. Follow this checklist to activate the features.

---

## Pre-Deployment Setup

### 1. Backend Configuration

- [ ] **Create uploads directory**
  ```bash
  mkdir -p backend/uploads/reports
  chmod 755 backend/uploads/reports
  ```

- [ ] **Update .env file**
  ```env
  # Email/SMTP Configuration (Required for email features)
  EMAIL_USER=your-email@gmail.com          # Gmail or SMTP provider
  EMAIL_PASS=your-app-password             # Use app-specific password for Gmail
  SMTP_HOST=smtp.gmail.com                 # Or your SMTP server
  SMTP_PORT=587                            # Standard SMTP port

  # NAFDAC Configuration (Required for health alerts)
  NAFDAC_REPORT_EMAIL=counterfeits@nafdac.gov.ng

  # File Upload Configuration (Optional)
  UPLOAD_MAX_SIZE=5242880                  # 5MB in bytes
  UPLOAD_TYPES=image/jpeg,image/png,image/webp
  ```

### 2. Database Verification

Ensure these fields exist in your `UserReport` schema:

```prisma
model UserReport {
  id              String      @id @default(cuid())
  
  // ... existing fields ...
  
  // New fields for Phase 2 & 3
  imagePath       String?     @db.Text      // Photo upload feature
  reporterId      String?                   // Reputation tracking
  riskLevel       String      @default("UNKNOWN")  // Analytics
  
  // ... rest of model ...
}
```

If `imagePath` doesn't exist, add it:
```bash
# Generate migration
npx prisma migrate dev --name add_image_path

# Apply to database
npx prisma db push
```

### 3. Frontend Dependencies

Ensure these are installed in `package.json`:
```json
{
  "dependencies": {
    "react-icons": "^4.11.0",
    "recharts": "^2.10.0",
    "react-toastify": "^9.1.0"
  }
}
```

Install if missing:
```bash
npm install react-icons recharts react-toastify
```

---

## Feature Activation Steps

### Phase 2A: Product Photo Uploads

**Files Involved:**
- `frontend/app/report/page.js` - Photo upload form
- `backend/src/controllers/reportController.js` - File handling
- `backend/src/app.js` - Static file serving

**Status:** ✅ Code Complete

**Activation:**
1. [ ] Verify `/uploads` directory is served by Express
2. [ ] Test upload by submitting form with image
3. [ ] Verify file appears in `/backend/uploads/reports/`
4. [ ] Check `imagePath` is saved in database

**Test Steps:**
```bash
# 1. Start backend server
npm run dev

# 2. Submit report with image via frontend at http://localhost:3000/report

# 3. Check file was created
ls -la backend/uploads/reports/

# 4. Verify database entry
psql -c "SELECT id, imagePath FROM UserReport WHERE imagePath IS NOT NULL LIMIT 1;"
```

---

### Phase 2B: Email Notification System

**Files Involved:**
- `backend/src/services/emailService.js` - Email sending
- `backend/src/services/emailTemplates.js` - HTML templates
- `backend/src/controllers/reportController.js` - Email triggers

**Status:** ✅ Code Complete (needs SMTP config)

**Activation:**
1. [ ] Set EMAIL_USER, EMAIL_PASS, SMTP_HOST, SMTP_PORT in .env
2. [ ] Test SMTP connection
3. [ ] Verify templates load correctly
4. [ ] Enable email triggers in reportController

**Test Steps:**
```bash
# 1. Verify SMTP configuration
curl -X POST http://localhost:4000/api/admin/verify-email

# Expected response:
# {
#   "success": true,
#   "message": "Email configuration is valid"
# }

# 2. Submit a report and check inbox
# - Should receive "Report Received" email within 30 seconds

# 3. Submit report with healthImpact != "no"
# - Should receive health alert email
# - Should see NAFDAC escalation in logs
```

**Troubleshooting:**
- Gmail users: Use [app-specific password](https://myaccount.google.com/apppasswords), not account password
- Check email service logs: `tail -f logs/email.log`
- Verify SMTP credentials are correct: `curl -v smtp://USER:PASS@smtp.gmail.com:587`

---

### Phase 3A: Reporter Reputation System

**Files Involved:**
- `backend/src/services/reporterReputationService.js` - Reputation calculation
- `backend/src/routes/reputationRoutes.js` - API endpoints
- `backend/src/app.js` - Route registration

**Status:** ✅ Code Complete

**Activation:**
1. [ ] Ensure `reporterId` is set when creating reports
2. [ ] Test reputation endpoints
3. [ ] Verify calculations with sample data

**API Endpoints:**
```bash
# 1. Get leaderboard (top 10 reporters)
curl http://localhost:4000/api/reputation/leaderboard

# 2. Get specific reporter's reputation
curl http://localhost:4000/api/reputation/reporter/{reporterId}

# 3. Get authenticated user's reputation (requires auth token)
curl -H "Authorization: Bearer {token}" \
  http://localhost:4000/api/reputation/me

# 4. Update reporter reputation (admin only)
curl -X POST http://localhost:4000/api/reputation/update/{reporterId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin-token}" \
  -d '{"accuracy": true}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reporterId": "user-123",
    "totalReports": 15,
    "confirmedCounterfeits": 12,
    "accuracy": 80,
    "trustScore": 78,
    "level": "VERIFIED"
  }
}
```

---

### Phase 3B: Advanced Analytics Dashboard

**Files Involved:**
- `backend/src/routes/analyticsRoutes.js` - Analytics endpoints
- `frontend/app/admin/analytics/page.js` - Dashboard UI
- `backend/src/app.js` - Route registration

**Status:** ✅ Code Complete

**Activation:**
1. [ ] Navigate to `/admin/analytics` as admin user
2. [ ] Verify all 7 KPI cards display values
3. [ ] Verify charts populate with data

**Dashboard Components:**
- KPI Cards: Total reports, counterfeit %, resolution %, pending, reporters, manufacturers, health alerts
- Risk Distribution Pie Chart
- Status Distribution Bar Chart
- 30-Day Trends Line Chart
- Top Manufacturers Bar Chart
- Counterfeit Products Table
- Counterfeit Hotspots Table

**API Endpoints:**
```bash
# Dashboard overview (7 KPI metrics)
curl -H "Authorization: Bearer {token}" \
  http://localhost:4000/api/analytics/dashboard

# Risk level distribution
curl -H "Authorization: Bearer {token}" \
  http://localhost:4000/api/analytics/risk-distribution

# Status distribution
curl -H "Authorization: Bearer {token}" \
  http://localhost:4000/api/analytics/status-distribution

# Counterfeit hotspots (top 10)
curl -H "Authorization: Bearer {token}" \
  http://localhost:4000/api/analytics/hotspots?limit=10

# Counterfeit products (top 15)
curl -H "Authorization: Bearer {token}" \
  http://localhost:4000/api/analytics/products?limit=15

# Manufacturer rankings
curl -H "Authorization: Bearer {token}" \
  http://localhost:4000/api/analytics/manufacturers?limit=15

# 30-day trends
curl -H "Authorization: Bearer {token}" \
  http://localhost:4000/api/analytics/trends?days=30
```

---

## Verification Checklist

### After Setup
- [ ] Backend server starts without errors
- [ ] `/uploads/reports/` directory exists and is writable
- [ ] Email verification passes
- [ ] Analytics dashboard loads without errors
- [ ] Admin can access `/admin/analytics`

### After First Report Submission
- [ ] Photo uploads without errors
- [ ] Confirmation email arrives in inbox
- [ ] If health impact selected, health alert email received
- [ ] Image file exists in `/uploads/reports/`
- [ ] `imagePath` in database points to correct file

### After Sufficient Report Data
- [ ] Reputation leaderboard shows top reporters
- [ ] Analytics dashboard shows data in all charts
- [ ] Risk distribution totals 100%
- [ ] Hotspots show correct latitude/longitude
- [ ] Trends show data for selected date range

---

## Troubleshooting Guide

### Photos Not Uploading
```bash
# Check directory permissions
ls -ld backend/uploads/reports/
# Should show: drwxr-xr-x (755)

# Check directory exists
mkdir -p backend/uploads/reports
chmod 755 backend/uploads/reports

# Check Express serves uploads
curl http://localhost:4000/uploads/reports/
# Should show 401 Unauthorized or directory listing
```

### Emails Not Sending
```bash
# Test SMTP connection
npm run test:email
# OR manually verify
curl -X POST http://localhost:4000/api/admin/verify-email

# Check email logs
grep -i "email\|mail\|smtp" logs/*.log

# Verify .env variables
grep -i "email\|smtp" .env
```

### Analytics Shows No Data
```bash
# Verify reports exist in database
psql -c "SELECT COUNT(*) FROM UserReport;"

# Check if reports have required fields
psql -c "SELECT id, riskLevel, status FROM UserReport LIMIT 5;"

# Test analytics endpoint directly
curl -H "Authorization: Bearer {token}" \
  http://localhost:4000/api/analytics/dashboard
```

### Reputation Shows Zeros
```bash
# Verify reports have reporterId
psql -c "SELECT COUNT(*) FROM UserReport WHERE reporterId IS NOT NULL;"

# Check reputation calculation for specific reporter
curl http://localhost:4000/api/reputation/reporter/{reporterId}

# Verify user has submitted reports
psql -c "SELECT * FROM UserReport WHERE reporterId = '{reporterId}';"
```

---

## Performance Optimization

### Recommended After Deployment

1. **Add Database Indexes**
   ```sql
   CREATE INDEX idx_user_report_reporter ON UserReport(reporterId);
   CREATE INDEX idx_user_report_risk ON UserReport(riskLevel);
   CREATE INDEX idx_user_report_status ON UserReport(status);
   CREATE INDEX idx_user_report_date ON UserReport(reportedAt);
   ```

2. **Enable Image Compression**
   - Add image optimization middleware
   - Consider CDN for serving images

3. **Cache Analytics**
   - Cache dashboard data for 5-15 minutes
   - Implement Redis for caching

4. **Async Email**
   - Consider Bull queue for high-volume emails
   - Prevent blocking on SMTP timeout

---

## Rollback Plan

If you need to disable features:

### Disable Photo Uploads
1. Comment out image upload form in `frontend/app/report/page.js`
2. Comment out file handling in `backend/src/controllers/reportController.js`
3. Restart backend

### Disable Emails
1. Set `EMAIL_USER=""` in .env to disable
2. EmailService will skip sending automatically
3. No code changes needed

### Disable Reputation
1. Comment out reputation routes in `app.js`
2. Remove reputation service calls from controllers
3. Restart backend

### Disable Analytics
1. Comment out analytics routes in `app.js`
2. Remove `/admin/analytics` page from navigation
3. Restart backend

---

## Support Resources

- **IMPLEMENTATION_SUMMARY.md** - Architecture and system design
- **QUICK_START.md** - Feature overview and testing
- **ARCHITECTURE_REPORT_SYSTEM.md** - Data flow diagrams
- **Code Comments** - Detailed inline documentation in each service

---

## Next Steps

1. ✅ Complete setup checklist above
2. ✅ Test each feature following verification steps
3. ✅ Monitor email logs and error rates
4. ✅ Gather feedback from admin users
5. ⏭️ Consider Phase 4 features (webhooks, ML predictions, API)

---

**Need help?** Contact development team with the specific error message and follow this checklist. All code is documented and ready for production deployment.
