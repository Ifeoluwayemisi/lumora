"use client";

import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";
import { FiBarChart3, FiTrendingUp, FiSettings, FiActivity } from "react-icons/fi";

export default function AdminDashboard() {
  const dashboards = [
    {
      title: "Category Distribution",
      description: "Monitor manufacturer distribution across product categories",
      href: "/dashboard/admin/analytics/category-distribution",
      icon: FiBarChart3,
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    },
    {
      title: "Agency Reports",
      description: "Detailed analysis of flagged codes by regulatory agency",
      href: "/dashboard/admin/analytics/agencies",
      icon: FiTrendingUp,
      color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    },
    {
      title: "Rate Limiting & Webhooks",
      description: "Configure per-agency rate limits and webhook notifications",
      href: "/dashboard/admin/analytics/rate-limiting",
      icon: FiSettings,
      color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    },
  ];

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
              Real-time analytics, agency monitoring, and system management
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => {
              const IconComponent = dashboard.icon;
              return (
                <Link key={dashboard.href} href={dashboard.href}>
                  <div
                    className={`${dashboard.color} border rounded-lg p-6 hover:shadow-lg transition cursor-pointer`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent size={24} className="text-gray-900 dark:text-white" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {dashboard.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {dashboard.description}
                        </p>
                      </div>
                      <span className="text-2xl text-gray-400 dark:text-gray-600">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              System Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Navigate to any dashboard above to view detailed analytics, agency reports, and system configuration.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
