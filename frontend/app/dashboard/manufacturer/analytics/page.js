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
  const [trustMetrics, setTrustMetrics] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [alertSummary, setAlertSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, hotspotsRes, trustRes, trendRes, alertRes] =
        await Promise.all([
          api.get("/manufacturer/analytics"),
          api.get("/manufacturer/analytics/hotspots"),
          api.get("/manufacturer/analytics/trust-metrics"),
          api.get("/manufacturer/analytics/authenticity-trend?days=30"),
          api.get("/manufacturer/analytics/alert-summary"),
        ]);

      setAnalytics(analyticsRes.data?.data);
      setHotspots(hotspotsRes.data?.data || []);
      setTrustMetrics(trustRes.data?.data);
      setTrendData(trendRes.data?.data || []);
      setAlertSummary(alertRes.data?.data);
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
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", `analytics.${format}`);
      document.body.appendChild(link);
      link.click();

      // Clean up with setTimeout to ensure click is processed
      setTimeout(() => {
        try {
          document.body.removeChild(link);
        } catch (e) {
          console.warn("Could not remove download link:", e);
        }
        window.URL.revokeObjectURL(url);
      }, 100);

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

          {/* PHASE 2: Trust Metrics & Alert Summary */}
          {trustMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Trust Badge */}
              <div
                className={`p-6 rounded-xl shadow-sm border ${
                  trustMetrics.trustBadge === "ELITE"
                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                    : trustMetrics.trustBadge === "VERIFIED"
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : trustMetrics.trustBadge === "TRUSTED"
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                        : trustMetrics.trustBadge === "CAUTION"
                          ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Manufacturer Trust
                  </h3>
                  <span
                    className={`text-2xl ${
                      trustMetrics.trustBadge === "ELITE"
                        ? "text-purple-600"
                        : trustMetrics.trustBadge === "VERIFIED"
                          ? "text-green-600"
                          : trustMetrics.trustBadge === "TRUSTED"
                            ? "text-blue-600"
                            : trustMetrics.trustBadge === "CAUTION"
                              ? "text-yellow-600"
                              : "text-red-600"
                    }`}
                  >
                    {trustMetrics.trustBadge === "ELITE" && "🏆"}
                    {trustMetrics.trustBadge === "VERIFIED" && "✅"}
                    {trustMetrics.trustBadge === "TRUSTED" && "⭐"}
                    {trustMetrics.trustBadge === "CAUTION" && "⚠️"}
                    {trustMetrics.trustBadge === "AT_RISK" && "🚨"}
                  </span>
                </div>
                <p
                  className={`text-3xl font-bold mb-2 ${
                    trustMetrics.trustBadge === "ELITE"
                      ? "text-purple-600"
                      : trustMetrics.trustBadge === "VERIFIED"
                        ? "text-green-600"
                        : trustMetrics.trustBadge === "TRUSTED"
                          ? "text-blue-600"
                          : trustMetrics.trustBadge === "CAUTION"
                            ? "text-yellow-600"
                            : "text-red-600"
                  }`}
                >
                  {trustMetrics.overallAuthenticity}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Overall Authenticity
                </p>
                <p className="text-xs text-gray-500">{trustMetrics.message}</p>
              </div>

              {/* Alert Summary */}
              {alertSummary && (
                <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Alert Status
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {alertSummary.bySeverity.critical}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Critical
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {alertSummary.bySeverity.high}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        High
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {alertSummary.bySeverity.medium}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Medium
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {alertSummary.totalAlerts} total alerts
                    {alertSummary.lastAlert && (
                      <>
                        <br />
                        Last:{" "}
                        {new Date(alertSummary.lastAlert).toLocaleDateString()}
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PHASE 2: 30-Day Authenticity Trend */}
          {trendData.length > 0 && (
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                30-Day Authenticity Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="authenticity"
                    stroke="#10b981"
                    name="Authenticity %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Risk Score & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Trust Score
              </p>
              <p className="text-4xl font-bold text-blue-600">
                {trustMetrics?.trustScore || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Higher is better</p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Risk Level
              </p>
              <p
                className={`text-3xl font-bold ${
                  trustMetrics?.trustLevel === "VERIFIED_SELLER" ||
                  trustMetrics?.trustLevel === "ELITE_SELLER"
                    ? "text-green-600"
                    : trustMetrics?.trustLevel === "TRUSTED_SELLER" ||
                        trustMetrics?.trustLevel === "MONITOR"
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
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {spot.city}, {spot.state}, {spot.country}
                      </p>
                      <p className="text-xs text-gray-500">
                        ({spot.lat.toFixed(4)}, {spot.lng.toFixed(4)})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        {spot.frequency}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedHotspot(spot);
                          setShowMapModal(true);
                        }}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        📍 Map
                      </button>
                    </div>
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

          {/* Location Map Modal */}
          {showMapModal && selectedHotspot && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    📍 {selectedHotspot.city}, {selectedHotspot.state}, {selectedHotspot.country}
                  </h2>
                  <button
                    onClick={() => setShowMapModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6">
                  {/* Google Map Embed */}
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="400"
                      frameBorder="0"
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.3${Math.random().toString().slice(2, 10)}!2d${selectedHotspot.lng}!3d${selectedHotspot.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2z${selectedHotspot.lat.toFixed(4)},${selectedHotspot.lng.toFixed(4)}!5e0!3m2!1sen!2sng!4v${Date.now()}`}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Verification Location"
                    />
                  </div>

                  {/* Location Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">City</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedHotspot.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">State</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedHotspot.state}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Country</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedHotspot.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Verifications</p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {selectedHotspot.frequency}
                      </p>
                    </div>
                  </div>

                  {/* GPS Coordinates */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">GPS Coordinates</p>
                    <p className="text-lg font-mono text-gray-900 dark:text-white">
                      {selectedHotspot.lat.toFixed(6)}, {selectedHotspot.lng.toFixed(6)}
                    </p>
                  </div>

                  {/* Direct Google Maps Link */}
                  <a
                    href={`https://www.google.com/maps?q=${selectedHotspot.lat},${selectedHotspot.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full text-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    🔗 Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
