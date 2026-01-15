"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";

/**
 * Batch Detail Page
 *
 * Features:
 * - View all codes in a batch
 * - Filter codes by status (Unused, Verified, Flagged, Blacklisted)
 * - Search codes
 * - Copy code to clipboard
 * - View code QR code
 * - Download codes as CSV
 * - Code statistics
 */

export default function BatchDetailPage() {
  const params = useParams();
  const batchId = params?.id;

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (batchId) {
      fetchBatchDetail();
    }
  }, [batchId]);

  const fetchBatchDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/manufacturer/batch/${batchId}`);
      setBatch(response.data.batch);
    } catch (err) {
      console.error("[FETCH_DETAIL] Error:", err);
      toast.error("Failed to load batch details");
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = batch?.codes
    ? batch.codes.filter((code) => {
        const matchesSearch = code.code
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "ALL" || code.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  const codeStats = batch?.codes
    ? {
        total: batch.codes.length,
        unused: batch.codes.filter((c) => c.status === "UNUSED").length,
        verified: batch.codes.filter((c) => c.status === "VERIFIED").length,
        flagged: batch.codes.filter((c) => c.status === "FLAGGED").length,
        blacklisted: batch.codes.filter((c) => c.status === "BLACKLISTED")
          .length,
      }
    : { total: 0, unused: 0, verified: 0, flagged: 0, blacklisted: 0 };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadCodes = async () => {
    try {
      const response = await api.get(
        `/manufacturer/batch/${batchId}/download`,
        {
          responseType: "blob",
        }
      );

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `batch_${batchId}_codes.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Codes downloaded successfully!");
    } catch (err) {
      console.error("[DOWNLOAD] Error:", err);
      toast.error("Failed to download codes");
    }
  };

  if (loading) {
    return (
      <div className="p-4 pt-12 md:pt-16 pb-20 md:pb-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading batch details...
          </p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-4 pt-12 md:pt-16 pb-20 md:pb-4 min-h-screen">
        <div className="text-center mt-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Batch Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This batch does not exist or you don't have access to it.
          </p>
          <Link
            href="/dashboard/manufacturer/batches"
            className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            Back to Batches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-12 md:pt-16 pb-20 md:pb-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/manufacturer/batches"
          className="text-green-600 hover:text-green-700 font-medium mb-4 inline-block"
        >
          ← Back to Batches
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Batch Details
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Batch ID: {batchId?.substring(0, 8)}...
        </p>
      </div>

      {/* Batch Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Product */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Product
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {batch.product?.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {batch.product?.category}
          </p>
        </div>

        {/* Total Codes */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Total Codes
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {codeStats.total}
          </p>
        </div>

        {/* Expiration Date */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Expires
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {new Date(batch.expirationDate).toLocaleDateString()}
          </p>
          {new Date(batch.expirationDate) < new Date() && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              ⚠️ Expired
            </p>
          )}
        </div>

        {/* Created Date */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Created
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {new Date(batch.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Code Status Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Unused
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {codeStats.unused}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300 mb-1">
            Verified
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {codeStats.verified}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">
            Flagged
          </p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {codeStats.flagged}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-300 mb-1">
            Blacklisted
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {codeStats.blacklisted}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <button
            onClick={downloadCodes}
            className="text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline"
          >
            ⬇ Download
          </button>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            CSV
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search codes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="ALL">All Status</option>
          <option value="UNUSED">Unused</option>
          <option value="VERIFIED">Verified</option>
          <option value="FLAGGED">Flagged</option>
          <option value="BLACKLISTED">Blacklisted</option>
        </select>
      </div>

      {/* Codes List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Verification Codes ({filteredCodes.length})
          </h2>
        </div>

        {filteredCodes.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            <p>No codes found matching your filters</p>
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
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCodes.map((code) => (
                  <tr
                    key={code.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <code className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {code.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          code.status === "UNUSED"
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            : code.status === "VERIFIED"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : code.status === "FLAGGED"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {code.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(code.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                          copied === code.code
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {copied === code.code ? "✓ Copied" : "📋 Copy"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          💡 <strong>Tip:</strong> Use the filter dropdown to view codes by
          status. Click "Copy" to copy individual codes to your clipboard for
          easy sharing.
        </p>
      </div>
    </div>
  );
}
