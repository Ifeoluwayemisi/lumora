"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { adminAuditApi } from "@/services/adminApi";
import { useAdmin } from "@/hooks/useAdmin";
import {
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiAlertCircle,
  FiX,
  FiZap,
  FiEye,
  FiFilter,
  FiCalendar,
} from "react-icons/fi";

export default function AuditLogsPage() {
  const { adminUser, isHydrated } = useAdmin();

  // Check access - only SUPER_ADMIN
  useEffect(() => {
    if (isHydrated && adminUser && adminUser.role !== "SUPER_ADMIN") {
      window.location.href = "/admin/unauthorized";
    }
  }, [isHydrated, adminUser]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  // Filters
  const [filterAction, setFilterAction] = useState("");
  const [filterAdmin, setFilterAdmin] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch audit logs
  const fetchLogs = async (page = 1) => {
    try {
      setError("");
      const res = await adminAuditApi.getLogs(
        page,
        20,
        filterAction || undefined,
        filterAdmin || undefined,
        startDate || undefined,
        endDate || undefined,
      );

      setLogs(res.data.items || []);
      setPagination({
        page: res.data.currentPage,
        limit: res.data.pageSize,
        total: res.data.total,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load audit logs");
      console.error("[AUDIT] Error:", err);
    }
  };

  // Initial load
  useEffect(() => {
    if (isHydrated && adminUser && adminUser.role === "SUPER_ADMIN") {
      fetchLogs(1).then(() => setIsLoading(false));
    }
  }, [isHydrated, adminUser]);

  // Handle filter
  const handleFilter = () => {
    setPagination({ page: 1, limit: 20, total: 0 });
    fetchLogs(1);
  };

  // Handle export
  const handleExport = async () => {
    try {
      const res = await adminAuditApi.exportLogs(
        filterAction || undefined,
        filterAdmin || undefined,
        startDate || undefined,
        endDate || undefined,
      );
      // Trigger file download
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to export logs");
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiZap className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // If not SUPER_ADMIN, show access denied
  if (adminUser && adminUser.role !== "SUPER_ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Only SUPER_ADMIN users can access audit logs
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const getActionColor = (action) => {
    if (action.includes("CREATE"))
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (action.includes("UPDATE"))
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (action.includes("DELETE"))
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (action.includes("APPROVE"))
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (action.includes("REJECT"))
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Audit Logs
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Complete admin action history & regulatory compliance record
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-semibold">
                🔒 SUPER_ADMIN ONLY - All data immutable, no deletions possible
              </p>
            </div>
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await fetchLogs(pagination.page);
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

      {/* Filters */}
      <div className="px-6 py-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Filters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Action Type
              </label>
              <input
                type="text"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                placeholder="e.g., APPROVE_MANUFACTURER"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Admin User
              </label>
              <input
                type="text"
                value={filterAdmin}
                onChange={(e) => setFilterAdmin(e.target.value)}
                placeholder="Admin email or ID"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              <FiSearch className="w-4 h-4" />
              Apply Filters
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiZap className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiFilter className="w-12 h-12 mx-auto text-gray-400 mb-3 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">
              No audit logs found matching your filters
            </p>
          </div>
        ) : (
          <>
            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Timestamp
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Admin User
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Action
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Entity
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Details
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {log.adminName || log.adminEmail}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${getActionColor(
                              log.action,
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {log.entityType}{" "}
                          {log.entityId
                            ? `(${log.entityId.substring(0, 8)}...)`
                            : ""}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {log.reason || "—"}
                        </td>
                        <td className="text-right py-3 px-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center justify-end gap-1"
                          >
                            <FiEye className="w-4 h-4" />
                            Details
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
                  Showing page {pagination.page} of {totalPages} (
                  {pagination.total} total logs)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchLogs(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      fetchLogs(Math.min(totalPages, pagination.page + 1))
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
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
            <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Audit Log Details
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Timestamp
                    </label>
                    <p className="text-gray-900 dark:text-white font-mono">
                      {new Date(selectedLog.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Admin User
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedLog.adminName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Action
                    </label>
                    <p
                      className={`px-2 py-1 w-fit rounded font-semibold text-sm ${getActionColor(
                        selectedLog.action,
                      )}`}
                    >
                      {selectedLog.action}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Entity
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedLog.entityType}
                    </p>
                  </div>
                </div>

                {selectedLog.reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Reason/Notes
                    </label>
                    <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">
                      {selectedLog.reason}
                    </p>
                  </div>
                )}

                {selectedLog.ipAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      IP Address
                    </label>
                    <p className="text-gray-900 dark:text-white font-mono">
                      {selectedLog.ipAddress}
                    </p>
                  </div>
                )}
              </div>

              {/* Before/After State */}
              {(selectedLog.beforeState || selectedLog.afterState) && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    State Changes
                  </h3>
                  <div className="space-y-3">
                    {selectedLog.beforeState && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                          Before
                        </p>
                        <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40">
                          {JSON.stringify(selectedLog.beforeState, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.afterState && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-1">
                          After
                        </p>
                        <pre className="text-xs text-green-700 dark:text-green-300 overflow-auto max-h-40">
                          {JSON.stringify(selectedLog.afterState, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedLog(null)}
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
