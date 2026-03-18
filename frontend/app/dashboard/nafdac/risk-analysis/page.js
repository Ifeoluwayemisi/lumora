"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import { FiAlert, FiTrendingUp, FiBarChart2 } from "react-icons/fi";

export default function RiskAnalysisPage() {
  const riskFactors = [
    {
      name: "Code Reuse Frequency",
      weight: "High",
      description: "Detects when same code scanned multiple times",
      impact: "Indicates potential fake product in circulation",
      detection: "Real-time",
    },
    {
      name: "Geographic Spread Anomalies",
      weight: "High",
      description: "Identifies impossible location patterns",
      impact: "Code scanned in locations outside distribution area",
      detection: "Real-time",
    },
    {
      name: "Scan Frequency Spikes",
      weight: "Medium",
      description: "Sudden increases in verification attempts",
      impact: "May indicate targeted counterfeit campaign",
      detection: "Hourly analysis",
    },
    {
      name: "Unregistered Product Detections",
      weight: "High",
      description: "Products not in manufacturer records",
      impact: "Strong indicator of counterfeit goods",
      detection: "Real-time",
    },
    {
      name: "User Report Correlation",
      weight: "Medium",
      description: "Multiple users reporting same product",
      impact: "Validates suspected counterfeit",
      detection: "Daily aggregation",
    },
    {
      name: "Manufacturer Anomalies",
      weight: "Medium",
      description: "Suspicious manufacturer behavior patterns",
      impact: "Indicates potential insider involvement",
      detection: "Daily analysis",
    },
  ];

  const sampleAnalysis = [
    {
      product: "Product X - Batch 2024-001",
      riskScore: 92,
      factors: [
        { name: "Reused Code", severity: "critical" },
        { name: "Impossible Locations", severity: "critical" },
        { name: "High Report Count", severity: "high" },
      ],
    },
    {
      product: "Product Y - Batch 2024-045",
      riskScore: 68,
      factors: [
        { name: "Geographic Anomaly", severity: "high" },
        { name: "Spike in Scans", severity: "medium" },
      ],
    },
    {
      product: "Product Z - Batch 2024-089",
      riskScore: 35,
      factors: [
        { name: "Unusual Pattern", severity: "low" },
      ],
    },
  ];

  return (
    <AuthGuard allowedRoles={["NAFDAC"]}>
      <DashboardSidebar userRole="nafdac" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiAlert className="text-purple-600" />
              AI Risk Analysis Engine
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Advanced threat detection using machine learning and pattern analysis
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* How It Works */}
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              How Risk Scoring Works
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our AI engine analyzes multiple factors in real-time to assign a risk score (0-100%)
              to each product. The system learns from historical patterns and regulatory actions
              to continuously improve accuracy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded p-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">🔴 Critical (80-100%)</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Immediate action required. High confidence of counterfeit
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded p-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">🟠 High (50-79%)</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Strong suspicion. Requires investigation
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded p-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">🟢 Low (0-49%)</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Normal behavior. Routine monitoring
                </p>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiBarChart2 className="text-orange-600" />
              Risk Factors & Detection Methods
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {riskFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{factor.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        factor.weight === "High"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {factor.weight} Weight
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {factor.description}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Impact:</strong> {factor.impact}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    🔍 {factor.detection}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Analysis */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-blue-600" />
              Current Risk Assessments
            </h2>
            <div className="space-y-4">
              {sampleAnalysis.map((analysis, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {analysis.product}
                    </h3>
                    <div className="text-center">
                      <div
                        className={`text-3xl font-bold mb-1 ${
                          analysis.riskScore >= 80
                            ? "text-red-600"
                            : analysis.riskScore >= 50
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {analysis.riskScore}%
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Risk Score</p>
                    </div>
                  </div>

                  <div
                    className={`w-full rounded-full h-2 ${
                      analysis.riskScore >= 80
                        ? "bg-red-200"
                        : analysis.riskScore >= 50
                        ? "bg-orange-200"
                        : "bg-green-200"
                    }`}
                  >
                    <div
                      className={`h-2 rounded-full ${
                        analysis.riskScore >= 80
                          ? "bg-red-600"
                          : analysis.riskScore >= 50
                          ? "bg-orange-600"
                          : "bg-green-600"
                      }`}
                      style={{ width: `${analysis.riskScore}%` }}
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Contributing Factors:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.factors.map((factor, fIdx) => (
                        <span
                          key={fIdx}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            factor.severity === "critical"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              : factor.severity === "high"
                              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          }`}
                        >
                          {factor.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
