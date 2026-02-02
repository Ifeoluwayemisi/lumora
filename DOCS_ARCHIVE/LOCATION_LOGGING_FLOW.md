# 📍 Location Logging Flow - Complete Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      LUMORA VERIFICATION SYSTEM                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 FRONTEND (Next.js)                        │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ User enters code/scans QR                          │  │   │
│  │  │ ↓                                                  │  │   │
│  │  │ getLocationPermission() called                    │  │   │
│  │  │ ↓                                                  │  │   │
│  │  │ Browser asks "Allow location access?"            │  │   │
│  │  │ ↓                                                  │  │   │
│  │  │ Get latitude & longitude (or null if denied)     │  │   │
│  │  │ ↓                                                  │  │   │
│  │  │ Send to backend: {code, latitude, longitude}     │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 BACKEND (Node/Express)                    │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ POST /verify/manual                                │  │   │
│  │  │ ↓                                                  │  │   │
│  │  │ Receive: {codeValue, latitude, longitude}        │  │   │
│  │  │ ↓                                                  │  │   │
│  │  │ Verify code in database                           │  │   │
│  │  │ ↓                                                  │  │   │
│  │  │ Create VerificationLog with location data         │  │   │
│  │  │ ↓                                                  │  │   │
│  │  │ Return verification result                         │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              DATABASE (MySQL)                            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ VerificationLog Table:                             │  │   │
│  │  │ ┌─────────────────────────────────────────────┐   │  │   │
│  │  │ │ id           │ UUID                         │   │  │   │
│  │  │ │ codeValue    │ ABC123                       │   │  │   │
│  │  │ │ latitude     │ 6.5244 ✓ STORED HERE        │   │  │   │
│  │  │ │ longitude    │ 3.3792 ✓ STORED HERE        │   │  │   │
│  │  │ │ state        │ GENUINE                      │   │  │   │
│  │  │ │ timestamp    │ 2026-01-14 10:30:00         │   │  │   │
│  │  │ └─────────────────────────────────────────────┘   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Flow for Each Verification Type

### **1. MANUAL CODE VERIFICATION**

```javascript
// File: frontend/app/verify/page.js

const handleVerify = async (e) => {
  // Step 1: User submits form with product code
  const code = "ABC123";

  // Step 2: Request location with permission
  const location = await getLocationPermission(); // Browser dialog shown
  // Returns: { latitude: 6.5244, longitude: 3.3792 }

  // Step 3: Send to backend
  const response = await api.post("/verify/manual", {
    codeValue: code,
    latitude: location.latitude, // 6.5244
    longitude: location.longitude, // 3.3792
  });

  // Step 4: Backend saves to database
  // Database now has:
  // INSERT INTO VerificationLog
  // (codeValue, latitude, longitude, verificationState, ...)
  // VALUES ('ABC123', 6.5244, 3.3792, 'GENUINE', ...)
};
```

---

### **2. QR CODE SCANNING**

```javascript
// File: frontend/app/verify/qr/page.js

const handleQrScan = async (decodedText) => {
  // Step 1: QR code scanned
  const qrData = decodedText; // "ABC123"

  // Step 2: Request location
  const location = await getLocationPermission();

  // Step 3: Send to backend
  const response = await api.post("/verify/qr", {
    qrData: qrData, // From QR
    latitude: location.latitude, // 6.5244
    longitude: location.longitude, // 3.3792
  });

  // Step 4: Backend logs to database with location
};
```

---

### **3. QR IMAGE UPLOAD**

```javascript
// File: frontend/app/verify/qr/page.js

const handleImageUpload = async (file) => {
  // Step 1: User selects image with QR code
  const formData = new FormData();
  formData.append("file", file);

  // Step 2: Request location
  const location = await getLocationPermission();

  // Step 3: Extract QR code from image
  // Backend decodes the QR code

  // Step 4: Send to backend
  const response = await api.post("/verify/upload", {
    file: file,
    latitude: location.latitude, // 6.5244
    longitude: location.longitude, // 3.3792
  });

  // Step 5: Backend logs to database with location
};
```

---

## Backend Flow in Detail

### **File: backend/src/controllers/verificationController.js**

