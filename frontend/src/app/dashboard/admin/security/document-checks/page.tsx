"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface DocumentCheckData {
  id: string;
  manufacturerName: string;
  documentType: "NAFDAC_LICENSE" | "BUSINESS_CERT" | "PHOTO_ID";
  verdict: "LEGITIMATE" | "MODERATE_RISK" | "SUSPICIOUS" | "LIKELY_FORGED";
  riskScore: number;
  checks: {
    elaResult: string;
    metadataResult: string;
    qualityScore: number;
    hasSecurityFeatures: boolean;
  };
  lastChecked: string;
}

export default function DocumentChecksPage() {
  const [documents, setDocuments] = useState<DocumentCheckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState<string | null>(null);

  useEffect(() => {
    loadDocumentChecks();
  }, []);

  const loadDocumentChecks = async () => {
    try {
      setLoading(true);
      // Fetch from API when available
      // For now, show demo data
      setDocuments([
        {
          id: "1",
          manufacturerName: "Pharma Corp",
          documentType: "NAFDAC_LICENSE",
          verdict: "LEGITIMATE",
          riskScore: 8,
          checks: {
            elaResult: "CLEAN",
            metadataResult: "CLEAN",
            qualityScore: 95,
            hasSecurityFeatures: true,
          },
          lastChecked: new Date().toISOString(),
        },
        {
          id: "2",
          manufacturerName: "Global Meds",
          documentType: "BUSINESS_CERT",
          verdict: "MODERATE_RISK",
          riskScore: 42,
          checks: {
            elaResult: "POTENTIAL_ARTIFACTS",
            metadataResult: "CLEAN",
            qualityScore: 78,
            hasSecurityFeatures: true,
          },
          lastChecked: new Date().toISOString(),
        },
      ]);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load document checks");
    } finally {
      setLoading(false);
    }
  };

  const checkDocument = async (
    manufacturerId: string,
    documentType: string,
  ) => {
    try {
      setChecking(`${manufacturerId}-${documentType}`);
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/security/check-document/${manufacturerId}`,
        { documentType },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await loadDocumentChecks();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to check document");
    } finally {
      setChecking(null);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "LEGITIMATE":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      case "MODERATE_RISK":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
      case "SUSPICIOUS":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200";
      case "LIKELY_FORGED":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
      default:
        return "";
    }
  };

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case "NAFDAC_LICENSE":
        return "NAFDAC License";
      case "BUSINESS_CERT":
        return "Business Certificate";
      case "PHOTO_ID":
        return "Photo ID";
      default:
        return type;
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
                Document Forgery Detection
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Analyze documents for signs of forgery and tampering
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
              Loading document checks...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {doc.manufacturerName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {getDocumentLabel(doc.documentType)}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${getVerdictColor(doc.verdict)}`}
                  >
                    <div className="text-lg font-bold">{doc.verdict}</div>
                    <div className="text-sm">Risk: {doc.riskScore}</div>
                  </div>
                </div>

                {/* Analysis Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* ELA Result */}
                  <div
                    className={`p-4 rounded-lg border ${
                      doc.checks.elaResult === "CLEAN"
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Error Level Analysis
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          doc.checks.elaResult === "CLEAN"
                            ? "text-green-700 dark:text-green-300"
                            : "text-yellow-700 dark:text-yellow-300"
                        }`}
                      >
                        {doc.checks.elaResult}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {doc.checks.elaResult === "CLEAN"
                        ? "No compression artifacts detected"
                        : "Potential editing artifacts found"}
                    </p>
                  </div>

                  {/* Metadata Result */}
                  <div
                    className={`p-4 rounded-lg border ${
                      doc.checks.metadataResult === "CLEAN"
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Metadata Check
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          doc.checks.metadataResult === "CLEAN"
                            ? "text-green-700 dark:text-green-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {doc.checks.metadataResult}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {doc.checks.metadataResult === "CLEAN"
                        ? "Metadata not tampered"
                        : "Metadata tampering detected"}
                    </p>
                  </div>

                  {/* Quality Score */}
                  <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Document Quality
                      </span>
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        {doc.checks.qualityScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${doc.checks.qualityScore}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {doc.checks.qualityScore > 80
                        ? "High resolution, standard format"
                        : "Low quality or unusual format"}
                    </p>
                  </div>

                  {/* Security Features */}
                  <div
                    className={`p-4 rounded-lg border ${
                      doc.checks.hasSecurityFeatures
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Security Features
                      </span>
                      <span
                        className={`text-xl ${
                          doc.checks.hasSecurityFeatures
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {doc.checks.hasSecurityFeatures ? "✓" : "✗"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {doc.checks.hasSecurityFeatures
                        ? "Holograms and security marks detected"
                        : "No security features found"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => checkDocument(doc.id, doc.documentType)}
                    disabled={checking === `${doc.id}-${doc.documentType}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-semibold transition"
                  >
                    {checking === `${doc.id}-${doc.documentType}`
                      ? "Analyzing..."
                      : "Re-analyze"}
                  </button>
                  <Link
                    href={`/dashboard/admin/security/document-history/${doc.id}`}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded font-semibold transition"
                  >
                    View History
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analysis Methods */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">
              Detection Methods
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>
                <strong>ELA (Error Level Analysis):</strong> Detects compression
                artifacts from editing
              </li>
              <li>
                <strong>Metadata Analysis:</strong> Checks for tampering in EXIF
                and other metadata
              </li>
              <li>
                <strong>Quality Assessment:</strong> Analyzes resolution,
                dimensions, and format
              </li>
              <li>
                <strong>Security Features:</strong> Detects holograms and
                authenticity marks
              </li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-4">
              Document Types
            </h3>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <li>
                <strong>NAFDAC License:</strong> Nigerian pharmaceutical
                licensing
              </li>
              <li>
                <strong>Business Certificate:</strong> Corporate registration
                documents
              </li>
              <li>
                <strong>Photo ID:</strong> Government-issued identification
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
