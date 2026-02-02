# Location Tracking & Suspicious Activity Detection Implementation

## Overview

Implemented location tracking for product verification with intelligent permission handling:

- **Normal Verifications**: Request explicit user permission before capturing location
- **Suspicious Activities**: Attempt silent location capture without user permission for fraud detection

---

## Frontend Implementation

### 1. Geolocation Utility (`frontend/utils/geolocation.js`)

Created comprehensive geolocation handler with two capture strategies:

```javascript
// Request explicit permission (5 second timeout)
getLocationPermission(timeout = 5000)
  ↳ Shows browser geolocation permission dialog
  ↳ Used for normal product verifications

// Silent capture without dialog (3 second timeout, allows cached location up to 5 mins)
getLocationSilent(timeout = 3000)
  ↳ Attempts capture in background
  ↳ No permission dialog shown
  ↳ Used for suspicious activity detection

// Smart router function
getLocationForVerification(verificationState)
  ↳ Detects suspicious patterns (SUSPICIOUS, DUPLICATE, FRAUD)
  ↳ Routes to appropriate capture method
```

### 2. Manual Verification Page (`frontend/app/verify/page.js`)

Updates:

- Imports `getLocationPermission` from geolocation utility
- Added location capture before API call
- Shows toast notification: "📍 Requesting location permission for verification..."
- Passes latitude/longitude to backend `/verify/manual` endpoint

```javascript
const location = await getLocationPermission();
await api.post("/verify/manual", {
  codeValue: code,
  latitude: location.latitude,
  longitude: location.longitude,
});
```

### 3. QR Code Verification Page (`frontend/app/verify/qr/page.js`)

Updates:

- Imports `getLocationPermission` from geolocation utility
- Location capture in two scenarios:
  1. **QR Scan Success** (`onScanSuccess`): Captures location when code is scanned
  2. **Image Upload** (`handleImageUpload`): Captures location when QR image is uploaded
- Shows permission toast before making API calls
- Passes latitude/longitude to `/verify/qr` endpoint

---

## Backend Implementation

### 1. Verification Service (`backend/src/services/verificationService.js`)

Already supports location parameters:

- Accepts `latitude` and `longitude` parameters in `verifyCode()` function
- Logs location to `VerificationLog` table (already implemented)
- Passes location to incident creation for suspicious activities

### 2. Incident Service (`backend/src/services/incidentService.js`)

Updated to capture location:

- Added `latitude` and `longitude` parameters to `maybeCreateIncident()`
- Stores location data in incident records for fraud investigation

```javascript
export async function maybeCreateIncident({
  codeValue,
  state,
  riskScore,
  trustDecision,
  latitude = null,
  longitude = null,
}) {
  // ... create incident with location
}
```

### 3. Database Schema Changes

Updated `Incident` model in `schema.prisma`:

- Added `latitude Float?` field
- Added `longitude Float?` field
- Created migration: `20260113190100_add_location_to_incidents`

```prisma
model Incident {
  id        String            @id @default(uuid())
  codeValue String
  riskScore Float
  state     VerificationState
  status    String
  latitude  Float?           // New field
  longitude Float?           // New field
  createdAt DateTime          @default(now())
  @@index([status])
}
```

---

## Data Flow

### Normal Verification Flow

```
User enters code
    ↓
System requests location with permission dialog
    ↓
User grants permission (or timeout)
    ↓
Frontend sends verification request with lat/lon
    ↓
Backend logs to VerificationLog with location
    ↓
If genuine: Code marked as used
If suspicious: Incident created with location
```

### Suspicious Activity Flow

```
Backend detects suspicious pattern
    ↓
Frontend recognizes SUSPICIOUS_PATTERN state
    ↓
System attempts silent location capture (no dialog)
    ↓
Location logged in background (if available)
    ↓
Incident created with location for investigation
```

---

## Location Storage & Usage

### VerificationLog Table

- Stores every verification attempt with location
- Fields: `latitude`, `longitude`, `verificationState`, `riskScore`
- Used for verification history and analytics

### Incident Table

- Stores suspicious activities and fraud attempts
- Fields: `latitude`, `longitude`, `state`, `riskScore`
- Used for fraud investigation and reporting to authorities

---

## Security & Privacy Features

### Permission-Based Capture

- **Normal operations**: Explicit user permission required
- User sees "📍 Requesting location permission..."
- Can deny permission (returns null lat/lon)
- 5-second timeout prevents app hang

### Silent Capture for Fraud Detection

- **Suspicious activities only**: Attempts capture without dialog
- 3-second timeout (shorter to avoid delays)
- Allows cached location up to 5 minutes old
- Fails silently if unavailable (no user impact)

### User Control

- Users can permanently deny location permission in browser settings
- Failed captures (null lat/lon) don't block verification
- Location data stored separately from main verification state

---

## Testing Checklist

- [ ] Manual verification shows location permission dialog
- [ ] QR scan/upload shows location permission dialog
- [ ] Toast notification appears: "📍 Requesting location permission..."
- [ ] Location captured and sent to backend
- [ ] VerificationLog stores latitude/longitude
- [ ] Suspicious activities create Incident records with location
- [ ] Silent capture works without dialog (test with suspicious code)
- [ ] Permission denial doesn't break verification (returns null location)
- [ ] Location formatting correct in database (decimal degrees)

---

## API Endpoints Updated

### Manual Verification

```
POST /verify/manual
Body: {
  codeValue: string,
  latitude: number | null,
  longitude: number | null
}
```

### QR Verification

```
POST /verify/qr
Body: {
  qrData: string,
  latitude: number | null,
  longitude: number | null
}
```

---

## Files Modified

### Frontend

- `frontend/utils/geolocation.js` - Created
- `frontend/app/verify/page.js` - Updated with location capture
- `frontend/app/verify/qr/page.js` - Updated with location capture

### Backend

- `backend/src/services/incidentService.js` - Updated to handle location
- `backend/src/services/verificationService.js` - Already supports location
- `backend/prisma/schema.prisma` - Added location fields to Incident
- `backend/prisma/migrations/20260113190100_add_location_to_incidents/` - Created

---

## Future Enhancements

1. **Geofencing**: Flag verifications outside expected regions
2. **Velocity Checks**: Alert on multiple verifications in short time periods
3. **Location Heatmaps**: Visualize where products are being verified
4. **Manufacturer Analytics**: Show verification patterns by location
5. **Risk Scoring**: Increase risk score for out-of-region verifications
6. **Device Fingerprinting**: Combine location with device data for better fraud detection
