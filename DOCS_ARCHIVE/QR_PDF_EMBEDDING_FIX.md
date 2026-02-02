# QR Code Display & PDF Embedding Fix - Session 7 Update

## Problem Summary

QR codes were not displaying anywhere:

- ❌ QR images return 404 when accessed from frontend
- ❌ PDF downloads show placeholder "(QR Code)" text instead of actual images
- ❌ Console shows: `[QR_IMAGE_ERROR] Failed to load from: https://lumoraorg.onrender.com/uploads/qrcodes/LUM-JS8FMW.png`

## Root Cause Analysis

### Issue 1: File Path Resolution

The QR generator and static file serving were using different path resolution methods:

- **QR Generator**: Used `process.cwd()` which could point to project root, not backend directory
- **Static Middleware**: Used `__dirname` but the generator didn't match

**Impact**: QR files were created in one location but served from another, causing 404 errors

### Issue 2: PDF Generation Not Embedding QR Images

The PDF generator had placeholder text "(QR Code)" instead of actually embedding the generated QR PNG files.

**Impact**: Downloaded PDFs showed text instead of actual scannable QR codes

## Solutions Implemented

### Fix 1: Standardize Path Resolution ✅

**File**: `backend/src/utils/qrGenerator.js`

Changed from:

```javascript
const dir = path.join(process.cwd(), "uploads/qrcodes");
```

To:

```javascript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, "../../uploads/qrcodes");
```

**Why**: Using `__dirname` guarantees correct path relative to the actual file location, not the process working directory.

### Fix 2: Embed Actual QR Images in PDF ✅

**File**: `backend/src/utils/pdfGenerator.js`

**Changes**:

1. Added `fileURLToPath` import for consistent path resolution
2. Updated `drawCodeBox()` to be async and accept `pdfDoc` parameter
3. Implemented actual QR image embedding:

```javascript
async function drawCodeBox(page, code, x, y, width, height, pdfDoc) {
  // ... existing code ...

  // Try to embed actual QR code image
  const qrFilePath = path.join(__dirname, "../../uploads/qrcodes", `${code.codeValue}.png`);

  if (fs.existsSync(qrFilePath)) {
    const qrImageBytes = fs.readFileSync(qrFilePath);
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });
  } else {
    // Fallback to placeholder if file missing
    page.drawText("(QR Code)", {...});
  }
}
```

**Features**:

- ✅ Attempts to read and embed actual QR PNG files
- ✅ Falls back to placeholder if file not found
- ✅ Includes comprehensive logging for debugging
- ✅ Properly sized QR codes within the box layout
- ✅ Error handling with try/catch

### Fix 3: Consistent Path Resolution in Static Middleware ✅

**File**: `backend/src/app.js` (already correct, verified)

The static middleware already uses `__dirname`:

```javascript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));
```

## Expected Results After Deploy

### 1. QR Files Will Be Created Correctly

- Backend logs will show: `[QR_GENERATOR] Script directory: /opt/render/project/src/backend/src/utils`
- QR files created at: `/opt/render/project/src/backend/uploads/qrcodes/`
- Served from: `https://lumoraorg.onrender.com/uploads/qrcodes/LUM-JS8FMW.png`

### 2. QR Images Will Display in Browser

- Console should show: `[QR_IMAGE_SUCCESS] QR loaded successfully`
- No more 404 errors for QR file requests

### 3. PDFs Will Include Actual QR Codes

- Backend logs: `[PDF_EMBED_QR] Successfully embedded QR for LUM-JS8FMW`
- Downloaded PDFs will have scannable QR codes, not placeholder text
- QR codes sized appropriately within each code box

## Testing Checklist

After deploying to Render:

```
□ Pull latest changes
□ Redeploy backend
□ Create new batch with 5 codes
□ Check Render logs for:
  - [QR_GENERATOR] paths are correct
  - [PDF_EMBED_QR] successfully embedded messages
  - No [QR_IMAGE_ERROR] entries

□ Test QR viewing:
  - Go to batch detail page
  - Click "View QR" on any code
  - Verify QR image displays
  - No 404 or placeholder shown

□ Test PDF download:
  - Click "Download as PDF"
  - Open downloaded PDF
  - Verify actual QR codes visible (not text)
  - Test scanning one QR code

□ Test CSV download:
  - Click "Download Codes"
  - Verify CSV file downloads and opens
```

## Files Modified

| File                                | Changes                                    | Lines Changed |
| ----------------------------------- | ------------------------------------------ | ------------- |
| `backend/src/utils/qrGenerator.js`  | Use `__dirname` instead of `process.cwd()` | ~15 lines     |
| `backend/src/utils/pdfGenerator.js` | Add QR image embedding, make async         | ~82 lines     |
| Total Changes                       | Path standardization + QR embedding        | 97 lines      |

## Commit Information

- **Hash**: `0f059d3`
- **Message**: "fix: Use absolute paths for QR files and embed QR images in PDF"
- **Status**: ✅ Committed and pushed to GitHub

## Next Steps

1. **Deploy** - Pull and redeploy on Render
2. **Generate Test Batch** - Create codes to trigger QR generation
3. **Monitor Logs** - Check Render console for path and embedding logs
4. **Verify** - Test QR display and PDF generation
5. **Report Issues** - If paths still wrong, logs will show exact locations

---

**Key Insight**: The root cause was inconsistent path resolution. By using `__dirname` (file's location) instead of `process.cwd()` (process's working directory), files are now created and served from the same location.
