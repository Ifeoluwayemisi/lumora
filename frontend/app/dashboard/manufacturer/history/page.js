"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiX } from "react-icons/fi";
import api from "@/services/api";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";

function ManufacturerHistoryContent() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/manufacturer/history");
      setHistory(response.data?.data || response.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err.response?.data?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading)
    return <p className="text-center mt-4 dark:text-white">Loading...</p>;

  if (error)
    return (
      <p className="text-center mt-4 text-red-600 dark:text-red-400">{error}</p>
    );

  if (!history || history.length === 0)
    return (
      <p className="text-center mt-4 dark:text-white">
        No verification history yet. Your code verifications will appear here.
      </p>
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "GENUINE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "CODE_ALREADY_USED":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "INVALID":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "SUSPICIOUS_PATTERN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "UNREGISTERED_PRODUCT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <AuthGuard allowedRoles={["manufacturer"]}>
      <DashboardSidebar userRole="manufacturer" />
      <MobileBottomNav userRole="manufacturer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                aria-label="Go back"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Verification History
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 flex justify-between items-center hover:shadow-md transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {item.codeValue}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    Status:{" "}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        item.verificationState
                      )}`}
                    >
                      {item.verificationState?.replace(/_/g, " ") || "Unknown"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(
                      item.createdAt || item.timestamp
                    ).toLocaleString()}
                  </p>
                  {item.location && (
                    <p className="text-xs text-gray-400 mt-1">
                      📍 {item.location}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition font-medium whitespace-nowrap ml-4"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">
                Verification Details
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Code Value
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedItem.codeValue}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Verification Status
                </label>
                <p
                  className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                    selectedItem.verificationState
                  )}`}
                >
                  {selectedItem.verificationState?.replace(/_/g, " ")}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Date & Time
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(
                    selectedItem.createdAt || selectedItem.timestamp
                  ).toLocaleString()}
                </p>
              </div>

              {selectedItem.location && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Location
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedItem.location}
                  </p>
                </div>
              )}

              {selectedItem.latitude !== null &&
                selectedItem.longitude !== null && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Coordinates
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedItem.latitude.toFixed(4)},{" "}
                      {selectedItem.longitude.toFixed(4)}
                    </p>
                  </div>
                )}

              {selectedItem.riskScore !== undefined &&
                selectedItem.riskScore !== null && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Risk Score
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedItem.riskScore}%
                    </p>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t dark:border-gray-600 flex gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-genuine"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <ManufacturerHistoryContent />
    </Suspense>
  );
}
