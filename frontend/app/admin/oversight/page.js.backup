"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { adminDashboardApi } from "@/services/adminApi";
import {
  AdminCard,
  AdminLoadingSpinner,
  AdminErrorMessage,
  AdminBadge,
} from "@/components/admin/AdminComponents";
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
import {
  FiRefreshCw,
  FiAlertTriangle,
  FiTrendingUp,
  FiZap,
  FiCheckCircle,
} from "react-icons/fi";

export default function AIOverSightPage() {
  const [aiMetrics, setAiMetrics] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [confidenceTrend, setConfidenceTrend] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAIMetrics();
  }, []);

  const fetchAIMetrics = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [metricsData, anomaliesData, performanceData, trendData] =
        await Promise.all([
          adminDashboardApi.getAIHealth(),
          adminDashboardApi.getAnomalies(),
          adminDashboardApi.getAIPerformance(),
          adminDashboardApi.getConfidenceTrend(),
        ]);

      setAiMetrics(metricsData);
      setAnomalies(anomaliesData);
      setPerformance(performanceData);
      setConfidenceTrend(trendData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load AI metrics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <AdminLoadingSpinner />;

  const anomalyData = anomalies
    ? [
        { name: "Normal", value: anomalies.normal, color: "#10B981" },
        { name: "Suspicious", value: anomalies.suspicious, color: "#F59E0B" },
        { name: "Critical", value: anomalies.critical, color: "#EF4444" },
      ]
    : [];

  const performanceData = performance
    ? [
        { name: "Accuracy", value: performance.accuracy },
        { name: "Precision", value: performance.precision },
        { name: "Recall", value: performance.recall },
        { name: "F1 Score", value: performance.f1Score },
      ]
    : [];

  return (
    <div className="space-y-6">
      {error && <AdminErrorMessage message={error} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Oversight</h1>
          <p className="text-gray-600 mt-1">
            Monitor AI system health and performance
          </p>
        </div>
        <button
          onClick={fetchAIMetrics}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <FiRefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Health Score */}
      {aiMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Overall Health</p>
                <p className="text-4xl font-bold mt-2">
                  {aiMetrics.overallScore}
                </p>
                <p className="text-blue-200 text-sm mt-1">/100</p>
              </div>
              <FiZap size={48} className="opacity-20" />
            </div>
          </div>

          <AdminCard
            title="Confidence"
            value={`${aiMetrics.confidence}%`}
            icon={FiCheckCircle}
            trend={5}
          />

          <AdminCard
            title="False Positives"
            value={`${aiMetrics.falsePositiveRate}%`}
            icon={FiAlertTriangle}
            trend={-2}
          />

          <AdminCard
            title="Model Status"
            value={aiMetrics.modelStatus}
            icon={FiTrendingUp}
          />
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anomaly Detection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Anomaly Distribution
          </h2>
          {anomalyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={anomalyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {anomalyData.map((entry, index) => (
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

        {/* Performance Metrics */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            AI Performance Metrics
          </h2>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                  domain={[0, 100]}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-12">No data available</p>
          )}
        </div>
      </div>

      {/* Confidence Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Model Confidence Trend (30 Days)
        </h2>
        {confidenceTrend && confidenceTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={confidenceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#9CA3AF"
                domain={[0, 100]}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#2563EB"
                strokeWidth={2}
                name="Confidence %"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#10B981"
                strokeWidth={2}
                name="Accuracy %"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600 text-center py-12">No data available</p>
        )}
      </div>

      {/* Alerts and Issues */}
      {anomalies && anomalies.criticalAlerts && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            <FiAlertTriangle className="inline mr-2 text-red-600" />
            Critical Alerts
          </h2>
          {anomalies.criticalAlerts.length > 0 ? (
            <div className="space-y-3">
              {anomalies.criticalAlerts.slice(0, 5).map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-1">
                    <FiAlertTriangle className="text-red-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {alert.message}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Severity: {alert.severity} | Time:{" "}
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <AdminBadge variant="danger">{alert.type}</AdminBadge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No critical alerts</p>
          )}
        </div>
      )}

      {/* Detailed Metrics */}
      {aiMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Model Version</p>
            <p className="text-2xl font-bold text-gray-900">
              {aiMetrics.modelVersion}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Last Training</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(aiMetrics.lastTrainingDate).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Total Predictions</p>
            <p className="text-2xl font-bold text-gray-900">
              {(aiMetrics.totalPredictions / 1000).toFixed(1)}K
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Prediction Time (avg)</p>
            <p className="text-2xl font-bold text-gray-900">
              {aiMetrics.avgPredictionTime}ms
            </p>
          </div>
        </div>
      )}

      {/* System Status */}
      {aiMetrics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-semibold">API Status</span>
              <AdminBadge
                variant={
                  aiMetrics.apiStatus === "healthy" ? "success" : "danger"
                }
              >
                {aiMetrics.apiStatus}
              </AdminBadge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-semibold">
                Database Status
              </span>
              <AdminBadge
                variant={
                  aiMetrics.dbStatus === "healthy" ? "success" : "danger"
                }
              >
                {aiMetrics.dbStatus}
              </AdminBadge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-semibold">Cache Status</span>
              <AdminBadge
                variant={
                  aiMetrics.cacheStatus === "healthy" ? "success" : "danger"
                }
              >
                {aiMetrics.cacheStatus}
              </AdminBadge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-semibold">Queue Status</span>
              <AdminBadge
                variant={
                  aiMetrics.queueStatus === "healthy" ? "success" : "danger"
                }
              >
                {aiMetrics.queueStatus}
              </AdminBadge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
