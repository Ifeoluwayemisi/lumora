# Dashboard 500 Error Diagnosis Guide

## Problem Summary

The manufacturer dashboard endpoint (`/api/manufacturer/dashboard`) is returning HTTP 500 errors in production.

**Browser Error:**

```
GET https://lumoraorg.onrender.com/api/manufacturer/dashboard 500 (Internal Server Error)
```

## Chrome Console Noise (IGNORE THESE)

The following errors in your console are **NOT related to your application** and can be safely ignored:

1. **Chrome Extension Warnings**

   ```
   Denying load of <URL>. Resources must be listed in the web_accessible_resources manifest key
   GET chrome-extension://invalid/ net::ERR_FAILED
   ```

   - These come from browser extensions (React DevTools, translation tools, etc.)
   - They don't affect your app functionality

2. **React DevTools Suggestion**
   ```
   Download the React DevTools for a better development experience
   ```

   - This is just a helpful suggestion, not an error

## Actual Problem

The **real issue** is the 500 error from the dashboard endpoint, which means the backend is crashing when trying to fetch dashboard data.

## Solution: Enhanced Logging

I've added comprehensive logging to help diagnose the issue:

### 1. Request ID Tracking

Every request now gets a unique ID for tracing:

```
[DASHBOARD-a1b2c3] Request started at 2026-01-19T10:30:00.000Z
[DASHBOARD-a1b2c3] Manufacturer ID: user-123
[DASHBOARD-a1b2c3] Fetching manufacturer record...
[DASHBOARD-a1b2c3] Manufacturer found: Acme Corp
[DASHBOARD-a1b2c3] Total products: 5
[DASHBOARD-a1b2c3] Request completed successfully in 245ms
```

### 2. Detailed Error Logging

If an error occurs, logs show exactly where:

```json
{
  "error": "Column 'field' does not exist",
  "code": "P2015",
  "requestId": "a1b2c3",
  "step": "fetchingManufacturer | queryingProducts | buildingResponse",
  "timestamp": "2026-01-19T10:30:00.000Z"
}
```

### 3. Diagnostic Endpoints

#### Health Check

```bash
curl https://lumoraorg.onrender.com/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2026-01-19T10:30:00.000Z",
  "environment": "production",
  "uptime": 3600
}
```

#### Full Diagnostics

```bash
curl https://lumoraorg.onrender.com/health/diagnostics
```

Response:

```json
{
  "status": "running",
  "timestamp": "2026-01-19T10:30:00.000Z",
  "environment": "production",
  "uptime": 3600,
  "memory": { "heapUsed": 50331648, "external": 1234567 },
  "nodeVersion": "v22.18.0",
  "frontendUrl": "https://lumora.vercel.app",
  "database": "Connected"
}
```

## How to Debug Production Errors

### Step 1: Check Backend Logs

1. Go to Render dashboard: https://dashboard.render.com
2. Find the "lumora-backend" service
3. Click "Logs" tab
4. Search for error patterns:
   ```
   [DASHBOARD-*] Error
   [ERROR-*]
   ```

### Step 2: Capture Request ID

When you see a 500 error in the frontend:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Find the dashboard request
4. Look at the response JSON for `"requestId": "a1b2c3"`
5. Use this ID to search logs in Render

### Step 3: Common Error Codes

| Error                             | Cause                 | Solution                 |
| --------------------------------- | --------------------- | ------------------------ |
| `P2015`                           | Column doesn't exist  | Migration hasn't run yet |
| `P2025`                           | Record not found      | Check database data      |
| `PrismaClientInitializationError` | Can't connect to DB   | Check DATABASE_URL       |
| `TypeError`                       | Null/undefined access | Check object structure   |

### Step 4: Check Database Connection

If you suspect database issues:

1. **Test from Render logs:**
   - Look for: `prisma:query SELECT 1`
   - If present and successful → database is connected

2. **Verify in schema:**
   - Check [prisma/schema.prisma](./backend/prisma/schema.prisma)
   - Ensure all fields referenced in code exist in schema

## Local Testing

Run locally to reproduce the error:

```bash
cd backend
npm run dev
```

Then:

```bash
# Test health
curl http://localhost:5000/health

# Test dashboard (replace TOKEN with real JWT)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/manufacturer/dashboard

# Watch console for detailed logs
```

## Response Format

### Success Response (200)

```json
{
  "manufacturer": {
    "id": "mfr_123",
    "name": "Acme Corp",
    "plan": "BASIC",
    "verified": true
  },
  "stats": {
    "totalProducts": 15,
    "totalCodes": 1250,
    "totalBatches": 8,
    "totalVerifications": 3400,
    "suspiciousAttempts": 2
  },
  "quota": {
    "used": 45,
    "limit": 50,
    "remaining": 5
  },
  "recentAlerts": [],
  "plan": {
    "name": "Basic",
    "type": "basic",
    "dailyCodeLimit": 50
  }
}
```

### Error Response (500)

```json
{
  "error": "Failed to fetch dashboard",
  "message": "Column 'suspicious_pattern_count' does not exist",
  "requestId": "a1b2c3",
  "details": {
    "code": "P2015",
    "meta": {
      "column": "suspicious_pattern_count"
    }
  }
}
```

## Checklist for Debugging

- [ ] Check Render logs for `[DASHBOARD-*] Error` messages
- [ ] Verify database migrations are up-to-date
- [ ] Confirm `DATABASE_URL` environment variable is set correctly
- [ ] Check if Prisma schema matches actual database columns
- [ ] Look for `prisma:query SELECT 1` in logs (indicates DB connection works)
- [ ] Test `/health/diagnostics` endpoint
- [ ] Compare error code with table above
- [ ] Reproduce locally with same data

## Next Steps

1. **Deploy this change** to production (already done with commit `7a57bf3`)
2. **Trigger error** in production by loading dashboard
3. **Capture request ID** from error response
4. **Search Render logs** using that request ID
5. **Find root cause** in detailed error logs
6. **Fix** the specific issue
7. **Redeploy** and verify

## Files Modified

- `backend/src/controllers/manufacturerController.js` - Added detailed logging
- `backend/src/app.js` - Enhanced error handler and diagnostics endpoints
- `backend/src/middleware/requestLogger.js` - New request logging middleware

---

**Last Updated:** 2026-01-19  
**Commit:** `7a57bf3` (feat: Add comprehensive logging for dashboard error debugging)
