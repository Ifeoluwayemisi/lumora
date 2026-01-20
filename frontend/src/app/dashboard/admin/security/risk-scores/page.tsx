"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface RiskScoreData {
  id: string;
  manufacturerName: string;
  riskScore: number;
  riskLevel: string;
  lastAssessment: string;
  detectionRules: {
    geographic: boolean;
    temporal: boolean;
    frequency: boolean;
    pattern: boolean;
    anomaly: boolean;
  };
}

export default function RiskScoresPage() {
  const [manufacturers, setManufacturers] = useState<RiskScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recalculating, setRecalculating] = useState<string | null>(null);

  useEffect(() => {
    loadRiskScores();
  }, []);

  const loadRiskScores = async () => {
    try {
      setLoading(true);
      // Fetch from API when available
      // For now, show a demo
      setManufacturers([
        {
          id: "1",
          manufacturerName: "Pharma Corp",
          riskScore: 35,
          riskLevel: "MEDIUM",
          lastAssessment: new Date().toISOString(),
          detectionRules: {
            geographic: true,
            temporal: false,
            frequency: false,
            pattern: false,
            anomaly: false,
          },
        },
        {
          id: "2",
          manufacturerName: "Global Meds",
          riskScore: 12,
          riskLevel: "LOW",
          lastAssessment: new Date().toISOString(),
          detectionRules: {
            geographic: false,
            temporal: false,
            frequency: false,
            pattern: false,
            anomaly: false,
          },
        },
      ]);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load risk scores");
    } finally {
      setLoading(false);
    }
  };

  const recalculateRisk = async (manufacturerId: string) => {
    try {
      setRecalculating(manufacturerId);
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/security/recalculate-risk/${manufacturerId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await loadRiskScores();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to recalculate risk");
    } finally {
      setRecalculating(null);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 25)
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
    if (score < 50)
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
    if (score < 75)
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200";
    return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
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
                Risk Scores Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Monitor and recalculate risk scores for all manufacturers
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
              Loading risk scores...
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Manufacturer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Risk Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Detection Rules
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Last Assessed
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {manufacturers.map((mfg) => (
                    <tr
                      key={mfg.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {mfg.manufacturerName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {mfg.riskScore}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(mfg.riskScore)}`}
                        >
                          {mfg.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-2">
                          {mfg.detectionRules.geographic && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded">
                              Geographic
                            </span>
                          )}
                          {mfg.detectionRules.temporal && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded">
                              Temporal
                            </span>
                          )}
                          {mfg.detectionRules.frequency && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded">
                              Frequency
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(mfg.lastAssessment).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => recalculateRisk(mfg.id)}
                          disabled={recalculating === mfg.id}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm font-semibold transition"
                        >
                          {recalculating === mfg.id
                            ? "Calculating..."
                            : "Recalculate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detection Rules Explanation */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">
            Risk Detection Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>Geographic Clustering:</strong> Detects codes spread
              across unusual geographic areas
            </div>
            <div>
              <strong>Temporal Anomalies:</strong> Identifies verification
              patterns at unusual times
            </div>
            <div>
              <strong>Code Frequency:</strong> Alerts on rapid code verification
              patterns
            </div>
            <div>
              <strong>Counterfeit Patterns:</strong> Detects mixed genuine and
              counterfeit batches
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
