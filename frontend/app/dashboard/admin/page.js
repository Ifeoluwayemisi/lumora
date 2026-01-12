"use client";

import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function AdminDashboard() {
  return (
    <AuthGuard allowedRoles={["admin", "nafdac"]}>
      <DashboardSidebar userRole="admin" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Lumora Intelligence Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time analytics and system monitoring
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
            <p className="text-gray-600 dark:text-gray-400">
              Dashboard content will be loaded here with real data from the API.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
