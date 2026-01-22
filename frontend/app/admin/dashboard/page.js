"use client";

import { useState, useEffect } from "react";
import { adminDashboardApi } from "@/services/adminApi";
import {
  AdminCard,
  AdminLoadingSpinner,
  AdminErrorMessage,
  AdminBadge,
} from "@/components/admin/AdminComponents";
import {
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiMapPin,
  FiZap,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [authenticity, setAuthenticity] = useState(null);
  const [trend, setTrend] = useState(null);
  const [hotspots, setHotspots] = useState(null);
  const [highRisk, setHighRisk] = useState(null);
  const [aiHealth, setAiHealth] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("today");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [
          metricsData,
          authenticityData,
          trendData,
          hotspotsData,
          highRiskData,
          aiHealthData,
          alertsData,
        ] = await Promise.all([
          adminDashboardApi.getMetrics(period),
          adminDashboardApi.getAuthenticityBreakdown(),
          adminDashboardApi.getTrend(),
          adminDashboardApi.getHotspots(),
          adminDashboardApi.getHighRiskManufacturers(),
          adminDashboardApi.getAIHealth(),
          adminDashboardApi.getAlerts(),
        ]);

        setMetrics(metricsData);
        setAuthenticity(authenticityData);
        setTrend(trendData);
        setHotspots(hotspotsData);
        setHighRisk(highRiskData);
        setAiHealth(aiHealthData);
        setAlerts(alertsData);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [period]);

  if (isLoading) return <AdminLoadingSpinner />;

  const currentMetrics = metrics?.[period] || metrics?.alltime || {};
  const authenticityData = authenticity
    ? [
        { name: "Genuine", value: authenticity.genuine, color: "#10B981" },
        {
          name: "Suspicious",
          value: authenticity.suspicious,
          color: "#F59E0B",
        },
        { name: "Invalid", value: authenticity.invalid, color: "#EF4444" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {error && <AdminErrorMessage message={error} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Nigeria Counterfeit Detection System
          </p>
        </div>
        <div className="flex gap-2">
          {["today", "7days", "alltime"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p === "today" ? "Today" : p === "7days" ? "7 Days" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard
          title="Total Verifications"
          value={currentMetrics.totalVerifications?.toLocaleString() || "0"}
          icon={FiTrendingUp}
          trend={12}
        />
        <AdminCard
          title="Verified Products"
          value={currentMetrics.verified?.toLocaleString() || "0"}
          icon={FiCheckCircle}
          trend={8}
        />
        <AdminCard
          title="Suspicious"
          value={currentMetrics.suspicious?.toLocaleString() || "0"}
          icon={FiAlertCircle}
          className="border-l-4 border-yellow-500"
          trend={-3}
        />
        <AdminCard
          title="Invalid"
          value={currentMetrics.invalid?.toLocaleString() || "0"}
          icon={FiX}
          className="border-l-4 border-red-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Authenticity Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Authenticity Breakdown
          </h2>
          {authenticityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={authenticityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {authenticityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-12">No data available</p>
          )}
        </div>

        {/* High Risk Manufacturers */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            High Risk Manufacturers
          </h2>
          {highRisk && highRisk.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {highRisk.slice(0, 8).map((mfg) => (
                <div
                  key={mfg.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{mfg.name}</p>
                    <p className="text-xs text-gray-600">ID: {mfg.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">
                      {mfg.riskScore}
                    </p>
                    <p className="text-xs text-gray-600">Risk Score</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-12">
              No high-risk manufacturers
            </p>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Trend */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            30-Day Verification Trend
          </h2>
          {trend && trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563EB"
                  strokeWidth={2}
                  name="Verifications"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-12">No data available</p>
          )}
        </div>

        {/* AI Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            AI Health Score
          </h2>
          {aiHealth ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                  <span className="text-4xl font-bold text-white">
                    {aiHealth.overallScore}
                  </span>
                  <span className="text-lg text-blue-100">/100</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Confidence
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {aiHealth.confidence}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    False Positive Rate
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {aiHealth.falsePositiveRate}%
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-12">No data available</p>
          )}
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiZap className="text-yellow-500" />
          Critical Alerts
        </h2>
        {alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex-shrink-0 mt-1">
                  <FiAlertCircle className="text-yellow-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.type}</p>
                </div>
                <AdminBadge variant="warning">{alert.severity}</AdminBadge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No critical alerts</p>
        )}
      </div>

      {/* Hotspots Map */}
      {hotspots && hotspots.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiMapPin className="text-blue-600" />
            Geographic Hotspots
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotspots.slice(0, 6).map((hotspot, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">
                  {hotspot.location}
                </p>
                <p className="text-sm text-gray-600">
                  {hotspot.latitude.toFixed(4)}°N,{" "}
                  {hotspot.longitude.toFixed(4)}°E
                </p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {hotspot.suspiciousCount} reports
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
