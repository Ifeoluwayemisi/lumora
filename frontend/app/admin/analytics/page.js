"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../../services/api";
import {
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiUsers,
  FiBriefcase,
} from "react-icons/fi";

const COLORS = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
  UNKNOWN: "#6b7280",
};

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [products, setProducts] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [trends, setTrends] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState(null);
  const [statusDistribution, setStatusDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [
          dashboardRes,
          hotspotsRes,
          productsRes,
          manufacturersRes,
          trendsRes,
          riskRes,
          statusRes,
        ] = await Promise.all([
          api.get("/api/analytics/dashboard"),
          api.get("/api/analytics/hotspots?limit=10"),
          api.get("/api/analytics/products?limit=10"),
          api.get("/api/analytics/manufacturers?limit=10"),
          api.get("/api/analytics/trends?days=30"),
          api.get("/api/analytics/risk-distribution"),
          api.get("/api/analytics/status-distribution"),
        ]);

        setDashboard(dashboardRes.data.data);
        setHotspots(hotspotsRes.data.data);
        setProducts(productsRes.data.data);
        setManufacturers(manufacturersRes.data.data);
        setTrends(trendsRes.data.data);
        setRiskDistribution(riskRes.data.data);
        setStatusDistribution(statusRes.data.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time insights into counterfeit product detection
          </p>
        </div>

        {/* KPI Cards */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard
              icon={<FiActivity />}
              label="Total Reports"
              value={dashboard.totalReports}
              color="blue"
            />
            <KpiCard
              icon={<FiAlertTriangle />}
              label="Counterfeit Reports"
              value={dashboard.counterfeitReports}
              subtext={`${dashboard.counterfeitRate}%`}
              color="red"
            />
            <KpiCard
              icon={<FiCheckCircle />}
              label="Resolved"
              value={dashboard.resolvedReports}
              subtext={`${dashboard.averageResolutionRate}%`}
              color="green"
            />
            <KpiCard
              icon={<FiClock />}
              label="Pending"
              value={dashboard.pendingReports}
              color="yellow"
            />
            <KpiCard
              icon={<FiUsers />}
              label="Reporters"
              value={dashboard.uniqueReporters}
              color="purple"
            />
            <KpiCard
              icon={<FiBriefcase />}
              label="Manufacturers"
              value={dashboard.uniqueManufacturers}
              color="indigo"
            />
            <KpiCard
              icon={<FiTrendingUp />}
              label="Health Alerts"
              value={dashboard.healthAlertCount}
              color="orange"
            />
          </div>
        )}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Risk Distribution */}
          {riskDistribution && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Risk Level Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(riskDistribution)
                      .filter(([k]) => k !== "total")
                      .map(([level, data]) => ({
                        name: level,
                        value: data.count,
                      }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.keys(riskDistribution)
                      .filter((k) => k !== "total")
                      .map((level) => (
                        <Cell key={level} fill={COLORS[level] || "#6b7280"} />
                      ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Status Distribution */}
          {statusDistribution && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Report Status Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(statusDistribution)
                    .filter(([k]) => k !== "total")
                    .map(([status, data]) => ({
                      name: status,
                      count: data.count,
                    }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trends */}
          {trends.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                30-Day Report Trends
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="counterfeit"
                    stroke="#ef4444"
                    name="Counterfeit"
                  />
                  <Line
                    type="monotone"
                    dataKey="genuine"
                    stroke="#22c55e"
                    name="Genuine"
                  />
                  <Line
                    type="monotone"
                    dataKey="suspicious"
                    stroke="#f97316"
                    name="Suspicious"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Manufacturers by Counterfeits */}
          {manufacturers.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Top Manufacturers by Counterfeits
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={manufacturers.slice(0, 5).map((m) => ({
                    name: m.name.substring(0, 15),
                    rate: m.counterfeitRate,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip label="Counterfeit Rate %" />
                  <Bar dataKey="rate" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Counterfeit Products */}
          {products.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Top Counterfeit Products
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Product</th>
                      <th className="text-right py-2 px-2">Rate</th>
                      <th className="text-right py-2 px-2">Reports</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 10).map((p) => (
                      <tr key={p.name} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 truncate">{p.name}</td>
                        <td className="text-right py-2 px-2">
                          <span
                            className={`font-semibold ${
                              p.counterfeitRate > 50
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          >
                            {p.counterfeitRate}%
                          </span>
                        </td>
                        <td className="text-right py-2 px-2 text-gray-600">
                          {p.totalReports}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Counterfeit Hotspots */}
          {hotspots.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Counterfeit Hotspots
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {hotspots.slice(0, 10).map((h, idx) => (
                  <div
                    key={idx}
                    className="border rounded p-3 hover:bg-gray-50"
                  >
                    <div className="font-semibold text-gray-900">
                      {h.location || "Unknown Location"}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>{h.reportCount} reports</span>
                      {h.criticalCount > 0 && (
                        <span className="text-red-600 font-semibold">
                          {h.criticalCount} critical
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {h.latitude}, {h.longitude}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * KPI Card Component
 */
function KpiCard({ icon, label, value, subtext, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color] || colorClasses.blue}`}
      >
        <div className="text-2xl">{icon}</div>
      </div>
      <p className="text-gray-600 text-sm">{label}</p>
      <div className="flex items-baseline mt-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-sm text-gray-500 ml-2">{subtext}</p>}
      </div>
    </div>
  );
}
