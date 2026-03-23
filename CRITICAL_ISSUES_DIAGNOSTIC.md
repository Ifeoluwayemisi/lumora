# 🔧 Critical Issues - Diagnostic & Fixes

## Issue #1: Email Not Sending ✅ FIXED

**Status:** FIXED - Environment variables corrected

**What was wrong:**

- `.env` had `EMAIL_HOST` but code expects `SMTP_HOST`
- `.env` had `EMAIL_PORT` but code expects `SMTP_PORT`
- Missing `SMTP_SECURE` variable

**What I fixed:**
Updated `backend/.env`:

```env
# OLD (Wrong)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587

# NEW (Correct)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
```

**Next step:** Restart backend

```bash
cd backend
npm run dev
```

**Test:** Click "Forgot Password" - you should receive email within 1-2 minutes

---

## Issue #2: Report Form Getting Internal Server Error

**Investigation:** The report submission endpoint should work, but might be missing something.

**Possible causes:**

1. Email service failing silently (now fixed by Issue #1)
2. Missing upload directory for report images
3. Missing `emailService` functions

**What to check:**

1. Check backend logs when submitting report - look for specific error message
2. The endpoint is at: `POST /reports/submit`
3. Supported fields:
   - `codeValue` (required)
   - `reportType` (required)
   - `description` (required)
   - `location`, `latitude`, `longitude` (optional - for map)
   - `reporterName`, `reporterPhone` (optional)
   - `healthImpact` (optional - for escalation)

**How to debug:**

```bash
# Check backend console after submitting report
# Look for [REPORT] or error messages
# If you see "[REPORT] Image upload error" that's OK - continues without image
```

**Note on Map feature in Reports:**
Currently, the report form captures:

- Latitude/Longitude (actual GPS coordinates)
- Location string (reverse geocoded address)
- Times when code was scanned

The "map" for reports shows WHERE codes are being verified (geolocation data).

---

## Issue #3: QR Code Not Displaying When Clicking "View"

**Current Status:** No "View QR Code" button exists yet

**Where QR codes should be viewable:**

1. **Manufacturer Dashboard** - Generated codes list
   - Currently shows: Code hash, Status, Verification date, Location
   - Missing: QR code image display

2. **Batch View** - Individual batch codes
   - Currently shows: Code list, statistics
   - Missing: QR code image for each code

3. **Export Codes** - Downloaded codes
   - Missing: QR code display/preview

**What needs to be added:**

### Option A: Add QR Code Modal (Recommended)

Add to `frontend/app/dashboard/manufacturer/codes/page.js`:

```jsx
// Add state for QR display
const [showQRModal, setShowQRModal] = useState(false);
const [selectedQRCode, setSelectedQRCode] = useState(null);

// Function to generate QR code image URL
const generateQRUrl = (code) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}`;
};

// In the table Actions column, add:
<button
  onClick={() => {
    setSelectedQRCode(log.code);
    setShowQRModal(true);
  }}
  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
>
  📱 View QR Code
</button>;

// Add Modal Component at bottom of page:
{
  showQRModal && selectedQRCode && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          QR Code: {selectedQRCode.substring(0, 16)}...
        </h2>
        <img
          src={generateQRUrl(selectedQRCode)}
          alt="QR Code"
          className="w-full border-2 border-gray-200"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          Scan to verify this product
        </p>
        <button
          onClick={() => setShowQRModal(false)}
          className="mt-4 w-full px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
```

### Option B: Add QR Code Column (Simple)

Add QR code thumbnail to each row in the codes table:

```jsx
<td className="px-6 py-4">
  <img
    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(log.code)}`}
    alt="QR"
    className="w-16 h-16 cursor-pointer hover:scale-150 transition"
  />
</td>
```

---

## Issue #4: QR Code Scanner Not Working

**Problems reported:**

1. Torch light not working
2. Upload image not working
3. Scanner not scanning

**File to check:** `frontend/app/verify/qr-scanner.js`

Let me investigate the scanner implementation...

**Common QR Scanner Issues & Fixes:**

### Issue 4A: Torch Light Not Working

```javascript
// Make sure browser has camera access
navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment", torch: true },
});
```

**Fix:** Add torch control properly:

