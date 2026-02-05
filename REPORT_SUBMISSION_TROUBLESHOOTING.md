# Report Submission Troubleshooting Guide

## Errors You're Seeing

### Error 1: "Location not available"
This is actually expected behavior if:
- User hasn't granted location permission
- Browser doesn't support Geolocation API
- User is behind a proxy or firewall blocking geolocation

**Solution:** Location is OPTIONAL. You can still submit reports without it.

### Error 2: "Error in submitting report"
This indicates a backend error. The actual error message should appear in:
1. Browser console (press F12 → Console tab)
2. Backend logs

---

## Step-by-Step Troubleshooting

### 1. Check Browser Console
```
F12 → Console Tab
```

Look for messages like:
- `📍 Location response: {latitude: null, longitude: null}` - Location denied/unavailable
- `POST http://localhost:5000/api/reports/submit 400` - Bad request (missing fields)
- `POST http://localhost:5000/api/reports/submit 500` - Server error

**Action:** Screenshot the full error message

### 2. Verify Backend is Running
```bash
curl http://localhost:5000/api
```

Expected response:
```json
{
  "message": "Welcome to Lumora API",
  "version": "1.0.0",
  "status": "operational"
}
```

If this fails, start the backend:
```bash
cd backend
npm run dev
```

### 3. Check Required Fields
The report form requires:
- ✅ **Product Code** - Required (codeValue)
- ✅ **Report Type** - Required (reportType: "counterfeit" or "unregistered")
- ✅ **Description** - Required (description: 10+ characters recommended)

Optional fields:
- Product Name
- Location (auto-captured, but you can override)
- Purchase Date
- Purchase Location
- Contact Email/Phone
- Reporter Name
- Batch Number
- Health Impact

**Action:** Ensure you fill in all required fields

### 4. Test API Endpoint Directly
```bash
curl -X POST http://localhost:5000/api/reports/submit \
  -H "Content-Type: application/json" \
  -d '{
    "codeValue": "TEST123",
    "reportType": "counterfeit",
    "description": "Product appears to be counterfeit based on packaging",
    "contact": "reporter@example.com",
    "reporterName": "John Doe"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "report": {
    "id": "...",
    "codeValue": "TEST123",
    "status": "new"
  }
}
```

### 5. Check Backend Logs
```bash
# In backend terminal, you should see:
[REPORT] Image saved: /uploads/reports/uuid-timestamp.jpg  (if image uploaded)
[REPORT] Email send failed: ... (if email service has issues)
```

---

## Common Issues & Solutions

### Issue: "Failed to submit report. Please try again."
**Causes:**
1. Backend not running
2. Wrong API URL (check NEXT_PUBLIC_API_URL in .env.local)
3. Missing required fields

**Fix:**
```bash
# Check API is running
curl http://localhost:5000/api

# Check frontend .env.local
cat frontend/.env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Issue: "Code value, report type, and description are required"
**Cause:** One or more required fields are empty

**Fix:**
- Product Code: Enter a product code (e.g., "123456789")
- Report Type: Select from dropdown
- Description: Enter at least a few words

### Issue: Location shows "not available"
**This is normal!** Possible causes:
1. User denied location permission
2. HTTPS not available (some browsers require HTTPS for geolocation)
3. Browser doesn't support Geolocation API
4. Network timeout when reverse geocoding

**Fix:**
- Click "Allow" if browser asks for location permission
- Location is optional - report can be submitted without it
- Manually enter location in "Purchase Location" field

### Issue: Image not uploading
**Causes:**
1. File larger than 5MB
2. File is not an image (check file type)
3. Multer middleware not installed

**Fix:**
```bash
# Check file size
ls -lh image.jpg  # Should be < 5MB

# Check file type
file image.jpg  # Should show "image/jpeg"

# Install multer if missing
cd backend
npm install multer
```

### Issue: Email not sending
**This feature requires SMTP configuration.** Check backend .env:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
NAFDAC_REPORT_EMAIL=report@nafdac.gov.ng
```

Without proper SMTP config, emails will fail silently but reports still submit.

