# QR Code Issue Analysis - Session 6

## The Real Problem

Your error shows:

```
[QR_IMAGE_ERROR] Failed to load QR from:
https://lumoraorg.onrender.com/opt/render/project/src/backend/uploads/qrcodes/LUM-JS8FMW.png
```

Notice the path includes `/opt/render/project/src/backend/` - **this is an absolute file system path**, not a relative URL path.

---

## Root Cause Hypothesis

The database might be storing **absolute file paths** instead of **relative URL paths**.

### What SHOULD Be Stored

```
/uploads/qrcodes/LUM-JS8FMW.png
```

### What MIGHT Be Stored (Your Error)

```
/opt/render/project/src/backend/uploads/qrcodes/LUM-JS8FMW.png
```

---

## Investigation Steps

### Step 1: Check Database

Run this SQL query in your database to see what's actually stored:

```sql
-- Check what's in the qrImagePath column
SELECT id, codeValue, qrImagePath
FROM "Code"
LIMIT 5;
```

**If you see paths like** `/opt/render/project/src/backend/uploads/...`
→ **Problem Confirmed**: Database has absolute paths

**If you see paths like** `/uploads/qrcodes/...`
→ **Problem Elsewhere**: Path is correct in database

---

### Step 2: Monitor Render Logs

After deployment, generate a NEW batch with codes and watch the Render console for:

```
[QR_GENERATOR] Returning relative path: /uploads/qrcodes/LUM-XXXXX.png
[GET_BATCH_DETAIL] Sample QR paths from database:
  - LUM-XXXXX: ???
```

This will tell you what's being saved to the database now.

---

## Possible Solutions

### If Database Has Absolute Paths

**Option A: Regenerate Codes** (Quickest)

- Delete old batches
- Generate new codes
- New codes should have relative paths

**Option B: Database Migration** (If you need to keep old codes)

```sql
-- Update all absolute paths to relative paths
UPDATE "Code"
SET "qrImagePath" = regexp_replace("qrImagePath", '^.*(/uploads/.*)', '\1')
WHERE "qrImagePath" LIKE '/opt/render%';
```

### If Everything Looks Correct in Database

**Then check**:

1. Is the `/uploads` directory actually being served by Express?
2. Do the files exist in `/uploads/qrcodes/`?
3. Is there a permission issue on Render?

---

## How the Logging Will Help

### 1. You run the new code and look at Render logs

### 2. You find what's in the database

### 3. You understand the exact nature of the problem

### 4. We can then apply the right fix

### For example:

**If logs show**:

```
[QR_GENERATOR] Returning relative path: /uploads/qrcodes/LUM-JS8FMW.png
[GET_BATCH_DETAIL] Sample QR paths from database:
  - LUM-JS8FMW: /opt/render/project/src/backend/uploads/qrcodes/LUM-JS8FMW.png
```

→ **Root cause**: Something in the data layer is converting paths to absolute

---

## PDF/CSV Download Issue

The error might be related to response headers. The fix included:

```javascript
// CRITICAL: Clear any previous headers and set CSV headers ONLY
res.clearHeader("Content-Encoding");
res.setHeader("Content-Type", "text/csv; charset=utf-8");
res.setHeader(
  "Content-Disposition",
  `attachment; filename="batch_${id}_codes.csv"`,
);
```

When you download after the new deployment, check browser Network tab:

- **Response Headers** should show `Content-Type: text/csv`
- **Not** `Content-Type: application/json`

---

## Action Items

1. ✅ Deployed new code with comprehensive logging
2. ⏳ **Next**: You check Render logs after generating a new batch
3. ⏳ Share the logs showing what `qrImagePath` contains
4. ⏳ We determine if we need database fix or code fix
5. ⏳ Apply appropriate solution
