"use client";

import React, { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import api from "@/services/api";
import { FiSearch, FiFilter, FiClock } from "react-icons/fi";

/**
 * Audit Logs - Activity History Tracking
 * Role-based access: NAFDAC only
 */
export default function AuditLogsPage() {
  const router = useRouter();
  const { user, isHydrated } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Security: Verify role authorization
  useEffect(() => {
    if (!isHydrated) return;

    if (!user || user.role !== "NAFDAC") {
      router.replace("/auth/login");
      return;
    }
  }, [isHydrated, user, router]);

  // Fetch audit logs only after auth is confirmed
  useEffect(() => {
    if (!user || user.role !== "NAFDAC") return;

    const fetchAuditLogs = async () => {
      try {
        const response = await api.get("/nafdac/audit-logs");
        setAuditLogs(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("[NAFDAC_AUDIT_LOGS] Error fetching logs:", error);
        setAuditLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [user]);

  const getActionColor = (action) => {
    if (action.includes("Suspended") || action.includes("Blocked"))
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
    if (action.includes("Flagged") || action.includes("Alert"))
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
    if (action.includes("Reviewed"))
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400";
  };

  const getSeverityColor = (severity) => {
    if (severity === "critical")
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
    if (severity === "high")
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
    if (severity === "medium")
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
    return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === "all" || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  const uniqueActions = [...new Set(auditLogs.map((log) => log.action))];

  return (
    <AuthGuard allowedRoles={["NAFDAC"]}>
      <DashboardSidebar userRole="nafdac" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiClock className="text-blue-600" />
              Audit Logs & History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Complete historical record of all regulatory actions and system changes
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by user, action, or target..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <FiFilter size={20} className="text-gray-600" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Actions</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                No audit logs found
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start gap-6">
                    {/* Timeline Connector */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mt-1" />
                      <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600 my-2" />
                    </div>

                    {/* Log Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {log.timestamp}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                            {log.action}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getActionColor(
                              log.action,
                            )}`}
                          >
                            {log.action}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(
                              log.severity,
                            )}`}
                          >
                            {log.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Target:</strong> {log.target}
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {log.details}
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        <strong>By:</strong> {log.user}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Actions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{filteredLogs.length}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
              <p className="text-red-700 dark:text-red-400 text-sm">Critical</p>
              <p className="text-3xl font-bold text-red-600">
                {filteredLogs.filter((l) => l.severity === "critical").length}
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 p-4">
              <p className="text-orange-700 dark:text-orange-400 text-sm">High</p>
              <p className="text-3xl font-bold text-orange-600">
                {filteredLogs.filter((l) => l.severity === "high").length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
              <p className="text-green-700 dark:text-green-400 text-sm">Low</p>
              <p className="text-3xl font-bold text-green-600">
                {filteredLogs.filter((l) => l.severity === "low").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
