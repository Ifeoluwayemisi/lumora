# Render Logs Debugging Guide

This guide shows you what to look for in Render console logs to diagnose the QR code and file download issues.

## 🎯 What to Check

After redeploying, navigate to your Render dashboard and view the **Backend Logs** to see detailed debugging information.

---

## 1. QR Code Generation Logs

### Expected Output (Success)

```
[QR_GENERATOR] Working directory: /opt/render/project/src/backend
[QR_GENERATOR] QR output directory: /opt/render/project/src/backend/uploads/qrcodes
[QR_GENERATOR] Generating QR code for: LUM-JS8FMW
[QR_GENERATOR] Full file path: /opt/render/project/src/backend/uploads/qrcodes/LUM-JS8FMW.png
[QR_GENERATOR] QR file saved successfully
[QR_GENERATOR] Returning relative path: /uploads/qrcodes/LUM-JS8FMW.png
[QR_GENERATOR] File verified - Size: 1234 bytes
```

### What This Tells You

- ✅ QR file is being saved to the correct directory
- ✅ Generator returns **relative path** (not absolute)
- ✅ File exists after creation (verified by size)

### If You See This Error

```
[QR_GENERATOR] ERROR: File not found after creation: /opt/render/project/src/backend/uploads/qrcodes/LUM-JS8FMW.png
```

**Problem**: File system permission issue or directory not writable

---

## 2. Batch Detail API Logs

### Expected Output (Success)

```
[GET_BATCH_DETAIL] Request - Batch ID: batch-12345 User ID: user-67890
[GET_BATCH_DETAIL] Manufacturer ID: mfr-11111
[GET_BATCH_DETAIL] Sample QR paths from database:
  - LUM-ABC123: /uploads/qrcodes/LUM-ABC123.png
  - LUM-DEF456: /uploads/qrcodes/LUM-DEF456.png
  - LUM-GHI789: /uploads/qrcodes/LUM-GHI789.png
[GET_BATCH_DETAIL] Response ready - Sending 50 codes
```

### What This Tells You

- ✅ Batch found and authenticated
- ✅ QR paths in database are **relative** (start with `/uploads`)
- ✅ Not the absolute path like `/opt/render/project/src/backend/uploads/...`

### If You See This

```
[GET_BATCH_DETAIL] Sample QR paths from database:
  - LUM-ABC123: /opt/render/project/src/backend/uploads/qrcodes/LUM-ABC123.png
```

**Problem**: Database has **absolute paths** instead of relative paths - the QR generator was saving absolute paths

---

## 3. CSV Download Logs

### Expected Output (Success)

```
[DOWNLOAD_BATCH_CODES] Request - Batch ID: batch-12345 User ID: user-67890
[DOWNLOAD_BATCH_CODES] Manufacturer ID: mfr-11111
[DOWNLOAD_BATCH_CODES] CSV generated - Size: 2048 bytes
[DOWNLOAD_BATCH_CODES] Codes included: 50
[DOWNLOAD_BATCH_CODES] Headers set:
  Content-Type: text/csv; charset=utf-8
  Content-Disposition: attachment; filename="batch_batch-12345_codes.csv"
[DOWNLOAD_BATCH_CODES] CSV sent successfully
```

### What This Tells You

- ✅ CSV file generated correctly
- ✅ Headers are set to `text/csv` (not `application/json`)
- ✅ File sent to browser with correct filename

### If You See This (Problem)

```
[DOWNLOAD_BATCH_CODES] Headers set:
  Content-Type: application/json
  Content-Disposition: attachment; filename="batch_batch-12345_codes.csv"
```

**Problem**: Response headers were not cleared, JSON header is being sent instead of CSV

---

## 4. Frontend Browser Console Logs

### Expected Sequence for QR Display

**When batch loads:**

```
[BATCH_FETCH] Starting fetch for batch: batch-12345
[BATCH_FETCH] Total codes: 50
[BATCH_FETCH] Sample codes from API:
  - Code: LUM-ABC123
    QR Path: /uploads/qrcodes/LUM-ABC123.png
    Type: string
    Is relative: true
```

**When user opens QR modal:**