```javascript
export async function verifyManual(req, res, next) {
  // Step 1: Extract data from request
  const { codeValue, latitude, longitude } = req.body;

  // Step 2: Validate location data
  const location = normalizeLocation(latitude, longitude);
  // Returns: { latitude: 6.5244, longitude: 3.3792 } or nulls

  // Step 3: Call verification service
  const result = await handleVerification({
    codeValue: "ABC123",
    latitude: location.latitude, // 6.5244
    longitude: location.longitude, // 3.3792
    userId: req.user?.id,
    ip: req.ip,
  });

  // Step 4: Return result to frontend
  return res.status(200).json(result);
}
```

### **File: backend/src/services/verificationService.js**

```javascript
export async function verifyCode({
  codeValue,
  latitude, // 6.5244
  longitude, // 3.3792
  userId,
}) {
  // Step 1: Find code in database
  const code = await prisma.code.findFirst({
    where: { codeValue: "ABC123" },
  });

  // Step 2: Determine verification state
  let verificationState = "GENUINE";

  // Step 3: LOG VERIFICATION WITH LOCATION
  await prisma.verificationLog.create({
    data: {
      codeValue: "ABC123",
      codeId: code.id,
      latitude: 6.5244, // ✓ LOCATION STORED
      longitude: 3.3792, // ✓ LOCATION STORED
      userId: userId,
      verificationState: "GENUINE",
      riskScore: 0,
      timestamp: new Date(),
    },
  });

  // Step 4: Return verification result
  return {
    verification: { state: "GENUINE" },
    product: { name: "Medicine" },
  };
}
```

---

## Database Schema

### **VerificationLog Table**

```sql
CREATE TABLE VerificationLog (
  id VARCHAR(36) PRIMARY KEY,           -- UUID
  codeValue VARCHAR(255) NOT NULL,      -- "ABC123"
  codeId VARCHAR(36),
  batchId VARCHAR(36),
  manufacturerId VARCHAR(36),
  userId VARCHAR(36),

  -- LOCATION DATA (What we track)
  latitude FLOAT,                       -- 6.5244 ✓
  longitude FLOAT,                      -- 3.3792 ✓
  location VARCHAR(255),

  -- Status
  verificationState ENUM(...),
  riskScore FLOAT,

  -- Timestamps
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX (codeValue),
  INDEX (verificationState),
  INDEX (createdAt)
);
```

---

## Query to Verify Location Logging

### **Check if locations are being stored:**

```sql
-- All verifications with location data
SELECT
  id,
  codeValue,
  latitude,
  longitude,
  verificationState,
  createdAt
FROM VerificationLog
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
ORDER BY createdAt DESC;

-- Output example:
/*
| id | codeValue | latitude | longitude | verificationState | createdAt |
|----|-----------|----------|-----------|---|---|
| 1 | ABC123 | 6.5244 | 3.3792 | GENUINE | 2026-01-14 10:30:00 |
| 2 | XYZ789 | 6.5250 | 3.3800 | CODE_ALREADY_USED | 2026-01-14 10:35:00 |
| 3 | DEF456 | 6.5240 | 3.3790 | INVALID | 2026-01-14 10:40:00 |
*/
```

### **Check location capture rate:**

```sql
-- What percentage of verifications have location data?
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN latitude IS NOT NULL THEN 1 ELSE 0 END) as with_location,
  ROUND(100.0 * SUM(CASE WHEN latitude IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as capture_rate
FROM VerificationLog;

-- Output example:
/*
| total | with_location | capture_rate |
|-------|---------------|-------------|
| 100 | 85 | 85.00 |
*/
-- 85% of users granted location permission
```

### **Analyze location by verification state:**

```sql
-- See where verifications happen (by location)
SELECT
  ROUND(latitude, 2) as lat,
  ROUND(longitude, 2) as lon,
  verificationState,
  COUNT(*) as count
FROM VerificationLog
WHERE latitude IS NOT NULL
GROUP BY ROUND(latitude, 2), ROUND(longitude, 2), verificationState
ORDER BY count DESC;
```

---

## Location Permission Flow

### **User Permission Dialog**

