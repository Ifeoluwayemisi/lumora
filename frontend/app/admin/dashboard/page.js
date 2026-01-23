"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminDashboardApi } from "@/services/adminApi";
import { useAdmin } from "@/hooks/useAdmin";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiMapPin,
  FiZap,
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { adminUser, isHydrated } = useAdmin();

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dashboard data
  const [metrics, setMetrics] = useState(null);
  const [authenticity, setAuthenticity] = useState(null);
  const [trend, setTrend] = useState(null);
  const [hotspots, setHotspots] = useState(null);
  const [highRiskMfg, setHighRiskMfg] = useState(null);
  const [aiHealth, setAiHealth] = useState(null);
  const [alerts, setAlerts] = useState(null);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setError("");
      const [
        metricsRes,
        authRes,
        trendRes,
        hotspotsRes,
        mfgRes,
        aiRes,
        alertsRes,
      ] = await Promise.all([
        adminDashboardApi.getMetrics("alltime"),
        adminDashboardApi.getAuthenticityBreakdown(),
        adminDashboardApi.getTrend(30),
        adminDashboardApi.getHotspots(),
        adminDashboardApi.getHighRiskManufacturers(),
        adminDashboardApi.getAIHealth(),
        adminDashboardApi.getAlerts(),
      ]);

      setMetrics(metricsRes.data);
      setAuthenticity(authRes.data);
      setTrend(trendRes.data);
      setHotspots(hotspotsRes.data);
      setHighRiskMfg(mfgRes.data);
      setAiHealth(aiRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
      console.error("[DASHBOARD] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isHydrated && adminUser) {
      fetchDashboardData();
    }
  }, [isHydrated, adminUser]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  // Export handler
  const handleExport = async () => {
    try {
      await adminDashboardApi.exportDashboard();
      // Typically this returns a file - handle accordingly
    } catch (err) {
      setError("Failed to export dashboard");
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <FiZap className="w-8 h-8 text-blue-600" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton loading */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 animate-pulse h-24 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time system oversight & counterfeit radar
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
              >
                <FiRefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={handleExport}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <FiDownload className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-600 dark:text-red-200 hover:text-red-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-8 space-y-8">
        {/* 1. KEY METRICS */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Key Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Verifications */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Total Verifications
                </span>
                <FiCheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {metrics?.totalVerifications?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Today: {metrics?.todayVerifications || 0}
              </p>
            </div>

            {/* Genuine Products */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Genuine Products
                </span>
                <FiCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">
                {metrics?.genuineCount?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {metrics?.genuinePercentage || 0}% of total
              </p>
            </div>

            {/* Suspicious Products */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Suspicious Products
                </span>
                <FiAlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-600">
                {metrics?.suspiciousCount?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {metrics?.suspiciousPercentage || 0}% flagged
              </p>
            </div>

            {/* Counterfeit Detected */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Counterfeit Detected
                </span>
                <FiX className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-600">
                {metrics?.counterfeits?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {metrics?.counterfeitPercentage || 0}% invalid
              </p>
            </div>
          </div>
        </section>

        {/* 2. VERIFICATION TREND (30-day) */}
        {trend && trend.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Verification Trend (30 Days)
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="genuine"
                    stroke="#10b981"
                    name="Genuine"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="suspicious"
                    stroke="#f59e0b"
                    name="Suspicious"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="counterfeit"
                    stroke="#ef4444"
                    name="Counterfeit"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* 3. AUTHENTICITY BREAKDOWN */}
        {authenticity && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Authenticity Distribution
              </h2>
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Genuine",
                          value: authenticity.genuine,
                          fill: "#10b981",
                        },
                        {
                          name: "Suspicious",
                          value: authenticity.suspicious,
                          fill: "#f59e0b",
                        },
                        {
                          name: "Counterfeit",
                          value: authenticity.counterfeit,
                          fill: "#ef4444",
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI HEALTH */}
            {aiHealth && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  AI System Health
                </h2>
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Overall Confidence
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {aiHealth.overallConfidence?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                          style={{
                            width: `${aiHealth.overallConfidence || 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Model Status */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Risk Model
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {aiHealth.riskModelAccuracy?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Hotspot Detection
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {aiHealth.hotspotDetectionAccuracy?.toFixed(1) || 0}%
                        </p>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last updated:{" "}
                      {aiHealth.lastUpdated
                        ? new Date(aiHealth.lastUpdated).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 4. COUNTERFEIT HOTSPOTS (Geographic) */}
        {hotspots && hotspots.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiMapPin className="w-5 h-5 text-red-600" />
              Counterfeit Hotspots (Nigeria)
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Location
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Suspicious Cases
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Risk Level
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotspots.slice(0, 10).map((spot, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {spot.state}, {spot.lga}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                          {spot.count}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              spot.riskLevel === "CRITICAL"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : spot.riskLevel === "HIGH"
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {spot.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 5. HIGH-RISK MANUFACTURERS */}
        {highRiskMfg && highRiskMfg.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              High-Risk Manufacturers
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {highRiskMfg.slice(0, 6).map((mfg, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {mfg.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {mfg.email}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-semibold rounded">
                      Risk: {mfg.riskScore}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Suspicious verifications: {mfg.suspiciousCount}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. CRITICAL ALERTS */}
        {alerts && alerts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Critical Alerts
            </h2>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === "CRITICAL"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                      : alert.severity === "HIGH"
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500"
                        : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                  }`}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {alert.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {alert.createdAt
                      ? new Date(alert.createdAt).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
