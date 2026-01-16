"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
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

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, hotspotsRes] = await Promise.all([
        api.get("/manufacturer/analytics"),
        api.get("/manufacturer/analytics/hotspots"),
      ]);

      setAnalytics(analyticsRes.data?.data);
      setHotspots(hotspotsRes.data?.data || []);
    } catch (err) {
      console.error("[FETCH_ANALYTICS] Error:", err);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const response = await api.get(
        `/manufacturer/analytics/export?format=${format}`,
        {
          responseType: format === "json" ? "json" : "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `analytics.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error("[EXPORT] Error:", err);
      toast.error("Failed to export analytics");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const verificationTrends = analytics?.verificationTrends || [];
  const verificationByStatus = analytics?.verificationByStatus || [];
  const codeMetrics = analytics?.codeMetrics || [];
  const suspiciousTrends = analytics?.suspiciousTrends || [];
  const manufacturer = analytics?.manufacturer;

  // Prepare chart data
  const trendData = verificationTrends.map((item) => ({
    date: new Date(item.createdAt).toLocaleDateString(),
    verifications: item._count.id,
  }));

  const statusData = verificationByStatus.map((item) => ({
    name: item.verificationState,
    value: item._count.id,
  }));

  const codeData = codeMetrics.map((item) => ({
    name: item.status,
    value: item._count.id,
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <>
      <DashboardSidebar userRole="manufacturer" />
      <MobileBottomNav userRole="manufacturer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 pt-12 md:pt-16">
          <Link
            href="/dashboard/manufacturer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 font-medium mb-6"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics & Insights
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered verification analytics and hotspot predictions
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleExport("csv")}
                disabled={exporting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FiDownload /> CSV
              </button>
              <button
                onClick={() => handleExport("json")}
                disabled={exporting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FiDownload /> JSON
              </button>
            </div>
          </div>

          {/* Risk Score & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Trust Score
              </p>
              <p className="text-4xl font-bold text-blue-600">
                {manufacturer?.trustScore || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Higher is better</p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Risk Level
              </p>
              <p
                className={`text-3xl font-bold ${
                  manufacturer?.riskLevel === "LOW"
                    ? "text-green-600"
                    : manufacturer?.riskLevel === "MEDIUM"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {manufacturer?.riskLevel || "N/A"}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Active Products
              </p>
              <p className="text-4xl font-bold text-purple-600">
                {manufacturer?._count?.products || 0}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Verification Trend */}
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Verification Trend (30 days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="verifications"
                    stroke="#3b82f6"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Verification Status Distribution */}
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Verification Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Code Status */}
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Code Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={codeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Verification Locations */}
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Verification Locations
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {hotspots.slice(0, 10).map((spot, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {spot.city}, {spot.state}, {spot.country}
                      </p>
                      <p className="text-xs text-gray-500">
                        ({spot.lat}, {spot.lng})
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      {spot.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Suspicious Activity */}
          {suspiciousTrends.length > 0 && (
            <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-4">
                🚨 Recent Suspicious Activity
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {suspiciousTrends.slice(0, 10).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.codeValue}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.verificationState}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
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
