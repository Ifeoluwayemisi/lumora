"use client";

import React, { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import api from "@/services/api";
import { FiMapPin, FiTrendingUp, FiAlertCircle } from "react-icons/fi";

/**
 * Hotspot Intelligence System
 * Role-based access: NAFDAC only
 */
export default function HotspotIntelligencePage() {
  const router = useRouter();
  const { user, isHydrated } = useContext(AuthContext);
  const [selectedState, setSelectedState] = useState(null);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Security: Verify role authorization
  useEffect(() => {
    if (!isHydrated) return;

    if (!user || user.role !== "NAFDAC") {
      router.replace("/auth/login");
      return;
    }
  }, [isHydrated, user, router]);

  // Fetch hotspots only after auth is confirmed
  useEffect(() => {
    if (!user || user.role !== "NAFDAC") return;

    const fetchHotspots = async () => {
      try {
        const response = await api.get("/nafdac/hotspots");
        setStates(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("[NAFDAC_HOTSPOTS] Error fetching hotspots:", error);
        // Fallback to default states
        setStates([
          {
            id: 1,
            name: "Lagos",
            suspiciousScans: 342,
            reportsCount: 87,
            riskLevel: "Critical",
            riskColor:
              "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
          },
          {
            id: 2,
            name: "Port Harcourt",
            suspiciousScans: 156,
            reportsCount: 42,
            riskLevel: "High",
            riskColor:
              "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotspots();
  }, []);

  const selectedStateData = selectedState
    ? states.find((s) => s.id === selectedState)
    : null;

  return (
    <AuthGuard allowedRoles={["NAFDAC"]}>
      <DashboardSidebar userRole="nafdac" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiMapPin className="text-red-600" />
              Hotspot & Location Intelligence
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Geographic analysis of suspicious product scans and fake drug
              reports across Nigeria
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* States List */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Risk by State
              </h2>
              <div className="space-y-3">
                {states.map((state) => (
                  <button
                    key={state.id}
                    onClick={() => setSelectedState(state.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedState === state.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {state.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {state.suspiciousScans} suspicious scans
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${state.riskColor}`}
                      >
                        {state.riskLevel}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* State Details */}
            <div className="lg:col-span-2">
              {selectedStateData ? (
                <div className="space-y-6">
                  {/* State Header */}
                  <div
                    className={`${selectedStateData.riskColor} rounded-lg p-6 border`}
                  >
                    <h2 className="text-3xl font-bold mb-2">
                      {selectedStateData.name}
                    </h2>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm opacity-75">Suspicious Scans</p>
                        <p className="text-3xl font-bold">
                          {selectedStateData.suspiciousScans}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm opacity-75">User Reports</p>
                        <p className="text-3xl font-bold">
                          {selectedStateData.reportsCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm opacity-75">Risk Level</p>
                        <p className="text-2xl font-bold">
                          {selectedStateData.riskLevel}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FiAlertCircle className="text-orange-600" />
                      Key Insights
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-orange-600 font-bold mt-1">
                          •
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          High concentration of reused codes detected in
                          commercial areas
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-orange-600 font-bold mt-1">
                          •
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          Unusual spike in unregistered product scans in
                          distribution centers
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-orange-600 font-bold mt-1">
                          •
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          Multiple reports from same location suggest local
                          supply chain compromise
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Recommended Actions */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2">
                      <FiTrendingUp />
                      Recommended Actions
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-blue-900 dark:text-blue-400">
                        <span className="text-lg">→</span> Increase verification
                        checkpoints in high-risk areas
                      </li>
                      <li className="flex items-center gap-2 text-blue-900 dark:text-blue-400">
                        <span className="text-lg">→</span> Schedule manufacturer
                        compliance audit
                      </li>
                      <li className="flex items-center gap-2 text-blue-900 dark:text-blue-400">
                        <span className="text-lg">→</span> Issue regulatory
                        alert to distribution networks
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <FiMapPin className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a state to view hotspot intelligence and risk
                    analysis
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Overall Stats */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              National Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Total Suspicious Scans
                </p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {states.reduce((sum, s) => sum + s.suspiciousScans, 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Total Reports
                </p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {states.reduce((sum, s) => sum + s.reportsCount, 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  High Risk States
                </p>
                <p className="text-4xl font-bold text-red-600">
                  {
                    states.filter(
                      (s) =>
                        s.riskLevel === "High" || s.riskLevel === "Critical",
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
