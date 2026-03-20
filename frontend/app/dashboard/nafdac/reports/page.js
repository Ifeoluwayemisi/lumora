"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import api from "@/services/api";
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiCheck,
  FiAlertCircle,
  FiMessageSquare,
} from "react-icons/fi";

/**
 * Reports Management System
 * Role-based access: NAFDAC only
 */
export default function ReportsManagementPage() {
  const router = useRouter();
  const { user, isHydrated } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Security: Verify role authorization
  useEffect(() => {
    if (!isHydrated) return;

    if (!user || user.role !== "NAFDAC") {
      router.replace("/auth/login");
      return;
    }
  }, [isHydrated, user, router]);

  // Fetch reports only after auth is confirmed
  useEffect(() => {
    if (!user || user.role !== "NAFDAC") return;

    const fetchReports = async () => {
      try {
        const response = await api.get("/nafdac/reports");
        setReports(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("[NAFDAC_REPORTS] Error fetching reports:", error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const getPriorityColor = (priority) => {
    if (priority === "critical")
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
    if (priority === "high")
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
    return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
  };

  const getStatusColor = (status) => {
    if (status === "resolved")
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
    if (status === "investigated")
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <AuthGuard allowedRoles={["NAFDAC"]}>
      <DashboardSidebar userRole="nafdac" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reports Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review user-submitted reports of suspicious products and take
              regulatory action
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by product, code, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <FiFilter size={20} className="text-gray-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="new">New Reports</option>
                  <option value="investigated">Investigated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports Cards */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                Loading reports...
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                No reports found
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <FiFileText
                          className="text-amber-600 dark:text-amber-400"
                          size={24}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {report.productName || "Unknown Product"}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Code:{" "}
                          <span className="font-mono">
                            {report.code || "-"}
                          </span>
                        </p>
                        {report.location && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Location: {report.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                          report.priority || "medium",
                        )}`}
                      >
                        {report.priority?.toUpperCase() || "MEDIUM"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          report.status || "new",
                        )}`}
                      >
                        {report.status?.toUpperCase() || "NEW"}
                      </span>
                    </div>
                  </div>

                  {report.message && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <FiMessageSquare className="inline mr-2" />
                        {report.message}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Reported {report.timestamp || "recently"}
                    </p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">
                        <FiCheck size={16} />
                        Mark Reviewed
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm">
                        <FiAlertCircle size={16} />
                        Escalate
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Reports
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {filteredReports.length}
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
              <p className="text-amber-700 dark:text-amber-400 text-sm">New</p>
              <p className="text-3xl font-bold text-amber-600">
                {filteredReports.filter((r) => r.status === "new").length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                Investigated
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {
                  filteredReports.filter((r) => r.status === "investigated")
                    .length
                }
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
              <p className="text-green-700 dark:text-green-400 text-sm">
                Resolved
              </p>
              <p className="text-3xl font-bold text-green-600">
                {filteredReports.filter((r) => r.status === "resolved").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
