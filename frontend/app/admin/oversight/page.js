"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { adminDashboardApi } from "@/services/adminApi";
import { useAdmin } from "@/hooks/useAdmin";
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
  ScatterChart,
  Scatter,
} from "recharts";
import {
  FiRefreshCw,
  FiAlertCircle,
  FiX,
  FiZap,
  FiEye,
  FiCheckCircle,
  FiTrendingUp,
} from "react-icons/fi";

export default function OversightPage() {
  const { adminUser, isHydrated } = useAdmin();

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data
  const [aiHealth, setAiHealth] = useState(null);
  const [confidenceTrend, setConfidenceTrend] = useState(null);
  const [falsePositives, setFalsePositives] = useState(null);
  const [flaggedResults, setFlaggedResults] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  // Fetch AI oversight data
  const fetchOversightData = async () => {
    try {
      setError("");
      const [healthRes, trendRes, fpRes, flagRes] = await Promise.all([
        adminDashboardApi.getAIHealth(),
        adminDashboardApi.getAITrend(30),
        adminDashboardApi.getAIFalsePositives(),
        adminDashboardApi.getAIFlaggedResults(),
      ]);

      setAiHealth(healthRes.data);
      setConfidenceTrend(trendRes.data);
      setFalsePositives(fpRes.data);
      setFlaggedResults(flagRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load AI oversight data",
      );
      console.error("[OVERSIGHT] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isHydrated && adminUser) {
      fetchOversightData();
    }
  }, [isHydrated, adminUser]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiZap className="w-8 h-8 text-blue-600 animate-spin" />
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
                AI Oversight
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor AI system health, confidence levels & false positives
              </p>
            </div>
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await fetchOversightData();
                setIsRefreshing(false);
              }}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
            >
              <FiRefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
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
            className="text-red-600 dark:text-red-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-8 space-y-8">
        {isLoading ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiZap className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* 1. AI HEALTH METRICS */}
            {aiHealth && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  AI System Health
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Overall Score */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                        Overall Confidence
                      </p>
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {aiHealth.overallConfidence?.toFixed(1) || 0}%
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                          style={{
                            width: `${aiHealth.overallConfidence || 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Risk Model */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                        Risk Detection Accuracy
                      </p>
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {aiHealth.riskModelAccuracy?.toFixed(1) || 0}%
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Counterfeit detection rate
                      </p>
                    </div>
                  </div>

                  {/* Hotspot Detection */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                        Hotspot Detection
                      </p>
                      <div className="text-4xl font-bold text-orange-600 mb-2">
                        {aiHealth.hotspotDetectionAccuracy?.toFixed(1) || 0}%
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Cluster identification
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 2. CONFIDENCE TREND */}
            {confidenceTrend && confidenceTrend.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  AI Confidence Trend (30 Days)
                </h2>
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={confidenceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" domain={[0, 100]} />
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
                        dataKey="confidence"
                        stroke="#3b82f6"
                        name="Confidence Score"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="falsePositiveRate"
                        stroke="#ef4444"
                        name="False Positive Rate"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* 3. FALSE POSITIVES BREAKDOWN */}
            {falsePositives && (
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    False Positive Cases
                  </h2>
                  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            This Month
                          </p>
                          <p className="text-2xl font-bold text-red-600">
                            {falsePositives.thisMonth || 0}
                          </p>
                        </div>
                        <FiAlertCircle className="w-8 h-8 text-red-600" />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Last Month
                          </p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {falsePositives.lastMonth || 0}
                          </p>
                        </div>
                        <FiTrendingUp className="w-8 h-8 text-yellow-600" />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            False Positive Rate
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {falsePositives.rate?.toFixed(1) || 0}%
                          </p>
                        </div>
                        <FiEye className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Summary */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Admin Interventions
                  </h2>
                  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-3">
                    <div className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Confirmed Results
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {falsePositives?.confirmedCount || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Admin verified as correct
                      </p>
                    </div>

                    <div className="p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        False Positives Marked
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {falsePositives?.markedFalse || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Admin marked as incorrect
                      </p>
                    </div>

                    <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Needs Review
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {falsePositives?.needsReview || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Flagged for further analysis
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 4. FLAGGED RESULTS QUEUE */}
            {flaggedResults && flaggedResults.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Flagged Results for Human Review
                </h2>
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Product
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            AI Assessment
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Confidence
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Reason Flagged
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {flaggedResults.slice(0, 10).map((result, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                          >
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                              {result.productName}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded ${
                                  result.assessment === "GENUINE"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : result.assessment === "SUSPICIOUS"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}
                              >
                                {result.assessment}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {result.confidence?.toFixed(1) || 0}%
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">
                              {result.flagReason}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded ${
                                  result.reviewStatus === "PENDING"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                }`}
                              >
                                {result.reviewStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {flaggedResults.length > 10 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Showing 10 of {flaggedResults.length} flagged results
                  </p>
                )}
              </section>
            )}

            {/* Empty State */}
            {!aiHealth && !confidenceTrend && (
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
                <FiEye className="w-12 h-12 mx-auto text-gray-400 mb-3 opacity-50" />
                <p className="text-gray-600 dark:text-gray-400">
                  No AI oversight data available
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
