"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import {
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
  LineChart,
  Line,
} from "recharts";

const AGENCIES = {
  NAFDAC: "National Agency for Food & Drug Administration",
  FIRS: "Federal Inland Revenue Service",
  "NAFDAC-COSMETICS": "NAFDAC - Cosmetics Division",
};

const COLORS = ["#ef4444", "#f59e0b", "#eab308", "#84cc16"];

export default function AgencyReportingPage() {
  const [loading, setLoading] = useState(true);
  const [allAgenciesData, setAllAgenciesData] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState("NAFDAC");
  const [agencyDetail, setAgencyDetail] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAllAgenciesData();
  }, [days]);

  useEffect(() => {
    if (selectedAgency) {
      fetchAgencyDetail();
    }
  }, [selectedAgency, days]);

  const fetchAllAgenciesData = async () => {
    try {
      const res = await api.get(`/admin/analytics/agencies?days=${days}`);
      setAllAgenciesData(res.data);
    } catch (error) {
      console.error("[ANALYTICS] Error fetching agencies:", error);
      toast.error("Failed to load agencies data");
    }
  };

  const fetchAgencyDetail = async () => {
    try {
      const res = await api.get(
        `/admin/analytics/agencies/${selectedAgency}?days=${days}`,
      );
      setAgencyDetail(res.data);
    } catch (error) {
      console.error("[ANALYTICS] Error fetching agency detail:", error);
      toast.error("Failed to load agency details");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !allAgenciesData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading agency reports...</p>
        </div>
      </div>
    );
  }

  const severityData = agencyDetail?.severityBreakdown || [];
  const reasonData = agencyDetail?.reasonBreakdown || [];
  const topManufacturers = agencyDetail?.topFlaggedManufacturers || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-4 md:ml-64">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6"
        >
          <FiArrowLeft /> Back to Admin
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Agency Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Detailed analysis of flagged codes by regulatory agency
        </p>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Regulatory Agency
            </label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              {Object.entries(AGENCIES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Overall Stats */}
        {allAgenciesData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Critical Flags
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {allAgenciesData.totalCritical}
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                High Severity
              </p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {allAgenciesData.totalHigh}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Medium Severity
              </p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {allAgenciesData.totalMedium}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Flagged
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {allAgenciesData.totalFlaggedCodes}
              </p>
            </div>
          </div>
        )}

        {/* Agency Detail Stats */}
        {agencyDetail && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Flags to {selectedAgency}
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {agencyDetail.totalFlagsForAgency}
                </p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unique Manufacturers
                </p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {agencyDetail.uniqueManufacturers}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Daily Alerts
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {agencyDetail.avgDailyAlerts?.toFixed(1) || 0}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Severity Distribution */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Severity Distribution
                </h3>
                {severityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ severity, count, percent }) =>
                          `${severity}: ${count} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {severityData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">No data</p>
                )}
              </div>

              {/* Reason Breakdown */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Reason Breakdown
                </h3>
                {reasonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reasonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="reason"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-8">No data</p>
                )}
              </div>
            </div>

            {/* Top Flagged Manufacturers */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Flagged Manufacturers
              </h3>
              {topManufacturers.length > 0 ? (
                <div className="space-y-3">
                  {topManufacturers.map((mfg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {idx + 1}. {mfg.manufacturerName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {mfg.count} flag{mfg.count !== 1 ? "s" : ""} •{" "}
                          {mfg.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {mfg.count}
                        </p>
                        <p className="text-xs text-gray-500">flagged codes</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No data</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
