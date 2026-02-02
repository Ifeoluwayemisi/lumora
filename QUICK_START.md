# Phase 2 & 3 Features - Quick Start Guide

## What Was Implemented

You now have three complete feature sets ready for deployment:

### 1. Product Photo Uploads 🖼️
Users can upload product photos with their reports. Photos are validated (5MB max, image type check), previewed before submission, and stored server-side.

**What you need to do:**
- [ ] Create `/backend/uploads/reports/` directory if it doesn't exist
- [ ] (Optional) Setup Multer middleware for advanced file handling
- [ ] Test: Try uploading an image in the report form

### 2. Email Notification System 📧
Automated emails sent to reporters and authorities:
- ✅ Confirmation email when report submitted
- ✅ Health alert escalation to NAFDAC if health impact reported
- ✅ Medical guidance in alerts

**What you need to do:**
- [ ] Add to `.env`:
  ```
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASS=your-app-password
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  NAFDAC_REPORT_EMAIL=report@nafdac.gov.ng
  ```
- [ ] Verify SMTP with: `GET /api/admin/verify-email`
- [ ] Test: Submit a report and check email

### 3. Reporter Reputation System ⭐
Tracks reporter reliability:
- Reports submitted & confirmed accurate
- Automatic score calculation (0-100)
- Trust levels: NEW → CONTRIBUTOR → ACTIVE → VERIFIED → TRUSTED

**Available endpoints:**
- `GET /api/reputation/leaderboard` - Top reporters
- `GET /api/reputation/reporter/:id` - Individual profile
- `GET /api/reputation/me` - Your profile (authenticated)

### 4. Advanced Analytics Dashboard 📊
Real-time insights with:
- 7 KPI cards (total, counterfeit %, resolution rate, etc.)
- Risk distribution pie chart
- Status distribution bar chart
- 30-day trends line chart
- Top manufacturers & products tables
- Counterfeit hotspots map data

**Access at:** `/admin/analytics`

## File Structure Added

```
backend/
├── src/
│   ├── services/
│   │   ├── reporterReputationService.js    [NEW] Reputation calculation
│   │   ├── emailTemplates.js                [NEW] Email templates
│   │   └── emailService.js                  [UPDATED] Email functions
│   ├── routes/
│   │   ├── reputationRoutes.js              [NEW] Reputation API
│   │   └── analyticsRoutes.js               [NEW] Analytics API
│   └── controllers/
│       └── reportController.js              [UPDATED] File upload
│
frontend/
├── app/
│   ├── report/
│   │   └── page.js                          [UPDATED] Image upload UI
│   └── admin/
│       └── analytics/
│           └── page.js                      [NEW] Analytics dashboard
│
└── IMPLEMENTATION_SUMMARY.md                [NEW] Complete guide
```

## How to Deploy

### Step 1: Verify Database Structure
Your UserReport model should have:
- `imagePath` (String) - for storing uploaded image paths
- `reporterId` (String) - linked to User model
- `riskLevel` - for reputation calculations
- `status` - for analytics resolution rate

### Step 2: Setup Environment Variables
Add to `.env` in backend root:
```env
# SMTP Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# NAFDAC Alert Email
NAFDAC_REPORT_EMAIL=counterfeits@nafdac.gov.ng

# File Upload Settings
UPLOAD_MAX_SIZE=5242880
```

### Step 3: Create Upload Directory
```bash
mkdir -p backend/uploads/reports
chmod 755 backend/uploads/reports
```

### Step 4: Test Email Configuration
```bash
curl -X POST http://localhost:4000/api/admin/verify-email
```

Expected response:
```json
{
  "success": true,
  "message": "Email configuration is valid"
}
```

### Step 5: Test Photo Upload
1. Go to `/report` page
2. Fill in report details
3. Click "Upload Product Image"
4. Select an image (< 5MB)
5. See preview
6. Submit form
7. Check that image was saved to `/uploads/reports/`

### Step 6: Test Reputation System
```bash
# Get all leaderboard
curl http://localhost:4000/api/reputation/leaderboard

# Get specific reporter (example ID)
curl http://localhost:4000/api/reputation/reporter/{reporterId}
```

