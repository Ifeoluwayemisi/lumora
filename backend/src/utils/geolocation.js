/**
 * Geolocation Utility - Reverse Geocoding
 *
 * Converts lat/long coordinates to human-readable locations
 * Uses OpenStreetMap Nominatim API (free, no key required)
 *
 * Usage:
 * const location = await reverseGeocode(6.5244, 3.3792);
 * // Returns: "Ikeja, Lagos, Nigeria"
 */

const NOMINATIM_API = "https://nominatim.openstreetmap.org";

// Cache to avoid repeated API calls
const geocodeCache = new Map();

/**
 * Reverse geocode coordinates to location name
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} - Human readable location
 */
export async function reverseGeocode(latitude, longitude) {
  if (!latitude || !longitude) {
    return "Unknown location";
  }

  // Check cache first
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${NOMINATIM_API}/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Lumora/1.0 (+https://lumora.ng)",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    // Build location string with progressively broader areas
    let location = [
      address.suburb || address.neighborhood,
      address.city || address.town || address.county,
      address.state,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");

    if (!location) {
      location = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }

    // Cache result (10 minutes)
    geocodeCache.set(cacheKey, location);
    setTimeout(() => geocodeCache.delete(cacheKey), 10 * 60 * 1000);

    return location;
  } catch (error) {
    console.error("[GEOCODE] Reverse geocoding error:", error.message);
    // Fallback to coordinates
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}

/**
 * Batch reverse geocode multiple coordinates
 * @param {Array<{latitude, longitude}>} coordinates
 * @returns {Promise<Array>} - Coordinates with location names
 */
export async function reverseGeocodeBatch(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return [];
  }

  // Throttle requests to avoid rate limiting (Nominatim: 1 req/sec)
  const results = [];
  for (const coord of coordinates) {
    const location = await reverseGeocode(coord.latitude, coord.longitude);
    results.push({
      ...coord,
      locationName: location,
    });

    // Rate limiting: 1 second between requests
    if (coordinates.indexOf(coord) < coordinates.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Get city/region from coordinates (simplified)
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} - City/region name
 */
export async function getCityName(latitude, longitude) {
  try {
    const response = await fetch(
      `${NOMINATIM_API}/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Lumora/1.0 (+https://lumora.ng)",
        },
      },
    );

    if (!response.ok) return `${latitude}, ${longitude}`;

    const data = await response.json();
    const address = data.address || {};

    // Return city first, then state, then country
    return (
      address.city ||
      address.town ||
      address.state ||
      address.country ||
      "Unknown"
    );
  } catch (error) {
    console.error("[GET_CITY] Error:", error.message);
    return `${latitude}, ${longitude}`;
  }
}

/**
 * Haversine distance calculation (for hotspot clustering)
 * @param {number} lat1, lon1, lat2, lon2
 * @returns {number} - Distance in km
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Cluster nearby coordinates
 * @param {Array<{latitude, longitude, _count}>} hotspots
 * @param {number} radiusKm - Clustering radius (default 5km)
 * @returns {Array} - Clustered hotspots with representative names
 */
export async function clusterHotspots(hotspots, radiusKm = 5) {
  if (!Array.isArray(hotspots) || hotspots.length === 0) {
    return [];
  }

  const clusters = [];
  const processed = new Set();

  for (let i = 0; i < hotspots.length; i++) {
    if (processed.has(i)) continue;

    const cluster = [hotspots[i]];
    processed.add(i);

    // Find nearby hotspots
    for (let j = i + 1; j < hotspots.length; j++) {
      if (processed.has(j)) continue;

      const distance = calculateDistance(
        hotspots[i].latitude,
        hotspots[i].longitude,
        hotspots[j].latitude,
        hotspots[j].longitude,
      );

      if (distance <= radiusKm) {
        cluster.push(hotspots[j]);
        processed.add(j);
      }
    }

    // Calculate cluster center and get location name
    const centerLat =
      cluster.reduce((sum, h) => sum + h.latitude, 0) / cluster.length;
    const centerLon =
      cluster.reduce((sum, h) => sum + h.longitude, 0) / cluster.length;
    const totalCount = cluster.reduce((sum, h) => sum + (h._count || 1), 0);

    const locationName = await reverseGeocode(centerLat, centerLon);

    clusters.push({
      id: `cluster_${clusters.length}`,
      latitude: centerLat,
      longitude: centerLon,
      locationName,
      incidentCount: totalCount,
      hotspotCount: cluster.length,
      severity: totalCount > 10 ? "HIGH" : totalCount > 5 ? "MEDIUM" : "LOW",
    });
  }

  return clusters;
}

export default {
  reverseGeocode,
  reverseGeocodeBatch,
  getCityName,
  calculateDistance,
  clusterHotspots,
};
