# Quick Debugging Checklist - Dashboard 500 Error

## Problem

```
❌ GET https://lumoraorg.onrender.com/api/manufacturer/dashboard 500 (Internal Server Error)
```

## What Those Chrome Errors MEAN

| Error                                                  | Source             | Impact                 | Action          |
| ------------------------------------------------------ | ------------------ | ---------------------- | --------------- |
| `chrome-extension://invalid/`                          | Browser extension  | NONE - harmless        | ✅ Ignore       |
| `Resources must be listed in web_accessible_resources` | Browser extension  | NONE - harmless        | ✅ Ignore       |
| `Download React DevTools`                              | Browser suggestion | NONE - just a tip      | ✅ Ignore       |
| **`GET /api/manufacturer/dashboard 500`**              | **Your backend**   | **YES - REAL PROBLEM** | ⚠️ **FIX THIS** |

---

## Action Plan

### 1️⃣ Wait for Redeploy (2-5 minutes)

Render is auto-deploying the logging changes. Wait for the deployment to complete.

**Check Render status:**
https://dashboard.render.com → lumora-backend → Logs

---

### 2️⃣ Trigger the Error

1. Open https://lumora.vercel.app/dashboard
2. You'll see the 500 error (or it might now work!)
3. **Open DevTools** (F12) → Network tab
4. Find the `/api/manufacturer/dashboard` request
5. Click on it and look at the Response
6. **Copy the `requestId` value**

---

### 3️⃣ Find the Root Cause in Logs

**Option A: Search by Request ID** (Recommended)

```bash
# Go to Render Logs
# Search for: DASHBOARD-[requestId]
# Example: DASHBOARD-a1b2c3
```

**Option B: Search by Error**

```bash
# Search for: "Database error"
# Search for: "P2015"
# Search for: "Column does not exist"
```

---

### 4️⃣ Common Error Codes

```
P2015 → Column doesn't exist in database
P2025 → Record not found (wrong ID)
ECONNREFUSED → Can't connect to database
ENOMEM → Out of memory
ENOENT → Missing file/env variable
```

---

### 5️⃣ Most Likely Cause

🎯 **Most probable issue:**

```
Database schema mismatch
↓
Code references a column that doesn't exist
↓
Need to run Prisma migration in production
```

**Check:**

- Is the schema up-to-date? Check `backend/prisma/schema.prisma`
- Have all migrations been run? Check `backend/prisma/migrations/`
- Are environment variables set correctly in Render?

---

## Test Health Endpoints

```bash
# Backend alive?
curl https://lumoraorg.onrender.com/health

# Full diagnostics
curl https://lumoraorg.onrender.com/health/diagnostics
```

Expected: JSON response, no errors

---

## Decision Tree

```
┌─ Is dashboard loading OK?
│  ├─ YES → Problem solved! ✅
│  └─ NO → 500 error
│     ├─ Get requestId from error response
│     ├─ Search Render logs for: DASHBOARD-[requestId]
│     ├─ Read the error code:
│     │  ├─ P2015 → Schema mismatch → Run migration
│     │  ├─ ECONNREFUSED → DB connection → Check DATABASE_URL
│     │  └─ Other → Follow stack trace
│     └─ Fix → Redeploy → Test
```

---

## If You Can't Find the Error

1. **Check Render build logs** (not runtime logs)
   - Might have failed during build

2. **Check environment variables**
   - Click "Environment" on Render service
   - Verify DATABASE_URL is set
   - Verify JWT_SECRET is set

3. **Check database is running**
   - Test with: `curl https://lumoraorg.onrender.com/health/diagnostics`
   - Look for database status

4. **Check Prisma is initialized**
   - Look for: `✓ Prisma client verified` in logs
   - If missing, Prisma generation failed

---

## Advanced: Manual Log Search

In Render, use these search patterns:

```
[ERROR] → All errors
[DASHBOARD] → Dashboard endpoint errors
[REQ-] → All requests (with timing)
[RES-] → All responses
P2015 → Database schema errors
ECONNREFUSED → Connection errors
stack: → Errors with stack traces
```

---

## Emergency Fix (if no time)

1. Check if it worked before → Maybe a recent commit broke it
2. Revert last few commits in `backend/`
3. Push and redeploy
4. If it works, debug what broke
5. If it still fails → Database issue, needs migration

---

## Success Indicators ✅

- [ ] Dashboard loads without 500 error
- [ ] Data displays (products, codes, stats)
- [ ] No JavaScript console errors (about _your_ app)
- [ ] `/health` endpoint responds with JSON
- [ ] `/health/diagnostics` shows database: "Connected"
- [ ] Logs show completion without [ERROR]

---

## Files to Review

```
backend/
├── src/
│   ├── controllers/manufacturerController.js  ← getDashboard() function
│   ├── app.js                                 ← Error handler
│   └── middleware/
│       └── requestLogger.js                   ← Request logging (NEW)
├── prisma/
│   ├── schema.prisma                          ← Database schema
│   └── migrations/                            ← Must be applied in prod
└── .env                                       ← Check DATABASE_URL
```

---

## Last Resort: Contact Render Support

If logs show nothing and /health works:

1. Get full logs from Render
2. Go to render.com/support
3. Provide: Render service name, logs, error code
4. They can restart service if it hung

---

**Status:** Logging deployed, waiting for root cause identification  
**Timeline:** Should take 5-10 minutes to diagnose  
**Next:** Load dashboard → Get requestId → Search logs → Fix → Deploy
