# Manufacturer Location/Map Implementation Guide

## Current Status

The manufacturer dashboard currently displays location as **plain text** (country name). There is no embedded map.

### Where Manufacturer Location is Displayed:

1. **Admin Dashboard** - `frontend/app/admin/manufacturers/[id]/page.js`
   - Shows: Country name as text (e.g., "Nigeria")
   - Location: Header section, Company Information grid

2. **Manufacturer Profile** - `frontend/app/dashboard/manufacturer/profile/page.js`
   - Shows: Country, Phone, Email as text fields

3. **Report Submission** - `frontend/app/report/page.js`
   - Uses geolocation to capture report location coordinates
   - Reverse geocodes to get address name

## Issue: "Map is opening wrongly with wrong address"

If you're seeing a map that opens with incorrect location:

### Possible causes:

1. **Geolocation API returning wrong coordinates**
   - Browser location services miscalibrated
   - IP-based geolocation is inaccurate

2. **Android/iOS app showing system map**
   - Device location services not enabled
   - Maps app opening with old/cached location

3. **Missing address in manufacturer profile**
   - Only storing country, not street address
   - No detailed location data

## Solutions

### Option 1: Add Detailed Location Fields (Recommended)

Update Prisma schema to store complete address:

```prisma
model Manufacturer {
  // ... existing fields

  // Add these location fields
  country           String?
  state             String?      // Region/State/Province
  city              String?       // City
  street            String?       // Street address
  postalCode        String?       // ZIP/Postal code
  latitude          Float?        // For map display
  longitude         Float?        // For map display
}
```

### Implement:

```prisma
# Run migration:
npx prisma migrate dev --name add_detailed_location_fields
```

Then update signup to capture these fields:

```javascript
// frontend/app/auth/register/page.js
const [form, setForm] = useState({
  // ... existing fields
  city: "",
  state: "",
  street: "",
  postalCode: "",
});

// Add form fields for these inputs
// Update backend to save these in manufacturer record
```

### Option 2: Display Google Map (Production)

Add interactive map showing manufacturer location:

```bash
npm install @react-google-maps/api
```

Usage:

```jsx
import { GoogleMap, MarkerF, LoadScript } from "@react-google-maps/api";

export function ManufacturerLocationMap({ latitude, longitude, name }) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={{ lat: latitude || 9.0765, lng: longitude || 7.3986 }}
        zoom={10}
      >
        <MarkerF position={{ lat: latitude, lng: longitude }} title={name} />
      </GoogleMap>
    </LoadScript>
  );
}
```

### Option 3: Display OpenStreetMap (Free, No API Key)

```bash
npm install react-leaflet leaflet
```

Usage:

```jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export function ManufacturerLocationMap({ latitude, longitude, name }) {
  return (
    <MapContainer
      center={[latitude || 9.0765, longitude || 7.3986]}
      zoom={10}
      style={{ width: "100%", height: "400px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={[latitude, longitude]}>
        <Popup>{name}</Popup>
      </Marker>
    </MapContainer>
  );
}
```

### Option 4: Use Google Places Autocomplete (Best UX)

```bash
npm install @react-google-maps/api react-google-places-autocomplete google-map-react
```

Allows manufacturers to enter location during signup with autocomplete:

```jsx
import { StandaloneSearchBox } from "@react-google-maps/api";

export function LocationInput({ onLocationSelect }) {
  const [searchBox, setSearchBox] = useState(null);

  return (
    <StandaloneSearchBox
      onLoad={(ref) => setSearchBox(ref)}
      onPlacesChanged={() => {
        const places = searchBox.getPlaces();
        if (places[0]) {
          const { formatted_address, geometry } = places[0];
          onLocationSelect({
            address: formatted_address,
            latitude: geometry.location.lat(),
            longitude: geometry.location.lng(),
          });
        }
      }}
    >
      <input type="text" placeholder="Enter manufacturer address" />
    </StandaloneSearchBox>
  );
}
```

## Quick Fix: Improve Form Collection

If you don't need maps yet, at least collect better location data:

### Update Registration Form:

```javascript
// frontend/app/auth/register/page.js

// Add these to the form state
const [form, setForm] = useState({
  // ... existing fields
  city: "",
  state: "",
  postalCode: "",
  street: "", // Optional
});

// Add form fields for entering location details
<div>
  <label>City</label>
  <input
    type="text"
    name="city"
    value={form.city}
    onChange={handleChange}
    placeholder="e.g., Lagos"
    required
  />
</div>

<div>
  <label>State/Region</label>
  <input
    type="text"
    name="state"
    value={form.state}
    onChange={handleChange}
    placeholder="e.g., Lagos State"
  />
</div>

<div>
  <label>Postal Code</label>
  <input
    type="text"
    name="postalCode"
    value={form.postalCode}
    onChange={handleChange}
    placeholder="Optional"
  />
</div>
```

### Update Backend to Save:

```javascript
// backend/src/controllers/authController.js

// In manufacturer creation:
const manufacturerRecord = await prisma.manufacturer.create({
  data: {
    // ... existing fields
    city: req.body.city,
    state: req.body.state,
    postalCode: req.body.postalCode,
  },
});
```

## Files to Update

1. **Prisma Schema:** `backend/prisma/schema.prisma`
   - Add location fields to Manufacturer model

2. **Signup Page:** `frontend/app/auth/register/page.js`
   - Add form fields for city, state, postal code
   - Pass `agreeToTerms` to backend

3. **Auth Controller:** `backend/src/controllers/authController.js`
   - Accept and save location fields

4. **Manufacturer Profile:** `frontend/app/dashboard/manufacturer/profile/page.js`
   - Display full address (country, state, city)

5. **Admin Detail Page:** `frontend/app/admin/manufacturers/[id]/page.js`
   - Show complete location information
   - Option: Add map visualization

## Recommended Next Steps

1. **Short term:** Collect better location data in form (city, state)
2. **Medium term:** Add OpenStreetMap for visualization (no API key needed)
3. **Long term:** Integrate Google Maps Places API for better UX

## Test Location Accuracy

To test if geolocation is working correctly:

```javascript
// Check browser console for coordinates
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log("Latitude:", position.coords.latitude);
    console.log("Longitude:", position.coords.longitude);
  },
  (error) => console.error("Geolocation error:", error),
);
```

Verify coordinates against known location:

- Nigeria center: ~9.0765°N, 7.3986°E (Abuja)
- Lagos: ~6.5244°N, 3.3792°E
- Check if captured coordinates match expected region

## Environment Variable for Maps

If using Google Maps, add to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Note:** Use `NEXT_PUBLIC_` prefix so it's available in browser.

---

**Action Items:**

- [ ] Collect detailed location data (city, state, postal code)
- [ ] Add location fields to Prisma schema
- [ ] Update signup form with location inputs
- [ ] Test geolocation accuracy
- [ ] Consider adding map visualization (OpenStreetMap for free option)
