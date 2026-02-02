# QR Path Fix - Database Migration Guide

## Problem Identified

The database contains **old QR code records with absolute file paths** instead of relative URL paths:

```
Database stores:  /opt/render/project/src/backend/uploads/qrcodes/LUM-JS8FMW.png
Should be:        /uploads/qrcodes/LUM-JS8FMW.png
```

This causes:

- ❌ QR files return 404 when requested from frontend
- ❌ Frontend can't display QR codes
- ❌ PDF generation can't find images

## Root Cause

Old code creation logic was storing absolute file system paths. While the QR generator now returns relative paths, existing codes in the database still have old absolute paths.

## Solution

Created a database migration utility to fix all existing absolute paths to relative paths.

### New Files

1. **`backend/src/utils/fixQRPaths.js`** - Migration utility
   - Finds all codes with absolute paths
   - Converts them to relative paths
   - Logs all changes

2. **Admin API Endpoint** - `POST /api/admin/system/fix-qr-paths`
   - Requires admin authentication
   - Triggers the migration
   - Returns count of fixed codes

## How to Run the Fix

### Option 1: Via API (Recommended for Production)

```bash
curl -X POST https://lumoraorg.onrender.com/api/admin/system/fix-qr-paths \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Response:

```json
{
  "success": true,
  "message": "Fixed QR paths: 123 updated, 0 errors",
  "fixed": 123,
  "errors": 0
}
```

### Option 2: Via Node Script (Local/SSH)

```bash
# SSH into server and run:
node -e "import('./src/utils/fixQRPaths.js').then(m => m.fixQRPathsInDatabase())"
```

### Option 3: Add to Server Startup (Auto-fix)

You can add this to `backend/src/server.js` to auto-fix on startup:

```javascript
import { fixQRPathsInDatabase } from "./utils/fixQRPaths.js";

async function ensureQRPathsFixed() {
  try {
    console.log("🔄 Checking QR paths in database...");
    const result = await fixQRPathsInDatabase();
    if (result.fixed > 0) {
      console.log(`✓ Fixed ${result.fixed} QR paths`);
    }
  } catch (error) {
    console.warn("⚠️  Could not auto-fix QR paths:", error.message);
  }
}

// Call during startup
ensureQRPathsFixed();
```

## What Gets Fixed

### Before Migration

```
Code Value: LUM-JS8FMW
QR Path:    /opt/render/project/src/backend/uploads/qrcodes/LUM-JS8FMW.png  ❌
```

### After Migration

```
Code Value: LUM-JS8FMW
QR Path:    /uploads/qrcodes/LUM-JS8FMW.png  ✅
```

## Steps to Deploy

1. **Deploy Latest Code**

   ```bash
   git pull origin main
   # Redeploy on Render
   ```

2. **Run Migration** (one of the three options above)
   - Monitor logs for: `[FIX_QR_PATHS] Updated ... codes`
   - Check response for success

3. **Verify Fix**
   - Go to batch detail page
   - Check browser console for logs
   - Should see: `[GET_BATCH_DETAIL] Sample QR paths from database:`
   - Paths should now be relative: `/uploads/qrcodes/...` ✅

4. **Test QR Display**
   - Click "View QR" on any code
   - QR image should display without 404
   - Click "Download PDF"
   - PDF should include embedded QR images

## Monitoring

After running the migration, check logs for:

### Success Indicators ✅

```
[FIX_QR_PATHS] Starting database path migration...
[FIX_QR_PATHS] Found 123 codes with absolute paths
[FIX_QR_PATHS] Updated LUM-JS8FMW: /uploads/qrcodes/LUM-JS8FMW.png
[FIX_QR_PATHS] Migration complete - Fixed: 123, Errors: 0
```

### Error Indicators ❌

```
[FIX_QR_PATHS] Found 0 codes with absolute paths  (No old codes - already fixed or new data)
[ADMIN_FIX_QR] Error: ...  (Database error - check connectivity)
```

## After Migration

Once migration is complete:

- ✅ All QR paths in database are relative
- ✅ Frontend can find and display QR images
- ✅ PDF generation can embed actual QR codes
- ✅ New codes created use relative paths (fixed in qrGenerator.js)

## Files Changed

| File                                         | Change                       |
| -------------------------------------------- | ---------------------------- |
| `backend/src/utils/fixQRPaths.js`            | New migration utility        |
| `backend/src/controllers/adminController.js` | Added fixQRPaths endpoint    |
| `backend/src/routes/adminRoutes.js`          | Added route for fix endpoint |

## Technical Details

The migration:

1. Queries all codes with `qrImagePath` containing `/opt/render/`
2. For each code, extracts the `/uploads/...` part
3. Updates the code record with the relative path
4. Logs all changes with code values
5. Returns count of updated codes and any errors

---

**Note**: This is a one-time migration. New codes created after the fixes will automatically have relative paths.
