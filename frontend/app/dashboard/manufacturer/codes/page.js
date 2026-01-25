"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { FiArrowLeft } from "react-icons/fi";

/**
 * Manufacturer Codes Page
 *
 * Features:
 * - View all codes across all batches
 * - Filter by status (Unused, Verified, Flagged, Blacklisted)
 * - Filter by product
 * - Search codes
 * - View code verification history
 * - Real-time status updates
 * - Code analytics
 */

export default function CodesPage() {
  const [codes, setCodes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [flagFormData, setFlagFormData] = useState({
    reason: "suspicious_pattern",
    severity: "medium",
    notes: "",
  });
  const [flagging, setFlagging] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [codesRes, productsRes, profileRes] = await Promise.all([
        api.get(`/manufacturer/codes?limit=${pageSize}&page=${page}`),
        api.get("/manufacturer/products?limit=100"),
        api.get("/manufacturer/profile"),
      ]);

      setCodes(codesRes.data?.data || []);
      setProducts(productsRes.data?.data || []);
      setIsPremium(profileRes.data?.manufacturer?.plan === "PREMIUM");
    } catch (err) {
      console.error("[FETCH_DATA] Error:", err.response?.data || err.message);
      toast.error(
        "Failed to load codes - " +
          (err.response?.data?.message || err.message),
      );
      setCodes([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = codes.filter((codeLog) => {
    const matchesSearch = codeLog.code
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesProduct =
      productFilter === "ALL" || codeLog.productId === productFilter;
    return matchesSearch && matchesProduct;
  });

  // Code statistics
  const codeStats = {
    total: codes.length,
    verified: codes.filter((c) => c.verificationState === "VERIFIED").length,
    suspicious: codes.filter((c) =>
      ["SUSPICIOUS_PATTERN", "CODE_ALREADY_USED"].includes(c.verificationState),
    ).length,
  };

  const getProductName = (productId) => {
    return products.find((p) => p.id === productId)?.name || "Unknown";
  };

  const handleFlagCode = (code) => {
    setSelectedCode(code);
    setShowFlagModal(true);
  };

  const submitFlagCode = async () => {
    if (!selectedCode || !flagFormData.reason) {
      toast.error("Please select a reason");
      return;
    }

    setFlagging(true);
    try {
      await api.post(`/manufacturer/codes/${selectedCode.id}/flag`, {
        reason: flagFormData.reason,
        severity: flagFormData.severity,
        notes: flagFormData.notes,
      });

      toast.success("Code flagged successfully");
      setShowFlagModal(false);
      setSelectedCode(null);
      setFlagFormData({
        reason: "suspicious_pattern",
        severity: "medium",
        notes: "",
      });

      // Refresh codes
      await fetchData();
    } catch (error) {
      console.error("[FLAG_CODE] Error:", error);
      toast.error(
        "Failed to flag code - " +
          (error.response?.data?.error || error.message),
      );
    } finally {
      setFlagging(false);
    }
  };

  const getStatusBadge = (state) => {
    switch (state) {
      case "VERIFIED":
        return {
          text: "Verified",
          color:
            "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
          icon: "✓",
        };
      case "SUSPICIOUS_PATTERN":
        return {
          text: "Suspicious",
          color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
          icon: "⚠️",
        };
      case "CODE_ALREADY_USED":
        return {
          text: "Already Used",
          color:
            "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
          icon: "🔄",
        };
      default:
        return {
          text: state || "Unknown",
          color:
            "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
          icon: "•",
        };
    }
  };

  return (
    <>
      <DashboardSidebar userRole="manufacturer" />
      <MobileBottomNav userRole="manufacturer" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 pt-12 md:pt-16">
          <Link
            href="/dashboard/manufacturer"
            className="flex items-center gap-2 text-green-600 hover:text-green-700 dark:hover:text-green-400 font-medium mb-6"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              All Codes & Verifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View all code verification activity and status tracking
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Codes
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {codeStats.total}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Verified
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {codeStats.verified}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Suspicious Activity
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {codeStats.suspicious}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ALL">All Products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Logs Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Verification Activity
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  Loading verification logs...
                </p>
              </div>
            ) : codes.length === 0 ? (
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                <p>No verification activity yet</p>
                <Link
                  href="/dashboard/manufacturer/batches"
                  className="mt-4 inline-block text-green-600 hover:underline font-medium"
                >
                  Create your first batch to start
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Verified Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCodes.slice(0, 20).map((log) => {
                      const badge = getStatusBadge(log.verificationState);
                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <code className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {log.code?.substring(0, 16)}...
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}
                            >
                              {badge.icon} {badge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(log.createdAt).toLocaleDateString()}
                            <br />
                            <span className="text-xs text-gray-500">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {log.latitude && log.longitude ? (
                              <div>
                                <div>
                                  {log.latitude.toFixed(4)},{" "}
                                  {log.longitude.toFixed(4)}
                                </div>
                                <a
                                  href={`https://maps.google.com/?q=${log.latitude},${log.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:underline text-xs"
                                >
                                  View on Map
                                </a>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                if (!isPremium) {
                                  toast.error(
                                    "Upgrade to Premium to flag codes",
                                  );
                                  return;
                                }
                                handleFlagCode(log);
                              }}
                              disabled={!isPremium}
                              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                                isPremium
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 cursor-pointer"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50"
                              }`}
                              title={
                                isPremium
                                  ? "Flag this code as suspicious or blacklist"
                                  : "Premium feature - Upgrade to unlock"
                              }
                            >
                              🚩 Flag{" "}
                              {!isPremium && (
                                <span className="text-xs">🔒</span>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {codes.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={codes.length < pageSize}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next →
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              💡 <strong>Suspicious Activity:</strong> Code reuse attempts and
              rapid verification patterns are automatically flagged. Monitor
              these closely as they may indicate counterfeit activity.
            </p>
          </div>

          {/* Flag Code Modal */}
          {showFlagModal && selectedCode && isPremium && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    🚩 Flag Code
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Code:{" "}
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {selectedCode.code?.substring(0, 20)}...
                    </code>
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason
                    </label>
                    <select
                      value={flagFormData.reason}
                      onChange={(e) =>
                        setFlagFormData({
                          ...flagFormData,
                          reason: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="suspicious_pattern">
                        Suspicious Pattern
                      </option>
                      <option value="duplicate_use">
                        Duplicate/Multiple Uses
                      </option>
                      <option value="counterfeits">
                        Suspected Counterfeit
                      </option>
                      <option value="blacklist">Blacklist (Stolen/Lost)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Severity
                    </label>
                    <select
                      value={flagFormData.severity}
                      onChange={(e) =>
                        setFlagFormData({
                          ...flagFormData,
                          severity: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={flagFormData.notes}
                      onChange={(e) =>
                        setFlagFormData({
                          ...flagFormData,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Add details about why this code is being flagged..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                  <button
                    onClick={() => setShowFlagModal(false)}
                    disabled={flagging}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitFlagCode}
                    disabled={flagging}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {flagging ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        Flagging...
                      </>
                    ) : (
                      <>🚩 Flag Code</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