```
1. User starts verification
   ↓
2. getLocationPermission() called
   ↓
3. Browser shows: "Allow [app] to access your location?"
   ├─ ALLOW (User clicks "Allow")
   │  ├─ Browser gets GPS coordinates
   │  ├─ Returns { latitude: 6.5244, longitude: 3.3792 }
   │  └─ Data sent to backend ✓
   │
   └─ DENY (User clicks "Don't allow" or blocks)
      ├─ Browser returns error
      ├─ Returns { latitude: null, longitude: null }
      └─ Verification still works, but location is NULL (OK)
```

### **Fallback Scenarios**

| Scenario                     | Result        | Location Stored                |
| ---------------------------- | ------------- | ------------------------------ |
| User grants permission       | Gets lat/long | ✅ YES                         |
| User denies permission       | Gets null     | ❌ NO (but verification works) |
| Geolocation not available    | Gets null     | ❌ NO (but verification works) |
| Browser doesn't support      | Gets null     | ❌ NO (but verification works) |
| Timeout waiting for location | Gets null     | ❌ NO (but verification works) |

---

## Verification Endpoints - All Include Location

### **POST /api/verify/manual**

```bash
# Request
curl -X POST http://localhost:5000/api/verify/manual \
  -H "Content-Type: application/json" \
  -d '{
    "codeValue": "ABC123",
    "latitude": 6.5244,     ← Location data
    "longitude": 3.3792     ← Location data
  }'

# Response
{
  "verification": {
    "state": "GENUINE"
  },
  "product": {
    "name": "Medicine"
  }
}

# Database: Location saved to VerificationLog
```

### **POST /api/verify/qr**

```bash
# Request
curl -X POST http://localhost:5000/api/verify/qr \
  -H "Content-Type: application/json" \
  -d '{
    "qrData": "ABC123",     ← From QR code
    "latitude": 6.5244,     ← Location data
    "longitude": 3.3792     ← Location data
  }'

# Database: Location saved to VerificationLog
```

### **POST /api/verify/upload**

```bash
# Request (multipart)
curl -X POST http://localhost:5000/api/verify/upload \
  -F "file=@qrcode.jpg" \
  -F "latitude=6.5244" \
  -F "longitude=3.3792"

# Database: Location saved to VerificationLog
```

---

## Complete Example Flow

### **User Verification Journey with Location Logging**

```
1. USER OPENS APP
   ↓
2. NAVIGATES TO VERIFY PAGE
   ↓
3. ENTERS CODE "ABC123"
   ↓
4. CLICKS "VERIFY"
   ↓
5. BROWSER ASKS FOR LOCATION
   - User sees: "Allow location access?"
   - User clicks: "Allow"
   ↓
6. LOCATION CAPTURED
   - Latitude: 6.5244
   - Longitude: 3.3792
   ↓
7. SENT TO BACKEND
   POST /verify/manual {
     codeValue: "ABC123",
     latitude: 6.5244,
     longitude: 3.3792
   }
   ↓
8. BACKEND VERIFIES
   - Finds code "ABC123" in database
   - Code is genuine
   - Logs verification WITH LOCATION
   ↓
9. DATABASE SAVES
   INSERT INTO VerificationLog (
     codeValue = "ABC123",
     latitude = 6.5244,      ← Stored!
     longitude = 3.3792,     ← Stored!
     verificationState = "GENUINE"
   )
   ↓
10. RESULT DISPLAYED
    - Shows: "Code is Genuine ✓"
    - Location automatically logged
    ↓
11. QUERY DATABASE
    SELECT latitude, longitude FROM VerificationLog
    WHERE codeValue = "ABC123"
    → Returns: 6.5244, 3.3792 ✓
```

---

## Summary

| Component                    | Status     | Verification                          |
| ---------------------------- | ---------- | ------------------------------------- |
| Location Capture (Frontend)  | ✅ Working | `getLocationPermission()` implemented |
| Location Transmission        | ✅ Working | Sent in request body                  |
| Location Reception (Backend) | ✅ Working | Received by controller                |
| Location Storage             | ✅ Working | Saved in VerificationLog table        |
| Location Persistence         | ✅ Working | Query database to confirm             |

---

## Next Steps

1. **Deploy to production**
2. **Monitor location capture rate** (should be 70-90% of users)
3. **Query database regularly** to verify locations are being stored
4. **Use location data for analytics** (where users verify, geographic patterns, etc.)

---

**STATUS: ✅ Location logging fully implemented and verified to work!**