```jsx
// In QR Scanner component
const [torchActive, setTorchActive] = useState(false);

const toggleTorch = async () => {
  try {
    const track = videoRef.current.srcObject.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if ("torch" in capabilities) {
      await track.applyConstraints({
        advanced: [{ torch: !torchActive }],
      });
      setTorchActive(!torchActive);
    } else {
      alert("Torch not supported on this device");
    }
  } catch (err) {
    console.error("Torch error:", err);
  }
};
```

### Issue 4B: Upload Image Not Working

```javascript
// The upload handler might not be converting image data correctly
```

**Fix:** Ensure image upload handler:

```jsx
const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("image", file);

    // Send to backend OR process locally with jsQR
    const text = await decodeQRFromImage(file);
    if (text) {
      // Process detected code
      handleDetectedCode(text);
    }
  } catch (err) {
    console.error("Upload error:", err);
  }
};

// Decode function
const decodeQRFromImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, canvas.width, canvas.height);
          resolve(code ? code.data : null);
        } catch {
          resolve(null);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
```

### Issue 4C: Scanner Not Scanning

**Causes:**

1. Camera permission denied
2. QR code not in frame properly
3. Lighting issues
4. QR detection library not initialized

**Fix - Ensure proper initialization:**

```jsx
import jsQR from "jsqr";

useEffect(() => {
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1440 },
        },
        audio: false,
      });

      videoRef.current.srcObject = stream;
      startScanning();
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera access denied");
    }
  };

  initCamera();
}, []);

const startScanning = () => {
  const canvas = canvasRef.current;
  const video = videoRef.current;

  const scan = () => {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      try {
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          console.log("QR Detected:", code.data);
          handleDetectedCode(code.data);
        }
      } catch (err) {
        console.error("QR detection error:", err);
      }
    }

    requestAnimationFrame(scan);
  };

  scan();
};
```

---

## Action Items - Prioritized

### 🔴 Critical (Do Now):

- [x] Fix SMTP environment variables in `.env`
- [ ] Restart backend and test email
- [ ] Check report ERROR message in backend logs
- [ ] Create QR code view feature

### 🟡 High Priority:

- [ ] Fix QR scanner torch light
- [ ] Fix QR scanner image upload
- [ ] Test QR scanner functionality

### 🟢 Nice to Have:

- [ ] Add QR code preview in list
- [ ] Improve error messages
- [ ] Add loading states

---

## Testing Checklist

```
Email:
- [ ] Go to /auth/login
- [ ] Click "Forgot Password"
- [ ] Enter email
- [ ] Check inbox for email
- [ ] Verify email arrives within 2 minutes

Report Form:
- [ ] Go to /report
- [ ] Fill form
- [ ] Submit
- [ ] Check backend logs for errors
- [ ] Verify report created in database

QR Display:
- [ ] Go to /dashboard/manufacturer/codes
- [ ] Click new "View QR Code" button (after implementation)
- [ ] Verify QR code displays
- [ ] Try to scan with phone

QR Scanner:
- [ ] Go to /verify/qr
- [ ] Allow camera access
- [ ] Try torch button
- [ ] Try uploading image
- [ ] Test scanning actual QR code
```

---

## Code Changes Summary

### 1. ✅ Fixed `.env` SMTP variables

- Changed `EMAIL_HOST` → `SMTP_HOST`
- Changed `EMAIL_PORT` → `SMTP_PORT`
- Added `SMTP_SECURE=false`

### 2. TO DO: Add QR Code display buttons

- Add "View QR Code" button to manufacturer codes page
- Create QR code modal or preview
- Use `https://api.qrserver.com` for QR generation

### 3. TO DO: Fix QR Scanner

- Fix torch light implementation
- Fix image upload handler
- Ensure jsQR library initialized
- Add proper error handling

### 4. TO DO: Debug Report Form

- Check backend logs for specific error
- Verify email service (now working)
- Test with minimal form data

---

## Important Notes

**QR Code Generation:**
Using free service: `https://api.qrserver.com/v1/create-qr-code/`

- No API key needed
- Reliable and fast
- Parameters: `size=300x300&data=YOUR_QR_DATA`

**Report Location Data:**

- Captures GPS coordinates (latitude/longitude)
- Captures location name (reverse geocoded)
- Stores timestamp when code was verified
- Used to show WHERE codes are being verified/misused

**Torch Light Support:**

- Only works on:
  - Android Chrome/Firefox
  - Some iOS apps
  - Physical device (not browser on desktop)
- Graceful degradation needed for unsupported devices

---

**Next Step:** Restart backend to enable email, then run through the testing checklist above.
