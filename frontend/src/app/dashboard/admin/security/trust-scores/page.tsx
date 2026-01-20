"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface TrustScoreData {
  id: string;
  manufacturerName: string;
  trustScore: number;
  components: {
    verification: number;
    payment: number;
    compliance: number;
    activity: number;
    quality: number;
  };
  trend: "IMPROVING" | "STABLE" | "DECLINING";
  lastAssessment: string;
}

export default function TrustScoresPage() {
  const [manufacturers, setManufacturers] = useState<TrustScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recalculating, setRecalculating] = useState<string | null>(null);

  useEffect(() => {
    loadTrustScores();
  }, []);

  const loadTrustScores = async () => {
    try {
      setLoading(true);
      // Fetch from API when available
      // For now, show demo data
      setManufacturers([
        {
          id: "1",
          manufacturerName: "Pharma Corp",
          trustScore: 72,
          components: {
            verification: 85,
            payment: 70,
            compliance: 65,
            activity: 60,
            quality: 75,
          },
          trend: "IMPROVING",
          lastAssessment: new Date().toISOString(),
        },
        {
          id: "2",
          manufacturerName: "Global Meds",
          trustScore: 88,
          components: {
            verification: 95,
            payment: 90,
            compliance: 85,
            activity: 80,
            quality: 85,
          },
          trend: "STABLE",
          lastAssessment: new Date().toISOString(),
        },
      ]);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load trust scores");
    } finally {
      setLoading(false);
    }
  };

  const recalculateTrust = async (manufacturerId: string) => {
    try {
      setRecalculating(manufacturerId);
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/security/recalculate-trust/${manufacturerId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await loadTrustScores();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to recalculate trust");
    } finally {
      setRecalculating(null);
    }
  };

  const getTrustColor = (score: number) => {
    if (score < 25)
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
    if (score < 50)
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200";
    if (score < 75)
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
    return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "IMPROVING":
        return "📈";
      case "STABLE":
        return "→";
      case "DECLINING":
        return "📉";
      default:
        return "-";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard/admin/security"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-2 inline-block"
              >
                ← Back to Security Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Trust Scores Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Monitor 5-component trust scores and manufacturer behavior
                trends
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading trust scores...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {manufacturers.map((mfg) => (
              <div
                key={mfg.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {mfg.manufacturerName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      Last assessed:{" "}
                      {new Date(mfg.lastAssessment).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-block px-4 py-2 rounded-lg ${getTrustColor(mfg.trustScore)}`}
                    >
                      <div className="text-2xl font-bold">{mfg.trustScore}</div>
                      <div className="text-sm mt-1">
                        Trend: {getTrendIcon(mfg.trend)} {mfg.trend}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Components Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Verification
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mfg.components.verification}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${mfg.components.verification}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Weight: 40%
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Payment
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mfg.components.payment}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${mfg.components.payment}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Weight: 25%
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Compliance
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mfg.components.compliance}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${mfg.components.compliance}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Weight: 20%
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Activity
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mfg.components.activity}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${mfg.components.activity}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Weight: 10%
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Quality
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mfg.components.quality}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${mfg.components.quality}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Weight: 5%
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => recalculateTrust(mfg.id)}
                    disabled={recalculating === mfg.id}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-semibold transition"
                  >
                    {recalculating === mfg.id
                      ? "Recalculating..."
                      : "Recalculate"}
                  </button>
                  <Link
                    href={`/dashboard/admin/security/trust-trends/${mfg.id}`}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded font-semibold transition"
                  >
                    View Trend
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Component Weights Explanation */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">
            Trust Score Components
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>Verification (40%):</strong> Percentage of genuine codes
              verified
            </div>
            <div>
              <strong>Payment (25%):</strong> Payment history and success rate
            </div>
            <div>
              <strong>Compliance (20%):</strong> Document verification and
              license status
            </div>
            <div>
              <strong>Activity (10%):</strong> Days since last activity
            </div>
            <div>
              <strong>Quality (5%):</strong> Percentage of non-expired batches
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
