# Debugging Dashboard Sync Issue

## The Problem

Admin dashboard shows 0 verifications even though you verified a product.

## Steps to Diagnose

### 1. Run the debug script

```bash
cd backend
node debug-dashboard.js
```

This will show:

- Total codes in system
- Total verification logs created
- Sample recent verifications
- Breakdown by verification state
- Today's verification count
- Manufacturer verification counts

### 2. Check the backend logs when you verify a product

When you verify a product, look for these logs in the terminal:

**When verification happens:**

```
[VERIFY] Creating verification log with: {
  codeValue: 'LUM-XXXXX',
  codeId: '...',
  batchId: '...',
  manufacturerId: '...',
  userId: '...',
  verificationState: 'GENUINE',
  riskScore: 0
}
[VERIFY] ✅ Verification log created successfully: <log-id>
```

**When dashboard fetches metrics:**

```
[DASHBOARD] Fetching global metrics...
[DASHBOARD] Today verifications: 1 since ...
[DASHBOARD] 7-day verifications: 1
[DASHBOARD] Total verifications (all time): 1
[DASHBOARD] Verification breakdown: [...]
```

### 3. If you see errors:

**Error creating verification log:**

```
[VERIFY] ❌ Failed to log verification: <error message>
[VERIFY] Error code: <code>
[VERIFY] Error meta: <details>
```

**No dashboard data:**

```
[DASHBOARD] Total verifications (all time): 0
```

## Possible Issues & Solutions

### Issue 1: Verification logs aren't being created

- Check if verificationState is correct
- Verify `code?.manufacturerId` is not NULL
- Check database connection

### Issue 2: Logs are created but dashboard doesn't show them

- Check the date filter (createdAt vs timestamp field)
- Verify the VerificationLog table exists
- Check for permission issues

### Issue 3: Some verifications are logged but not all

- Check error logs during verification
- Verify database constraints aren't failing
- Check for duplicate key violations

## What to Do Next

1. **Restart the backend**
2. **Verify a product code**
3. **Check the console logs** (look for [VERIFY] and [DASHBOARD] prefixes)
4. **Run the debug script** to see the current state
5. **Share the logs** if still not working

The comprehensive logging will tell us exactly where the issue is!