```
[QR_MODAL_OPEN] Code: LUM-ABC123
[QR_MODAL_OPEN] Raw path from DB: /uploads/qrcodes/LUM-ABC123.png
[QR_MODAL_OPEN] Is absolute path: false
[QR_MODAL_OPEN] Final URL to use: https://lumoraorg.onrender.com/uploads/qrcodes/LUM-ABC123.png
[QR_IMAGE_SUCCESS] QR loaded successfully
[QR_IMAGE_SUCCESS] URL: https://lumoraorg.onrender.com/uploads/qrcodes/LUM-ABC123.png
[QR_IMAGE_SUCCESS] Code: LUM-ABC123
```

### If You See This (Problem)

```
[QR_MODAL_OPEN] Raw path from DB: /opt/render/project/src/backend/uploads/qrcodes/LUM-ABC123.png
[QR_MODAL_OPEN] Is absolute path: true
[QR_MODAL_OPEN] Extracted relative path: /uploads/qrcodes/LUM-ABC123.png
[QR_IMAGE_ERROR] Failed to load from: https://lumoraorg.onrender.com/uploads/qrcodes/LUM-ABC123.png
```

**Problem**: Database has absolute paths, we're extracting the relative part, but the file still doesn't exist or isn't being served

---

## 5. File Download Logs

### Expected Output (CSV Download)

```
[DOWNLOAD_CSV] Starting CSV download for batch: batch-12345
[DOWNLOAD_CSV] Response received:
  Content-Type: text/csv; charset=utf-8
  Response status: 200
  Blob size: 2048 bytes
  Blob type: text/csv
[DOWNLOAD_CSV] File download triggered
```

### Expected Output (PDF Download Fallback)

```
[DOWNLOAD_PDF] Starting PDF download for batch: batch-12345
[DOWNLOAD_PDF] Error: 404
[DOWNLOAD_CSV] Starting CSV download for batch: batch-12345
[DOWNLOAD_CSV] File download triggered
```

---

## Troubleshooting Checklist

| Issue                     | Logs to Check                                                      | Solution                                        |
| ------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| QR shows placeholder      | `[QR_GENERATOR]`, `[GET_BATCH_DETAIL]`, `[QR_IMAGE_ERROR]`         | Regenerate codes or check file path issue       |
| CSV downloads as JSON     | `[DOWNLOAD_BATCH_CODES]` headers, browser network tab              | Headers not being set correctly                 |
| QR path has absolute path | `[GET_BATCH_DETAIL] Sample QR paths`                               | Run database migration or regenerate all codes  |
| File not found 404        | `[QR_GENERATOR] File verified`, check `/uploads/qrcodes` directory | Directory doesn't exist or no write permissions |

---

## How to View Logs

1. **Render Dashboard → Backend Service → Logs**
2. **Filter by timestamp** to see only recent requests
3. **Search for `[QR_` or `[DOWNLOAD_` or `[BATCH_`** to find relevant logs
4. **Copy relevant log sections** and share with support

---

## Expected File Paths

### Backend File System

```
/opt/render/project/src/backend/
└── uploads/
    └── qrcodes/
        ├── LUM-ABC123.png
        ├── LUM-DEF456.png
        └── ...
```

### Database Storage (qrImagePath column)

```
/uploads/qrcodes/LUM-ABC123.png  ✅ CORRECT (relative)
/opt/render/project/src/backend/uploads/qrcodes/LUM-ABC123.png  ❌ WRONG (absolute)
```

### Frontend URL (what browser requests)

```
https://lumoraorg.onrender.com/uploads/qrcodes/LUM-ABC123.png  ✅ CORRECT
https://lumoraorg.onrender.com/api/uploads/qrcodes/LUM-ABC123.png  ❌ WRONG (has /api)
```

---

## Next Steps After Checking Logs

1. **If QR paths are absolute** → Need to run a database migration to update all paths
2. **If headers are wrong** → Clear response headers in download endpoint (already fixed in code)
3. **If files don't exist** → Regenerate new batch codes
4. **If everything looks correct** → Check Network tab in browser DevTools for actual HTTP request/response
