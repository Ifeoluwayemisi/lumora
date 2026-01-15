"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";

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

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [codesRes, productsRes] = await Promise.all([
        api.get(`/manufacturer/history?limit=${pageSize}&page=${page}`),
        api.get("/manufacturer/products?limit=100"),
      ]);

      setCodes(codesRes.data.data || []);
      setProducts(productsRes.data.data || []);
    } catch (err) {
      console.error("[FETCH_DATA] Error:", err);
      toast.error("Failed to load codes");
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = codes.filter((codeLog) => {
    const matchesSearch = codeLog.code
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    // Note: codeLog might be verification log, adjust filtering as needed
    return matchesSearch;
  });

  // Code statistics
  const codeStats = {
    total: codes.length,
    verified: codes.filter((c) => c.verificationState === "VERIFIED").length,
    suspicious: codes.filter((c) =>
      ["SUSPICIOUS_PATTERN", "CODE_ALREADY_USED"].includes(c.verificationState)
    ).length,
  };

  const getProductName = (productId) => {
    return products.find((p) => p.id === productId)?.name || "Unknown";
  };

  const getStatusBadge = (state) => {
    switch (state) {
      case "VERIFIED":
        return {
          text: "Verified",
          color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
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
          color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
          icon: "🔄",
        };
      default:
        return {
          text: state || "Unknown",
          color: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
          icon: "•",
        };
    }
  };

  return (
    <div className="p-4 pt-12 md:pt-16 pb-20 md:pb-4">
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
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
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
                              {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
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
          💡 <strong>Suspicious Activity:</strong> Code reuse attempts and rapid
          verification patterns are automatically flagged. Monitor these closely as
          they may indicate counterfeit activity.
        </p>
      </div>
    </div>
  );
}
