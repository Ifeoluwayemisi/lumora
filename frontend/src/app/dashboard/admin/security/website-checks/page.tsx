"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface WebsiteCheckData {
  id: string;
  manufacturerName: string;
  domain: string;
  verdict: "LEGITIMATE" | "MODERATE" | "SUSPICIOUS";
  riskScore: number;
  checks: {
    domainAge: boolean;
    ssl: boolean;
    reputation: boolean;
    companyName: boolean;
  };
  lastChecked: string;
}

export default function WebsiteChecksPage() {
  const [websites, setWebsites] = useState<WebsiteCheckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState<string | null>(null);

  useEffect(() => {
    loadWebsiteChecks();
  }, []);

  const loadWebsiteChecks = async () => {
    try {
      setLoading(true);
      // Fetch from API when available
      // For now, show demo data
      setWebsites([
        {
          id: "1",
          manufacturerName: "Pharma Corp",
          domain: "pharmacorp.com",
          verdict: "LEGITIMATE",
          riskScore: 12,
          checks: {
            domainAge: true,
            ssl: true,
            reputation: true,
            companyName: true,
          },
          lastChecked: new Date().toISOString(),
        },
        {
          id: "2",
          manufacturerName: "Global Meds",
          domain: "globalmeds.org",
          verdict: "MODERATE",
          riskScore: 35,
          checks: {
            domainAge: true,
            ssl: true,
            reputation: false,
            companyName: true,
          },
          lastChecked: new Date().toISOString(),
        },
      ]);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load website checks");
    } finally {
      setLoading(false);
    }
  };

  const checkWebsite = async (manufacturerId: string) => {
    try {
      setChecking(manufacturerId);
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/security/check-website/${manufacturerId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await loadWebsiteChecks();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to check website");
    } finally {
      setChecking(null);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "LEGITIMATE":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      case "MODERATE":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
      case "SUSPICIOUS":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
      default:
        return "";
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
                Website Legitimacy Checks
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Verify website authenticity, SSL certificates, and domain
                reputation
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
              Loading website checks...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {websites.map((website) => (
              <div
                key={website.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {website.manufacturerName}
                    </h3>
                    <a
                      href={`https://${website.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      {website.domain} ↗
                    </a>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${getVerdictColor(website.verdict)}`}
                  >
                    <div className="text-lg font-bold">{website.verdict}</div>
                    <div className="text-sm">Risk: {website.riskScore}</div>
                  </div>
                </div>

                {/* Check Results */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div
                    className={`p-4 rounded-lg border ${
                      website.checks.domainAge
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {website.checks.domainAge ? "✓" : "✗"}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Domain Age
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {website.checks.domainAge
                        ? "Over 30 days old"
                        : "Less than 30 days"}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      website.checks.ssl
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {website.checks.ssl ? "✓" : "✗"}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        SSL/HTTPS
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {website.checks.ssl ? "Valid certificate" : "No SSL"}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      website.checks.reputation
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {website.checks.reputation ? "✓" : "✗"}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Reputation
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {website.checks.reputation
                        ? "Clean records"
                        : "Flagged domain"}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      website.checks.companyName
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {website.checks.companyName ? "✓" : "✗"}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Company Name
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {website.checks.companyName
                        ? "Found on page"
                        : "Not found"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => checkWebsite(website.id)}
                    disabled={checking === website.id}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-semibold transition"
                  >
                    {checking === website.id ? "Checking..." : "Recheck Now"}
                  </button>
                  <Link
                    href={`/dashboard/admin/security/website-history/${website.id}`}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded font-semibold transition"
                  >
                    View History
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verification Criteria */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">
            Website Verification Criteria
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>Domain Age:</strong> Domain must be older than 30 days
            </div>
            <div>
              <strong>SSL Certificate:</strong> HTTPS with valid SSL certificate
              required
            </div>
            <div>
              <strong>Domain Reputation:</strong> Domain not flagged on
              blocklists
            </div>
            <div>
              <strong>Company Name:</strong> Company name must appear on website
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
