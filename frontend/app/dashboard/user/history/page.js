"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/user/history");
      setHistory(response.data?.history || response.data || []);
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
        No verification history yet. Start verifying products!
      </p>
    );

  return (
    <AuthGuard allowedRoles={["consumer"]}>
      <DashboardSidebar userRole="consumer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">
            Verification History
          </h1>

          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 flex justify-between items-center hover:shadow-md transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {item.productName || item.code}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    Status:{" "}
                    {item.verificationStatus || item.status || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <button className="px-4 py-2 bg-genuine text-white rounded-lg text-sm hover:bg-green-600 transition font-medium whitespace-nowrap ml-4">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
