"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function UserDashboardPage() {
  const { user } = useContext(AuthContext);

  // ✅ Default summary ensures .map() works even before API loads
  const [summary, setSummary] = useState({
    stats: {
      total: 0,
      genuine: 0,
      suspicious: 0,
      used: 0,
      favorites: 0,
    },
    recent: [],
  });
  const [loading, setLoading] = useState(true);

  // Check if user is new (created within last hour)
  const isNewUser = () => {
    if (!user?.createdAt) return false;
    const createdAt = new Date(user.createdAt);
    const now = new Date();
    const diffInMinutes = (now - createdAt) / (1000 * 60);
    return diffInMinutes < 60;
  };

  const firstName = user?.name?.split(" ")[0];
  const isNew = isNewUser();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await api.get("/user/dashboard-summary");

        // Ensure all keys exist to avoid undefined.map errors
        setSummary({
          stats: response.data?.stats || {
            total: 0,
            genuine: 0,
            suspicious: 0,
            used: 0,
            favorites: 0,
          },
          recent: response.data?.recent || [],
        });
      } catch (err) {
        console.error("Error fetching dashboard summary:", err);

        // Already safe defaults, but just to be sure
        setSummary({
          stats: {
            total: 0,
            genuine: 0,
            suspicious: 0,
            used: 0,
            favorites: 0,
          },
          recent: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <AuthGuard allowedRoles={["consumer"]}>
      <DashboardSidebar userRole="consumer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isNew ? "Welcome" : "Welcome back"}, {firstName}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View your verification history and product authenticity checks
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Verify CTA */}
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-genuine to-green-600 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Verify a Product</h2>
            <p className="text-green-50 mb-4">
              Check if your products are genuine
            </p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <Link
                href="/verify"
                className="px-6 py-3 bg-gray-700 text-genuine font-semibold rounded-lg hover:bg-gray-500 transition text-center"
              >
                Enter Code Manually
              </Link>
              <Link
                href="/verify/qr"
                className="px-6 py-3 bg-green-700 hover:bg-green-800 text-gray-900 font-semibold rounded-lg transition text-center border border-green-600"
              >
                Scan QR Code
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          {loading ? (
            <p className="text-center dark:text-white mt-6">
              Loading dashboard...
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow border dark:border-gray-600">
                <h2 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Total Verifications
                </h2>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {summary.stats?.total || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow border dark:border-gray-600">
                <h2 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-2">
                  ✅ Genuine Products
                </h2>
                <p className="text-3xl font-bold text-green-600">
                  {summary.stats?.genuine || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow border dark:border-gray-600">
                <h2 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-2">
                  ⚠️ Suspicious/Used
                </h2>
                <p className="text-3xl font-bold text-orange-600">
                  {(summary.stats?.suspicious || 0) +
                    (summary.stats?.used || 0)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow border dark:border-gray-600">
                <h2 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-2">
                  ❤️ Saved Products
                </h2>
                <p className="text-3xl font-bold text-red-600">
                  {summary.stats?.favorites || 0}
                </p>
              </div>
            </div>
          )}

          {/* Recent Verifications */}
          {!loading && summary.recent?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">
                Recent Verifications
              </h2>
              <div className="space-y-3">
                {summary.recent.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 flex justify-between items-center hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Code: {item.code}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 capitalize">
                        Status: {item.verificationState}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/user/history"
                      className="px-4 py-2 bg-genuine text-white rounded-lg text-sm hover:bg-green-600 transition font-medium"
                    >
                      View All
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </AuthGuard>
  );
}