### Step 7: Test Analytics Dashboard
1. Login as admin
2. Go to `/admin/analytics`
3. Verify all charts load with data

## API Reference

### Reputation Endpoints

**GET /api/reputation/leaderboard**
- Query: `limit=10` (optional)
- Returns: Array of top reporters with accuracy %, trust scores

**GET /api/reputation/reporter/:reporterId**
- Returns: Individual reporter's reputation profile

**GET /api/reputation/me**
- Requires: Authentication token
- Returns: Authenticated user's reputation

**POST /api/reputation/update/:reporterId**
- Requires: Authentication token + SUPER_ADMIN/MODERATOR role
- Body: `{ "accuracy": boolean }`
- Returns: Updated reputation

### Analytics Endpoints

**GET /api/analytics/dashboard**
- Returns: 8 KPI metrics

**GET /api/analytics/risk-distribution**
- Returns: Count & % of reports by risk level

**GET /api/analytics/status-distribution**
- Returns: Count & % of reports by status

**GET /api/analytics/hotspots**
- Query: `limit=10` (optional)
- Returns: Locations with high counterfeits

**GET /api/analytics/products**
- Query: `limit=15` (optional)
- Returns: Products ranked by counterfeit rate

**GET /api/analytics/manufacturers**
- Query: `limit=15` (optional)
- Returns: Manufacturers ranked by counterfeits

**GET /api/analytics/trends**
- Query: `days=30` (optional)
- Returns: Daily report counts over period

## Email Templates Included

1. **Report Received** (Green theme)
   - Confirms submission
   - Provides case reference
   - Explains next steps

2. **More Info Requested** (Yellow theme)
   - Lists info needed
   - Explains importance
   - Deadline

3. **Investigation Complete** (Red/Green dynamic)
   - Result: counterfeit or genuine
   - Actions taken
   - Next steps

4. **Health Alert Escalation** (Red theme - URGENT)
   - Medical guidance
   - NAFDAC escalation notification
   - Recommended actions

## Troubleshooting

**Images not uploading?**
- Check `/uploads/reports/` directory exists and is writable
- Verify file size < 5MB
- Check browser console for errors
- Ensure Content-Type: multipart/form-data in request

**Emails not sending?**
- Verify SMTP credentials in `.env`
- Run email verification: `GET /api/admin/verify-email`
- Check SMTP_HOST and SMTP_PORT
- For Gmail, use app-specific password, not account password
- Check email service logs

**Analytics dashboard blank?**
- Ensure you have reports in database
- Check admin authentication token
- Try GET /api/analytics/dashboard to see raw data
- Browser console for API errors

**Reputation showing zeros?**
- Ensure reports have `reporterId` field
- Check report status is set correctly
- Verify risk level assignments
- Run: `GET /api/reputation/reporter/{reporterId}`

## Performance Tips

1. **Cache Images**: Use CDN for report images
2. **Async Emails**: Consider queue system (Bull/RabbitMQ) for high volume
3. **Analytics Caching**: Cache dashboard data for 1-5 minutes
4. **Database Indexes**: Add indexes on `reporterId`, `riskLevel`, `status`

## Security Checklist

- [ ] Image upload validates file type (not just extension)
- [ ] Images stored outside web root (not in /public)
- [ ] NAFDAC email not exposed in frontend
- [ ] Analytics endpoints require admin role
- [ ] Reputation system prevents gaming (based on accuracy, not volume)
- [ ] File upload limits enforced (5MB max)

## Next Phase Ideas

1. **Batching**: Combine similar reports
2. **ML Predictions**: AI-powered risk assessment
3. **Map View**: Visual hotspot map with Mapbox
4. **Webhooks**: Third-party integrations (Slack, Discord)
5. **Export Reports**: PDF/CSV report generation
6. **Reporter Stats**: Personal dashboard for reporters
7. **Alerts**: Real-time alerts for critical counterfeits

---

**Questions?** Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for detailed architecture docs.