**Fix:**
```bash
# Test SMTP configuration
curl -X POST http://localhost:5000/api/admin/verify-email

# For Gmail:
# 1. Enable 2FA on account
# 2. Generate app-specific password
# 3. Use app password in EMAIL_PASS
```

---

## Debug Mode

### Enable Detailed Logging

**Frontend (.env.local):**
```env
NEXT_PUBLIC_DEBUG=true
```

**Backend (.env):**
```env
NODE_ENV=development
LOG_LEVEL=debug
```

Then you'll see in console/logs:
```
📍 Location response: {...}
[REPORT] Creating report with data: {...}
[REPORT] Image upload: ...
[REPORT] Email trigger: ...
```

---

## Testing Checklist

Use this to verify report submission works:

### ✅ Basic Form Submission (No Image)
```javascript
// Minimal valid request
{
  "codeValue": "TEST123",
  "reportType": "counterfeit",
  "description": "Test report"
}
```

### ✅ Form Submission With Location
```javascript
{
  "codeValue": "TEST123",
  "reportType": "counterfeit",
  "description": "Test report",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "location": "Lagos, Nigeria"
}
```

### ✅ Form Submission With Contact Info
```javascript
{
  "codeValue": "TEST123",
  "reportType": "counterfeit",
  "description": "Test report",
  "contact": "reporter@email.com",
  "reporterName": "John Doe",
  "reporterPhone": "+234801234567"
}
```

### ✅ Form Submission With Health Impact
```javascript
{
  "codeValue": "TEST123",
  "reportType": "counterfeit",
  "description": "Test report",
  "healthImpact": "yes",
  "healthSymptoms": "Nausea, headache"
}
```

### ✅ Form Submission With Image (Using FormData)
```javascript
const formData = new FormData();
formData.append("codeValue", "TEST123");
formData.append("reportType", "counterfeit");
formData.append("description", "Test report");
formData.append("image", file); // File object from input

await fetch("http://localhost:5000/api/reports/submit", {
  method: "POST",
  body: formData
});
```

---

## Data Flow Diagram

```
User fills form
        ↓
Click "Submit Report"
        ↓
Frontend validates (required fields)
        ↓
If image: Create FormData, else: JSON body
        ↓
POST to /api/reports/submit
        ↓
[Multer] Process file upload (if present)
        ↓
[reportController] Extract form data
        ↓
Validate required fields (codeValue, reportType, description)
        ↓
Save image to /uploads/reports/ (if present)
        ↓
Create report + userReport in database
        ↓
Send confirmation email (if contact provided)
        ↓
Send health alert emails (if healthImpact != "no")
        ↓
Return success response
        ↓
Frontend shows success message
        ↓
Redirect to /verify page
```

---

## Quick Fixes

### Issue: "Location not available" + "Error in submitting report"
Try these in order:

1. **Check browser console for actual error:**
   ```
   F12 → Console → Look for red errors
   ```

2. **Grant location permission:**
   - Refresh page
   - Click "Allow" when browser asks for location
   - If no prompt, location is blocked - skip this

3. **Fill in all required fields:**
   - Product Code: Required
   - Report Type: Required (select from dropdown)
   - Description: Required (minimum 10 words recommended)

4. **Test with minimal data:**
   ```
   Code: TEST-001
   Type: Counterfeit
   Description: Testing the report system
   Click Submit
   ```

5. **Check backend logs:**
   ```bash
   # In backend terminal
   npm run dev
   # Look for [REPORT] logs
   ```

---

## Getting Help

When reporting the issue, provide:

1. **Browser console screenshot** (F12 → Console)
2. **Backend log output** (from `npm run dev`)
3. **What you're trying to submit:**
   - Product code used
   - Report type
   - Whether you have location permission allowed
   - File size if uploading image

4. **Test result from:**
   ```bash
   curl http://localhost:5000/api
   ```

---

## Related Documentation

- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) - Setup guide
- [QUICK_START.md](../QUICK_START.md) - Feature overview
- [PHASE_2_3_COMPLETE.md](../PHASE_2_3_COMPLETE.md) - Architecture details
