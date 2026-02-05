"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { adminReportApi } from "@/services/adminApi";
import { useAdmin } from "@/hooks/useAdmin";
import {
  FiFilter,
  FiEye,
  FiFlag,
  FiCheckCircle,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiZap,
  FiUpload,
  FiMessageSquare,
  FiArrowRight,
} from "react-icons/fi";

export default function ReportsPage() {
  const { adminUser, isHydrated } = useAdmin();

  // UI State
  const [activeTab, setActiveTab] = useState("new");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Report action
  const [actionNotes, setActionNotes] = useState("");
  const [escalateToNAFDAC, setEscalateToNAFDAC] = useState(false);

  // Fetch reports based on status
  const fetchReports = async (page = 1, status = activeTab) => {
    try {
      setError("");
      const statusMap = {
        new: "NEW",
        review: "UNDER_REVIEW",
        escalated: "ESCALATED",
        closed: "CLOSED",
      };

      const res = await adminReportApi.getReports(page, 10, statusMap[status]);

      setReports(res.data.items || []);
      setPagination({
        page: res.data.currentPage,
        limit: res.data.pageSize,
        total: res.data.total,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports");
      console.error("[REPORTS] Error:", err);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await adminReportApi.getReportsStats();
      setStats(res.data);
    } catch (err) {
      console.error("[STATS] Error:", err);
    }
  };

  // Initial load
  useEffect(() => {
    if (isHydrated && adminUser) {
      Promise.all([fetchReports(1, activeTab), fetchStats()]).then(() =>
        setIsLoading(false),
      );
    }
  }, [isHydrated, adminUser, activeTab]);

  // Mark report as reviewed
  const handleMarkAsReviewed = async (reportId, status) => {
    if (!actionNotes.trim()) {
      setError("Review notes are required");
      return;
    }
    try {
      setIsProcessing(true);
      await adminReportApi.reviewReport(reportId, {
        status,
        notes: actionNotes,
      });
      setSelectedReport(null);
      setActionNotes("");
      await Promise.all([
        fetchReports(pagination.page, activeTab),
        fetchStats(),
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to review report");
    } finally {
      setIsProcessing(false);
    }
  };

  // Escalate to NAFDAC
  const handleEscalateNAFDAC = async (reportId) => {
    if (!window.confirm("Escalate this report to NAFDAC?")) return;
    try {
      setIsProcessing(true);
      await adminReportApi.escalateToNAFDAC(reportId, {
        notes: actionNotes,
      });
      setSelectedReport(null);
      setActionNotes("");
      await Promise.all([
        fetchReports(pagination.page, activeTab),
        fetchStats(),
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to escalate to NAFDAC");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiZap className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const tabs = ["new", "review", "escalated", "closed"];
  const tabLabels = {
    new: "New Reports",
    review: "Under Review",
    escalated: "Escalated to NAFDAC",
    closed: "Closed",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Reports & Incidents
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                User-reported counterfeit drugs & suspicious products
              </p>
            </div>
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await Promise.all([
                  fetchReports(pagination.page, activeTab),
                  fetchStats(),
                ]);
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

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPagination({ page: 1, limit: 10, total: 0 });
                }}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
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

      {/* Stats Cards */}
      {stats && (
        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              New Reports
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.newCount || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Under Review
            </p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.underReviewCount || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Escalated (NAFDAC)
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.escalatedCount || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Closed
            </p>
            <p className="text-2xl font-bold text-green-600">
              {stats.closedCount || 0}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiZap className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiFlag className="w-12 h-12 mx-auto text-gray-400 mb-3 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">
              No reports in this category
            </p>
          </div>
        ) : (
          <>
            {/* Reports Table */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Reported By
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Reason
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Risk Level
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Date
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {reports.map((report) => (
                      <tr
                        key={report.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                          {report.productNameResolved ||
                            report.productName ||
                            "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {report.reporterName || "Anonymous"}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                            {report.reason}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              report.riskLevel === "CRITICAL"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : report.riskLevel === "HIGH"
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                  : report.riskLevel === "MEDIUM"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {report.riskLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              report.status === "NEW"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : report.status === "UNDER_REVIEW"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : report.status === "ESCALATED"
                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }`}
                          >
                            {report.status === "UNDER_REVIEW"
                              ? "Under Review"
                              : report.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReport(report);
                            }}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center justify-end gap-1"
                          >
                            <FiEye className="w-4 h-4" />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing page {pagination.page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      fetchReports(Math.max(1, pagination.page - 1), activeTab)
                    }
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      fetchReports(
                        Math.min(totalPages, pagination.page + 1),
                        activeTab,
                      )
                    }
                    disabled={pagination.page === totalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
            <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Report: {selectedReport.productName}
              </h2>
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setActionNotes("");
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Report Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Product Name
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedReport.productName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Product Code
                    </label>
                    <p className="text-gray-900 dark:text-white font-mono">
                      {selectedReport.productCode || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Reported By
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedReport.reporterName || "Anonymous"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Location
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedReport.reporterLocation || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Reason & Details */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Report Reason
                  </label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {selectedReport.reason}
                  </p>
                </div>

                {selectedReport.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Description
                    </label>
                    <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">
                      {selectedReport.description}
                    </p>
                  </div>
                )}

                {/* Risk Level */}
                <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                        Current Risk Level
                      </p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                        {selectedReport.riskLevel}
                      </p>
                    </div>
                    <FiFlag className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>

                {/* Photos */}
                {selectedReport.photoUrls &&
                  selectedReport.photoUrls.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-3">
                        Photos Uploaded
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedReport.photoUrls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-600 transition flex items-center gap-2"
                          >
                            <FiUpload className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-600 dark:text-blue-400">
                              Photo {idx + 1}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Admin Review Notes */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                  Admin Review Notes
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Add your findings, investigation notes, or action taken..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  rows="4"
                />
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      handleMarkAsReviewed(selectedReport.id, "VALID")
                    }
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiX className="w-4 h-4" />
                    Mark as Valid (Genuine Issue)
                  </button>
                  <button
                    onClick={() =>
                      handleMarkAsReviewed(selectedReport.id, "FALSE_ALARM")
                    }
                    disabled={isProcessing}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Mark as False Alarm
                  </button>
                  <button
                    onClick={() =>
                      handleMarkAsReviewed(
                        selectedReport.id,
                        "NEEDS_INVESTIGATION",
                      )
                    }
                    disabled={isProcessing}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                    Needs Investigation
                  </button>
                  <button
                    onClick={() => handleEscalateNAFDAC(selectedReport.id)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiArrowRight className="w-4 h-4" />
                    Escalate to NAFDAC
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setActionNotes("");
                  }}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
