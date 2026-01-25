"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api, { getStaticFileUrl } from "@/services/api";
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
  const [selectedCode, setSelectedCode] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (batchId) {
      fetchBatchDetail();
    }
  }, [batchId]);

  const fetchBatchDetail = async () => {
    setLoading(true);
    try {
      console.log("[BATCH_FETCH] Starting fetch for batch:", batchId);
      const response = await api.get(`/manufacturer/batch/${batchId}`);
      console.log("[BATCH_FETCH] Full response received:", response.data);

      if (response.data.batch && response.data.batch.codes) {
        console.log(
          "[BATCH_FETCH] Total codes:",
          response.data.batch.codes.length,
        );

        // Log sample codes with their paths
        const samples = response.data.batch.codes.slice(0, 3);
        console.log("[BATCH_FETCH] Sample codes from API:");
        samples.forEach((code) => {
          console.log(`  - Code: ${code.codeValue}`);
          console.log(`    QR Path: ${code.qrImagePath}`);
          console.log(`    Type: ${typeof code.qrImagePath}`);
          console.log(`    Is relative: ${code.qrImagePath?.startsWith("/")}`);
        });
      }

      setBatch(response.data.batch);
    } catch (err) {
      console.error("[BATCH_FETCH] Error:", err);
      toast.error("Failed to load batch details");
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = batch?.codes
    ? batch.codes.filter((code) => {
        const codeValue = code.codeValue || "";
        const matchesSearch = codeValue
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const codeStatus = code.isUsed ? "USED" : "UNUSED";
        const matchesStatus =
          statusFilter === "ALL" || codeStatus === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  const codeStats = batch?.codes
    ? {
        total: batch.codes.length,
        unused: batch.codes.filter((c) => !c.isUsed).length,
        verified: batch.codes.filter((c) => c.isUsed).length,
        flagged: 0,
        blacklisted: 0,
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
      console.log("[DOWNLOAD_PDF] Starting PDF download for batch:", batchId);

      // Download as PDF with QR codes
      const response = await api.get(
        `/manufacturer/batch/${batchId}/download-pdf`,
        {
          responseType: "blob",
        },
      );

      console.log("[DOWNLOAD_PDF] Response received:");
      console.log("  Content-Type:", response.headers["content-type"]);
      console.log("  Blob size:", response.data.size, "bytes");
      console.log("  Blob type:", response.data.type);

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `batch_${batchId}_codes.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("[DOWNLOAD_PDF] File download triggered");
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error("[DOWNLOAD_PDF] Error:", err);
      console.error("[DOWNLOAD_PDF] Response data:", err.response?.data);
      console.error("[DOWNLOAD_PDF] Response headers:", err.response?.headers);
      // Fallback to CSV if PDF fails
      downloadCSV();
    }
  };

  const downloadCSV = async () => {
    try {
      console.log("[DOWNLOAD_CSV] Starting CSV download for batch:", batchId);

      const response = await api.get(
        `/manufacturer/batch/${batchId}/download`,
        {
          responseType: "blob",
        },
      );

      console.log("[DOWNLOAD_CSV] Response received:");
      console.log("  Content-Type:", response.headers["content-type"]);
      console.log("  Response status:", response.status);
      console.log("  Blob size:", response.data.size, "bytes");
      console.log("  Blob type:", response.data.type);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `batch_${batchId}_codes.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("[DOWNLOAD_CSV] File download triggered");
      toast.success("CSV downloaded successfully!");
    } catch (err) {
      console.error("[DOWNLOAD_CSV] Error:", err);
      console.error("[DOWNLOAD_CSV] Response status:", err.response?.status);
      console.error("[DOWNLOAD_CSV] Response headers:", err.response?.headers);
      console.error(
        "[DOWNLOAD_CSV] Response data type:",
        typeof err.response?.data,
      );
      if (err.response?.data) {
        console.error(
          "[DOWNLOAD_CSV] Response data (first 500 chars):",
          err.response.data.toString().substring(0, 500),
        );
      }
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
          <div className="space-y-2">
            <button
              onClick={downloadCodes}
              className="w-full text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              title="Download as printable PDF with QR codes"
            >
              📄 PDF
            </button>
            <button
              onClick={downloadCSV}
              className="w-full text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              title="Download as CSV file"
            >
              📊 CSV
            </button>
          </div>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-2">
            Download
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
          <option value="USED">Used</option>
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
                        {code.codeValue}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          !code.isUsed
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        }`}
                      >
                        {code.isUsed ? "USED" : "UNUSED"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(code.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setSelectedCode(code);
                            setShowQRModal(true);
                          }}
                          className="px-3 py-1 text-sm rounded-lg font-medium transition-colors bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                          title="View QR Code"
                        >
                          📱 QR
                        </button>
                        <button
                          onClick={() => copyToClipboard(code.codeValue)}
                          className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                            copied === code.codeValue
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {copied === code.codeValue ? "✓ Copied" : "📋 Copy"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                QR Code
              </h3>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedCode(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center space-y-4">
              {/* QR Code Image */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {selectedCode?.qrImagePath ? (
                  <>
                    <img
                      src={selectedCode.qrImagePath}
                      alt={`QR Code for ${selectedCode.codeValue}`}
                      className="w-64 h-64 object-contain"
                      onError={(e) => {
                        console.error(
                          "[QR_IMAGE_ERROR] Failed to load QR code",
                        );
                        console.error(
                          "[QR_IMAGE_ERROR] Code:",
                          selectedCode.codeValue,
                        );
                        console.error(
                          "[QR_IMAGE_ERROR] Is data URI:",
                          selectedCode.qrImagePath?.startsWith("data:"),
                        );
                        e.target.src =
                          "https://via.placeholder.com/256?text=QR+Not+Available";
                      }}
                      onLoad={() => {
                        console.log(
                          "[QR_IMAGE_SUCCESS] QR loaded successfully for code:",
                          selectedCode.codeValue,
                        );
                      }}
                    />
                  </>
                ) : (
                  <>
                    {console.log(
                      "[QR_MODAL] qrImagePath is null/undefined:",
                      selectedCode?.qrImagePath,
                    )}
                    <img
                      src="https://via.placeholder.com/256?text=QR+Not+Available"
                      alt="QR Not Available"
                      className="w-64 h-64 object-contain"
                    />
                    <p className="text-sm text-red-600">
                      QR code not available
                    </p>
                  </>
                )}
              </div>

              {/* Code Value */}
              <div className="w-full">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Code Value:
                </p>
                <code className="block text-sm font-mono bg-gray-100 dark:bg-gray-700 p-3 rounded text-center text-gray-900 dark:text-white break-all">
                  {selectedCode.codeValue}
                </code>
              </div>

              {/* Status */}
              <div className="w-full">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Status:
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    !selectedCode.isUsed
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  }`}
                >
                  {selectedCode.isUsed ? "USED" : "UNUSED"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex gap-2 mt-4">
                <button
                  onClick={() => {
                    copyToClipboard(selectedCode.codeValue);
                    setShowQRModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  📋 Copy Code
                </button>
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setSelectedCode(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Print Hint */}
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-4">
                💡 Right-click the QR code to print or save as image
              </p>
            </div>
          </div>
        </div>
      )}

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
