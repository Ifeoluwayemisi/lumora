"use client";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";

/**
 * Manufacturer Dashboard Home
 *
 * Overview & Quick Actions for manufacturers
 *
 * Features:
 * - Account verification status with visual badges
 * - Summary statistics (products, codes, verifications)
 * - Daily quota progress bar with plan limits
 * - Quick action buttons (generate codes, upload docs, etc)
 * - Recent verification alerts & suspicious activities
 * - Plan information & upgrade CTA
 * - Trust score & risk level indicators
 */

export default function ManufacturerDashboard() {
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/manufacturer/dashboard");
        setDashboard(response.data);
      } catch (err) {
        console.error("[DASHBOARD] Error:", err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="p-4 pt-12 md:pt-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );

  if (!dashboard)
    return (
      <div className="p-4 pt-12 md:pt-16">
        <p className="text-center text-red-600 dark:text-red-400">
          Failed to load dashboard
        </p>
      </div>
    );

  const { manufacturer, stats, quota, recentAlerts, plan } = dashboard;

  const isVerified = manufacturer?.verified;
  const accountStatus = manufacturer?.accountStatus;
  const quotaPercentage = (quota?.used / quota?.limit) * 100;
  const quotaRemaining = quota?.limit - quota?.used;

  return (
    <>
      <DashboardSidebar userRole="manufacturer" />
      <MobileBottomNav userRole="manufacturer" />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 pt-12 md:pt-16">{/* Content */}
      {/* Header with Status Badge */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {manufacturer?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Protect your brand with verification codes and AI-powered insights
            </p>
          </div>

          {/* Status Badge */}
          <div
            className={`px-4 py-3 rounded-xl font-semibold text-white text-center ${
              isVerified
                ? "bg-gradient-to-r from-genuine to-green-600"
                : accountStatus === "pending_verification"
                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                : "bg-gradient-to-r from-red-500 to-red-600"
            }`}
          >
            {isVerified ? (
              <div>
                <div className="text-2xl">✓</div>
                <div className="text-sm">Verified</div>
              </div>
            ) : accountStatus === "pending_verification" ? (
              <div>
                <div className="text-2xl">⏳</div>
                <div className="text-sm">Pending Review</div>
              </div>
            ) : (
              <div>
                <div className="text-2xl">✗</div>
                <div className="text-sm">Rejected</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Verification Alert */}
      {!isVerified && accountStatus === "pending_verification" && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                Verification Pending
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-3">
                Your account is under review by our NAFDAC team. You cannot
                generate codes yet, but you can upload additional documents to
                expedite the process.
              </p>
              <Link
                href="/dashboard/manufacturer/profile"
                className="inline-block px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Manage Documents
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Products */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Products
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.totalProducts || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8-4m0 0v10l-8 4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Batches */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Batches
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.totalBatches || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4h4m-6 4h.01M9 16h.01"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Codes Generated */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Codes Generated
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.totalCodes || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Verifications */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Verifications
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.totalVerifications || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Suspicious Attempts */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Suspicious Attempts
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats?.suspiciousAttempts || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0-6V7a4 4 0 118 0v6a1 1 0 11-2 0V8a2 2 0 10-4 0v6a3 3 0 11-6 0v-2m0-4V7a2 2 0 012-2h4a2 2 0 012 2v2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quota Progress */}
      {isVerified && (
        <div className="mb-8 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Daily Code Quota
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {quota?.used} of {quota?.limit} codes used today •{" "}
                {quotaRemaining} remaining
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(quotaPercentage)}%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Used</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                quotaPercentage < 50
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : quotaPercentage < 80
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                  : "bg-gradient-to-r from-red-500 to-red-600"
              }`}
              style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
            ></div>
          </div>

          {/* Plan Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Current Plan
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {plan?.name || "Basic"}
              </p>
            </div>
            {plan?.type === "basic" && (
              <Link
                href="/dashboard/manufacturer/billing"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {isVerified ? (
          <>
            <Link
              href="/dashboard/manufacturer/batches"
              className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all group"
            >
              <div className="p-3 rounded-lg bg-blue-600 w-fit mb-3 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Generate Codes
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Create and download verification codes
              </p>
            </Link>

            <Link
              href="/dashboard/manufacturer/products"
              className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all group"
            >
              <div className="p-3 rounded-lg bg-green-600 w-fit mb-3 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8-4m0 0v10l-8 4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Manage Products
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Add and update your products
              </p>
            </Link>

            <Link
              href="/dashboard/manufacturer/analytics"
              className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all group"
            >
              <div className="p-3 rounded-lg bg-purple-600 w-fit mb-3 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                View Analytics
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                See AI insights and reports
              </p>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/dashboard/manufacturer/profile"
              className="p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30 border border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all group"
            >
              <div className="p-3 rounded-lg bg-yellow-600 w-fit mb-3 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Upload Documents
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Complete verification process
              </p>
            </Link>

            <Link
              href="/dashboard/manufacturer/profile"
              className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all group"
            >
              <div className="p-3 rounded-lg bg-blue-600 w-fit mb-3 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                View Status
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Check verification progress
              </p>
            </Link>

            <Link
              href="/dashboard/manufacturer/profile"
              className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all group"
            >
              <div className="p-3 rounded-lg bg-purple-600 w-fit mb-3 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Contact Support
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Get help from our team
              </p>
            </Link>
          </>
        )}
      </div>

      {/* Recent Alerts */}
      {recentAlerts && recentAlerts.length > 0 && (
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Alerts
          </h3>
          <div className="space-y-3">
            {recentAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  alert.severity === "high"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : alert.severity === "medium"
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                }`}
              >
                <div
                  className={`flex-shrink-0 mt-0.5 ${
                    alert.severity === "high"
                      ? "text-red-600"
                      : alert.severity === "medium"
                      ? "text-yellow-600"
                      : "text-blue-600"
                  }`}
                >
                  {alert.severity === "high" && "🔴"}
                  {alert.severity === "medium" && "🟡"}
                  {alert.severity === "low" && "🔵"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {alert.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {alert.message}
                  </p>
                  {alert.timestamp && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(alert.timestamp).toLocaleDateString()}{" "}
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
}
