"use client";
import { useState, useEffect } from "react";
import { FiX, FiMapPin, FiClock, FiArrowUpRight } from "react-icons/fi";

/**
 * Location Details Modal
 * Shows manufacturer location and code verification location
 * with distance calculation and verification timeline
 */
export default function LocationDetailsModal({
  code,
  location,
  latitude,
  longitude,
  verificationHistory,
  manufacturerLocation,
  onClose,
}) {
  const [distance, setDistance] = useState(null);

  // Calculate distance between two coordinates using Haversine formula
  useEffect(() => {
    if (
      manufacturerLocation &&
      latitude &&
      longitude &&
      manufacturerLocation.latitude &&
      manufacturerLocation.longitude
    ) {
      const dist = calculateDistance(
        manufacturerLocation.latitude,
        manufacturerLocation.longitude,
        latitude,
        longitude,
      );
      setDistance(dist);
    }
  }, [latitude, longitude, manufacturerLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  };

  const openGoogleMaps = () => {
    window.open(`https://maps.google.com/?q=${latitude},${longitude}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            📍 Location Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Code Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Code
            </p>
            <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
              {code}
            </p>
          </div>

          {/* Map Section */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiMapPin className="w-4 h-4" />
              Verification Location
            </h3>

            {latitude && longitude ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Latitude
                    </p>
                    <p className="font-mono text-sm text-blue-600 dark:text-blue-400">
                      {latitude.toFixed(6)}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Longitude
                    </p>
                    <p className="font-mono text-sm text-blue-600 dark:text-blue-400">
                      {longitude.toFixed(6)}
                    </p>
                  </div>
                </div>

                {location && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Location Name
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      {location}
                    </p>
                  </div>
                )}

                {distance !== null && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Distance from Manufacturer
                    </p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {distance} km
                    </p>
                  </div>
                )}

                <button
                  onClick={openGoogleMaps}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FiMapPin className="w-4 h-4" />
                  Open in Google Maps
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center text-gray-600 dark:text-gray-400">
                📍 No location data available for this verification
              </div>
            )}
          </div>

          {/* Verification Timeline */}
          {verificationHistory && verificationHistory.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                Verification History
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {verificationHistory.map((verification, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <FiArrowUpRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {verification.state || "VERIFIED"}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(verification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 <strong>Tip:</strong> Monitor codes verified far from your
              manufacturing location. Multiple verifications in unexpected areas
              may indicate counterfeit distribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
