"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";
import api from "@/services/api";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiBarChart2,
  FiTrendingUp,
  FiMapPin,
  FiShield,
  FiFileText,
  FiSettings,
  FiRefreshCw,
  FiAlert,
} from "react-icons/fi";

export default function NAFDACDashboard() {
  const [stats, setStats] = useState({
    totalVerifications: 0,
    suspiciousVerifications: 0,
    reusedCodes: 0,
    unregisteredProducts: 0,
    userReports: 0,
    flaggedManufacturers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([
    "⚠️ Spike in suspicious scans in Lagos (↑ 23% today)",
    "⚠️ Product X flagged 15 times in the last 24 hours",
    "⚠️ Manufacturer Y has abnormal activity pattern detected",
    "🔴 Critical: Reused code detected - 50 scans from same code",
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats from backend
        const response = await api.get("/nafdac/dashboard");
        setStats(response.data);
      } catch (error) {
        console.error("[NAFDAC DASHBOARD] Error fetching data:", error);
        // Use default stats if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const navigationCards = [
    {
      title: "Product Monitoring",
      description: "Monitor all products across system, view risks, and take action",
      href: "/dashboard/nafdac/products",
      icon: FiBarChart2,
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      count: stats.totalVerifications,
    },
    {
      title: "Reports Management",
      description: "Review user-submitted reports of suspicious products",
      href: "/dashboard/nafdac/reports",
      icon: FiFileText,
      color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
      count: stats.userReports,
    },
    {
      title: "Hotspot Intelligence",
      description: "Geographic analysis of suspicious scans and fake drug reports",
      href: "/dashboard/nafdac/hotspots",
      icon: FiMapPin,
      color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    },
    {
      title: "Manufacturer Compliance",
      description: "Monitor manufacturers for suspicious behavior and compliance",
      href: "/dashboard/nafdac/manufacturers",
      icon: FiShield,
      color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      count: stats.flaggedManufacturers,
    },
    {
      title: "Risk Analysis",
      description: "AI-powered risk scoring and threat detection insights",
      href: "/dashboard/nafdac/risk-analysis",
      icon: FiAlert,
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    },
    {
      title: "Audit Logs",
      description: "Complete history of regulatory actions and system changes",
      href: "/dashboard/nafdac/audit-logs",
      icon: FiTrendingUp,
      color: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
    },
  ];

  return (
    <AuthGuard allowedRoles={["NAFDAC"]}>
      <DashboardSidebar userRole="nafdac" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  NAFDAC Regulatory Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Pharmaceutical product verification, threat detection, and compliance oversight
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiRefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Key Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Total Verifications
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {loading ? "-" : stats.totalVerifications}
                  </p>
                </div>
                <FiBarChart2 size={32} className="text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Suspicious Verifications
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {loading ? "-" : stats.suspiciousVerifications}
                  </p>
                </div>
                <FiAlertCircle size={32} className="text-red-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Reused Codes Detected
                  </p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {loading ? "-" : stats.reusedCodes}
                  </p>
                </div>
                <FiAlert size={32} className="text-amber-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Unregistered Products
                  </p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {loading ? "-" : stats.unregisteredProducts}
                  </p>
                </div>
                <FiAlertCircle size={32} className="text-orange-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    User Reports
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {loading ? "-" : stats.userReports}
                  </p>
                </div>
                <FiFileText size={32} className="text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Flagged Manufacturers
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {loading ? "-" : stats.flaggedManufacturers}
                  </p>
                </div>
                <FiShield size={32} className="text-purple-600" />
              </div>
            </div>
          </div>

          {/* Smart Insight Panel */}
          <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiAlert className="text-red-600" />
              Smart Insight Panel - High Priority Alerts
            </h2>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="p-3 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-700"
                >
                  <p className="text-gray-900 dark:text-gray-100">{alert}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Cards */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Regulatory Tools & Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Link key={card.href} href={card.href}>
                  <div
                    className={`${card.color} border rounded-lg p-6 hover:shadow-lg transition cursor-pointer h-full`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <IconComponent size={32} className="text-gray-900 dark:text-white" />
                      {card.count !== undefined && (
                        <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold px-3 py-1 rounded-full">
                          {card.count}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {card.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Information Footer */}
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              About Your Regulatory Dashboard
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              This dashboard gives you complete oversight of pharmaceutical products across Nigeria.
              Monitor products in real-time, analyze geographic hotspots of counterfeit activity,
              track manufacturer compliance, and generate reports for regulatory action.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Key Functions:</strong> Detect counterfeit drugs, identify suspicious patterns,
              flag risky manufacturers, manage user reports, and maintain a complete audit trail of
              all regulatory decisions.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

