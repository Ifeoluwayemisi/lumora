"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { adminCaseApi } from "@/services/adminApi";
import { useAdmin } from "@/hooks/useAdmin";
import {
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiMessageSquare,
  FiAlertCircle,
  FiX,
  FiZap,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiFile,
} from "react-icons/fi";

export default function CasesPage() {
  const { adminUser, isHydrated } = useAdmin();

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("open");

  // Data
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Form state
  const [newNote, setNewNote] = useState("");
  const [escalationNotes, setEscalationNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Fetch cases
  const fetchCases = async (page = 1, status = activeTab) => {
    try {
      setError("");
      const statusMap = {
        open: "OPEN",
        review: "UNDER_REVIEW",
        escalated: "ESCALATED_NAFDAC",
        closed: "CLOSED",
      };

      const res = await adminCaseApi.getCases(page, 10, statusMap[status]);
      setCases(res.data.items || []);
      setPagination({
        page: res.data.currentPage,
        limit: res.data.pageSize,
        total: res.data.total,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load cases");
      console.error("[CASES] Error:", err);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await adminCaseApi.getCaseStats();
      setStats(res.data);
    } catch (err) {
      console.error("[STATS] Error:", err);
    }
  };

  // Initial load
  useEffect(() => {
    if (isHydrated && adminUser) {
      Promise.all([fetchCases(1, activeTab), fetchStats()]).then(() =>
        setIsLoading(false),
      );
    }
  }, [isHydrated, adminUser, activeTab]);

  // Add note to case
  const handleAddNote = async (caseId) => {
    if (!newNote.trim()) {
      setError("Note cannot be empty");
      return;
    }
    try {
      setIsProcessing(true);
      await adminCaseApi.addCaseNote(caseId, { note: newNote });
      setNewNote("");
      setSelectedCase(null);
      await Promise.all([fetchCases(pagination.page, activeTab), fetchStats()]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add note");
    } finally {
      setIsProcessing(false);
    }
  };

  // Update case status
  const handleUpdateStatus = async (caseId, status) => {
    try {
      setIsProcessing(true);
      await adminCaseApi.updateCaseStatus(caseId, { status });
      setSelectedCase(null);
      setNewStatus("");
      await Promise.all([fetchCases(pagination.page, activeTab), fetchStats()]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsProcessing(false);
    }
  };

  // Escalate to NAFDAC
  const handleEscalateNAFDAC = async (caseId) => {
    if (!escalationNotes.trim()) {
      setError("Escalation notes are required");
      return;
    }
    if (!window.confirm("Escalate this case to NAFDAC?")) return;

    try {
      setIsProcessing(true);
      await adminCaseApi.escalateToNAFDAC(caseId, {
        notes: escalationNotes,
      });
      setEscalationNotes("");
      setSelectedCase(null);
      await Promise.all([fetchCases(pagination.page, activeTab), fetchStats()]);
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
  const tabs = ["open", "review", "escalated", "closed"];
  const tabLabels = {
    open: "Open Cases",
    review: "Under Review",
    escalated: "Escalated (NAFDAC)",
    closed: "Closed",
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "ESCALATED_NAFDAC":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "CLOSED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Case Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Investigate suspicious products & escalate to NAFDAC
              </p>
            </div>
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await Promise.all([
                  fetchCases(pagination.page, activeTab),
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
              Open Cases
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.openCount || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Under Review
            </p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.reviewCount || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Escalated
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
        ) : cases.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiFile className="w-12 h-12 mx-auto text-gray-400 mb-3 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">
              No cases in this category
            </p>
          </div>
        ) : (
          <>
            {/* Cases Table */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Case ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Manufacturer
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Created
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {cases.map((caseItem) => (
                      <tr
                        key={caseItem.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                        onClick={() => setSelectedCase(caseItem)}
                      >
                        <td className="py-3 px-4 font-mono text-gray-900 dark:text-white text-xs">
                          {caseItem.id.substring(0, 8)}...
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                          {caseItem.productName}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {caseItem.manufacturerName || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              caseItem.priority === "CRITICAL"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : caseItem.priority === "HIGH"
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {caseItem.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded ${getStatusColor(
                              caseItem.status,
                            )}`}
                          >
                            {caseItem.status === "ESCALATED_NAFDAC"
                              ? "Escalated"
                              : caseItem.status === "UNDER_REVIEW"
                                ? "Reviewing"
                                : caseItem.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(caseItem.createdAt).toLocaleDateString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCase(caseItem);
                            }}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center justify-end gap-1"
                          >
                            <FiEye className="w-4 h-4" />
                            View
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
                      fetchCases(Math.max(1, pagination.page - 1), activeTab)
                    }
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      fetchCases(
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
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
            <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Case Details
              </h2>
              <button
                onClick={() => {
                  setSelectedCase(null);
                  setNewNote("");
                  setEscalationNotes("");
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Case Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Product
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedCase.productName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Manufacturer
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedCase.manufacturerName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Priority
                  </label>
                  <p
                    className={`font-semibold ${
                      selectedCase.priority === "CRITICAL"
                        ? "text-red-600"
                        : selectedCase.priority === "HIGH"
                          ? "text-orange-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {selectedCase.priority}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedCase.status === "ESCALATED_NAFDAC"
                      ? "Escalated to NAFDAC"
                      : selectedCase.status === "UNDER_REVIEW"
                        ? "Under Review"
                        : selectedCase.status}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedCase.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Description
                  </label>
                  <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">
                    {selectedCase.description}
                  </p>
                </div>
              )}

              {/* Notes Timeline */}
              {selectedCase.notes && selectedCase.notes.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-3">
                    Investigation Notes
                  </label>
                  <div className="space-y-3">
                    {selectedCase.notes.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {note.content}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          By: {note.adminName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Note */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                  Add Investigation Note
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Document your findings and actions..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  rows="3"
                />
                <button
                  onClick={() => handleAddNote(selectedCase.id)}
                  disabled={isProcessing || !newNote.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
                >
                  <FiMessageSquare className="w-4 h-4" />
                  Add Note
                </button>
              </div>

              {/* Status Update */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                  Update Case Status
                </label>
                <div className="flex gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg"
                  >
                    <option value="">Select new status...</option>
                    <option value="OPEN">Open</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedCase.id, newStatus)
                    }
                    disabled={isProcessing || !newStatus}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Update
                  </button>
                </div>
              </div>

              {/* NAFDAC Escalation */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <FiArrowRight className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">
                      Escalate to NAFDAC
                    </h3>
                    <textarea
                      value={escalationNotes}
                      onChange={(e) => setEscalationNotes(e.target.value)}
                      placeholder="Provide comprehensive case summary for regulatory body..."
                      className="w-full p-3 border border-orange-300 dark:border-orange-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent mb-2"
                      rows="3"
                    />
                    <button
                      onClick={() => handleEscalateNAFDAC(selectedCase.id)}
                      disabled={isProcessing || !escalationNotes.trim()}
                      className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <FiArrowRight className="w-4 h-4" />
                      Send to NAFDAC with Evidence Bundle
                    </button>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedCase(null);
                  setNewNote("");
                  setEscalationNotes("");
                }}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
