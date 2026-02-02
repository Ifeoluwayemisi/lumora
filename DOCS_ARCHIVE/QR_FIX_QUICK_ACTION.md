# IMMEDIATE ACTION REQUIRED - Fix QR Paths in Database

## The Issue

Your database has **old QR code paths** from before the fix:

```
❌ /opt/render/project/src/backend/uploads/qrcodes/LUM-JS8FMW.png
✅ /uploads/qrcodes/LUM-JS8FMW.png
```

This is why QR codes show 404 errors.

## Quick Fix (Choose One)

### 🚀 Option 1: Use Admin API (Fastest)

1. Get your admin token (from login response or dashboard)
2. Run this command:

```bash
curl -X POST https://lumoraorg.onrender.com/api/admin/system/fix-qr-paths \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected response:**

```json
{
  "success": true,
  "message": "Fixed QR paths: 13 updated, 0 errors",
  "fixed": 13,
  "errors": 0
}
```

### ✅ What It Does

1. Finds all codes with absolute paths (e.g., starting with `/opt/render/...`)
2. Converts them to relative paths (e.g., `/uploads/qrcodes/...`)
3. Updates the database
4. Reports how many codes were fixed

### 🔍 How to Verify It Worked

After running the fix:

1. **Check Batch Detail Page**
   - Go to a batch
   - Open browser DevTools → Console
   - Look for log: `[GET_BATCH_DETAIL] Sample QR paths from database:`
   - Should show: `/uploads/qrcodes/LUM-JS8FMW.png` ✅

2. **Test QR Display**
   - Click "View QR" button on any code
   - QR image should display
   - No 404 error in console

3. **Test PDF Download**
   - Click "Download as PDF"
   - Open downloaded PDF
   - Should have actual QR codes (not placeholder text)

## Success Indicators

After fix, you should see in browser console:

```
[GET_BATCH_DETAIL] Sample QR paths from database:
  - LUM-JS8FMW: /uploads/qrcodes/LUM-JS8FMW.png ✅
  - LUM-6SZNCS: /uploads/qrcodes/LUM-6SZNCS.png ✅
```

And in Render logs:

```
[GET] /uploads/qrcodes/LUM-JS8FMW.png - 200 ✅
```

## If You Don't Have Admin Token

1. Log in as admin to your Lumora dashboard
2. Open DevTools → Application → Cookies
3. Find token from localStorage or session
4. Use in the curl command above

OR ask for the migration to be run during the next deployment.

## After Fix

- ✅ QR codes display correctly
- ✅ PDFs embed actual QR images
- ✅ CSV downloads work
- ✅ New codes created have correct paths automatically

---

**Timeline**: Should take < 1 minute to run and fix all codes!
