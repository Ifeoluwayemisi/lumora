/**
 * Geolocation utility for product verification
 * Handles location capture with different permission strategies:
 * - Normal verification: Request user permission
 * - Suspicious activity: Attempt silent capture (no permission dialog)
 */

/**
 * Request location with explicit user permission
 * Uses browser's native geolocation dialog
 * @param {number} timeout - Timeout in ms (default: 5000)
 * @returns {Promise<{latitude, longitude}>}
 */
export async function getLocationPermission(timeout = 10000) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("⚠️  Geolocation API not supported in this browser");
      resolve({ latitude: null, longitude: null });
      return;
    }

    console.log("📍 Requesting location permission from user...");
    let resolved = false;

    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn("⏱️  Location request timed out");
        resolve({ latitude: null, longitude: null });
      }
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log("✅ Location captured successfully:", {
          latitude: lat,
          longitude: lon,
        });
        resolve({
          latitude: lat,
          longitude: lon,
        });
      },
      (error) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        console.warn(
          "⚠️  Location permission denied or unavailable (code: " +
            error.code +
            ")"
        );
        // Return null - don't store false data
        resolve({ latitude: null, longitude: null });
      },
      {
        enableHighAccuracy: true,
        timeout: Math.min(timeout - 1000, 8000),
        maximumAge: 0,
      }
    );
  });
}

/**
 * Attempt to get location silently without permission dialog
 * Used for suspicious activity detection - attempts capture in background
 * @param {number} timeout - Timeout in ms (default: 3000)
 * @returns {Promise<{latitude, longitude}>}
 */
export async function getLocationSilent(timeout = 3000) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ latitude: null, longitude: null });
      return;
    }

    const timeoutId = setTimeout(() => {
      resolve({ latitude: null, longitude: null });
    }, timeout);

    // Try with lower accuracy to reduce permission requirement
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        // Silently fail - don't show error to user
        resolve({ latitude: null, longitude: null });
      },
      {
        enableHighAccuracy: false,
        timeout: timeout,
        maximumAge: 300000, // Allow cached location up to 5 minutes
      }
    );
  });
}

/**
 * Get location based on verification type
 * - Normal verifications: Request permission with toast
 * - Suspicious activities: Attempt silent capture
 * @param {string} verificationState - Verification state from backend response
 * @returns {Promise<{latitude, longitude}>}
 */
export async function getLocationForVerification(verificationState) {
  // Detect suspicious activities that warrant silent location capture
  const isSuspicious =
    verificationState?.includes("SUSPICIOUS") ||
    verificationState?.includes("DUPLICATE") ||
    verificationState?.includes("FRAUD");

  if (isSuspicious) {
    // Attempt silent capture for suspicious activities
    return getLocationSilent();
  } else {
    // Request permission for normal verifications
    return getLocationPermission();
  }
}
