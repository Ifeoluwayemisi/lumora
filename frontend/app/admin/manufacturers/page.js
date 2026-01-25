"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminManufacturerApi } from "@/services/adminApi";
import { useAdmin } from "@/hooks/useAdmin";
import {
  FiChevronRight,
  FiEye,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiDownload,
  FiRefreshCw,
  FiZap,
  FiTrendingDown,
} from "react-icons/fi";

export default function ManufacturersPage() {
  const router = useRouter();
  const { adminUser, isHydrated } = useAdmin();

  // UI State
  const [activeTab, setActiveTab] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data
  const [reviewQueue, setReviewQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Fetch review queue with status parameter
  const fetchReviewQueue = async (page = 1, status = "pending") => {
    try {
      setError("");
      const res = await adminManufacturerApi.getReviewQueue(page, 10, status);
      setReviewQueue(res.data.items || []);
      setPagination({
        page: res.data.currentPage,
        limit: res.data.pageSize,
        total: res.data.total,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load review queue");
      console.error("[MANUFACTURERS] Error:", err);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await adminManufacturerApi.getReviewQueueStats();
      setStats(res.data);
    } catch (err) {
      console.error("[STATS] Error:", err);
    }
  };

  // Initial load
  useEffect(() => {
    if (isHydrated && adminUser) {
      Promise.all([fetchReviewQueue(1, activeTab), fetchStats()]).then(() =>
        setIsLoading(false),
      );
    }
  }, [isHydrated, adminUser, activeTab]);

  // Approval handler
  const handleApprove = async (mfgId) => {
    if (!window.confirm("Approve this manufacturer?")) return;
    try {
      setIsProcessing(true);
      await adminManufacturerApi.approveManufacturer(mfgId);
      // After approval, switch to approved tab and refresh
      setActiveTab("approved");
      await Promise.all([fetchReviewQueue(1, "approved"), fetchStats()]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve manufacturer");
    } finally {
      setIsProcessing(false);
    }
  };

  // Rejection handler
  const handleReject = async (mfgId, reason) => {
    if (!reason.trim()) {
      setError("Rejection reason is required");
      return;
    }
    try {
      setIsProcessing(true);
      await adminManufacturerApi.rejectManufacturer(mfgId, reason);
      // After rejection, switch to rejected tab and refresh
      setActiveTab("rejected");
      await Promise.all([fetchReviewQueue(1, "rejected"), fetchStats()]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject manufacturer");
    } finally {
      setIsProcessing(false);
    }
  };

  // Suspend handler
  const handleSuspend = async (mfgId) => {
    if (!window.confirm("Suspend this manufacturer account?")) return;
    try {
      setIsProcessing(true);
      await adminManufacturerApi.suspendManufacturer(mfgId);
      // After suspension, switch to suspended tab and refresh
      setActiveTab("suspended");
      await Promise.all([fetchReviewQueue(1, "suspended"), fetchStats()]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to suspend manufacturer");
    } finally {
      setIsProcessing(false);
    }
  };

  // Audit trigger
  const handleAudit = async (mfgId) => {
    try {
      setIsProcessing(true);
      await adminManufacturerApi.forceAudit(mfgId);
      await Promise.all([fetchReviewQueue(1, activeTab), fetchStats()]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to trigger audit");
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manufacturer Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review & approve new manufacturer applications
              </p>
            </div>
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await Promise.all([
                  fetchReviewQueue(pagination.page, activeTab),
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
          <button
            onClick={() => setActiveTab("pending")}
            className={`bg-white dark:bg-gray-900 rounded-lg border p-4 hover:shadow-lg transition cursor-pointer text-left ${
              activeTab === "pending"
                ? "border-blue-500 dark:border-blue-600 shadow-lg"
                : "border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
            }`}
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Pending Review
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.pendingCount || 0}
            </p>
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`bg-white dark:bg-gray-900 rounded-lg border p-4 hover:shadow-lg transition cursor-pointer text-left ${
              activeTab === "approved"
                ? "border-green-500 dark:border-green-600 shadow-lg"
                : "border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700"
            }`}
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Approved
            </p>
            <p className="text-2xl font-bold text-green-600">
              {stats.approvedCount || 0}
            </p>
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`bg-white dark:bg-gray-900 rounded-lg border p-4 hover:shadow-lg transition cursor-pointer text-left ${
              activeTab === "rejected"
                ? "border-red-500 dark:border-red-600 shadow-lg"
                : "border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-700"
            }`}
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Rejected
            </p>
            <p className="text-2xl font-bold text-red-600">
              {stats.rejectedCount || 0}
            </p>
          </button>
          <button
            onClick={() => setActiveTab("suspended")}
            className={`bg-white dark:bg-gray-900 rounded-lg border p-4 hover:shadow-lg transition cursor-pointer text-left ${
              activeTab === "suspended"
                ? "border-orange-500 dark:border-orange-600 shadow-lg"
                : "border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700"
            }`}
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Suspended
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.suspendedCount || 0}
            </p>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiZap className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
          </div>
        ) : reviewQueue.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiCheck className="w-12 h-12 mx-auto text-green-600 mb-3 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">
              No manufacturers awaiting review
            </p>
          </div>
        ) : (
          <>
            {/* Review Queue Table */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Company
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Contact Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Submitted
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {reviewQueue.map((mfg) => (
                      <tr
                        key={mfg.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                        onClick={() =>
                          router.push(`/admin/manufacturers/${mfg.id}`)
                        }
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {mfg.companyName}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {mfg.email}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              mfg.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : mfg.status === "APPROVED"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : mfg.status === "REJECTED"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {mfg.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(mfg.createdAt).toLocaleDateString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMfg(mfg);
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
                      fetchReviewQueue(Math.max(1, pagination.page - 1))
                    }
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      fetchReviewQueue(
                        Math.min(totalPages, pagination.page + 1),
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
    </div>
  );
}
