"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

interface SecurityStats {
  riskScore: number;
  trustScore: number;
  websiteVerified: boolean;
  documentsVerified: boolean;
  rateLimitStatus: {
    remaining: number;
    limit: number;
  };
}

export default function AdminSecurityDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [error, setError] = useState("");
  const [runningCheck, setRunningCheck] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSecurityStats();
  }, []);

  const loadSecurityStats = async () => {
    try {
      setLoading(true);
      // Placeholder - will fetch from API
      // For now, show a sample structure
      setStats({
        riskScore: 45,
        trustScore: 72,
        websiteVerified: true,
        documentsVerified: false,
        rateLimitStatus: {
          remaining: 450,
          limit: 1000,
        },
      });
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load security stats");
    } finally {
      setLoading(false);
    }
  };

  const runFullSecurityCheck = async (manufacturerId: string) => {
    try {
      setRunningCheck(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/security/full-check/${manufacturerId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await loadSecurityStats();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to run security check");
    } finally {
      setRunningCheck(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Security Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor risk scores, trust scores, and verification status
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Risk Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 font-semibold">
                Average Risk Score
              </h3>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-lg">
                  ⚠️
                </span>
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {stats?.riskScore || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Risk Level: {getRiskLevel(stats?.riskScore || 0)}
            </p>
            <Link
              href="/dashboard/admin/security/risk-scores"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block"
            >
              View Details →
            </Link>
          </div>

          {/* Trust Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 font-semibold">
                Average Trust Score
              </h3>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-lg">
                  ✓
                </span>
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {stats?.trustScore || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Trust Level: {getTrustLevel(stats?.trustScore || 0)}
            </p>
            <Link
              href="/dashboard/admin/security/trust-scores"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block"
            >
              View Details →
            </Link>
          </div>

          {/* Website Verification Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 font-semibold">
                Website Status
              </h3>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  stats?.websiteVerified
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-yellow-100 dark:bg-yellow-900/30"
                }`}
              >
                <span
                  className={
                    stats?.websiteVerified
                      ? "text-green-600 dark:text-green-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }
                >
                  {stats?.websiteVerified ? "✓" : "!"}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.websiteVerified ? "Verified" : "Pending"}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {stats?.websiteVerified
                ? "All websites verified"
                : "Some websites need verification"}
            </p>
            <Link
              href="/dashboard/admin/security/website-checks"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block"
            >
              View Details →
            </Link>
          </div>

          {/* Document Verification Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 font-semibold">
                Document Status
              </h3>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  stats?.documentsVerified
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-yellow-100 dark:bg-yellow-900/30"
                }`}
              >
                <span
                  className={
                    stats?.documentsVerified
                      ? "text-green-600 dark:text-green-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }
                >
                  {stats?.documentsVerified ? "✓" : "!"}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.documentsVerified ? "Verified" : "Pending"}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {stats?.documentsVerified
                ? "All documents verified"
                : "Some documents need verification"}
            </p>
            <Link
              href="/dashboard/admin/security/document-checks"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block"
            >
              View Details →
            </Link>
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Security Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => runFullSecurityCheck("all")}
              disabled={runningCheck}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
            >
              {runningCheck ? "Running Check..." : "Run Full Security Check"}
            </button>
            <Link
              href="/dashboard/admin/security/rate-limits"
              className="px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition text-center"
            >
              Manage Rate Limits
            </Link>
          </div>
        </div>

        {/* Quick Stats Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <Link
              href="/dashboard/admin/security/risk-scores"
              className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white font-medium">
                  Manage Risk Scores
                </span>
                <span className="text-gray-600 dark:text-gray-400">→</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Recalculate and view manufacturer risk scores
              </p>
            </Link>
            <Link
              href="/dashboard/admin/security/trust-scores"
              className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white font-medium">
                  Manage Trust Scores
                </span>
                <span className="text-gray-600 dark:text-gray-400">→</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View trust score trends and components
              </p>
            </Link>
            <Link
              href="/dashboard/admin/security/website-checks"
              className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white font-medium">
                  Website Legitimacy
                </span>
                <span className="text-gray-600 dark:text-gray-400">→</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Verify and recheck manufacturer websites
              </p>
            </Link>
            <Link
              href="/dashboard/admin/security/document-checks"
              className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white font-medium">
                  Document Verification
                </span>
                <span className="text-gray-600 dark:text-gray-400">→</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Check for forged or manipulated documents
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRiskLevel(score: number): string {
  if (score < 25) return "LOW";
  if (score < 50) return "MEDIUM";
  if (score < 75) return "HIGH";
  return "CRITICAL";
}

function getTrustLevel(score: number): string {
  if (score < 25) return "VERY LOW";
  if (score < 50) return "LOW";
  if (score < 75) return "MEDIUM";
  return "HIGH";
}
