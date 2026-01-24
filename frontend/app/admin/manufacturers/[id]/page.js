"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminManufacturerApi } from "@/services/adminApi";
import { useAdmin } from "@/hooks/useAdmin";
import {
  FiChevronLeft,
  FiCheck,
  FiX,
  FiDownload,
  FiZap,
  FiTrendingDown,
  FiAlertCircle,
} from "react-icons/fi";

export default function ManufacturerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { adminUser, isHydrated } = useAdmin();
  const manufacturerId = params.id;

  const [manufacturer, setManufacturer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Fetch manufacturer details
  useEffect(() => {
    if (isHydrated && adminUser && manufacturerId) {
      fetchManufacturerDetails();
    }
  }, [isHydrated, adminUser, manufacturerId]);

  const fetchManufacturerDetails = async () => {
    try {
      setError("");
      setIsLoading(true);
      const res =
        await adminManufacturerApi.getManufacturerDetail(manufacturerId);
      console.log("[DETAIL] API Response:", res);
      setManufacturer(res);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to load manufacturer details",
      );
      console.error("[DETAIL] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Approval handler
  const handleApprove = async () => {
    if (!window.confirm("Approve this manufacturer application?")) return;
    try {
      setIsProcessing(true);
      await adminManufacturerApi.approveManufacturer(manufacturerId);
      router.push("/admin/manufacturers?status=approved");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve manufacturer");
      setIsProcessing(false);
    }
  };

  // Rejection handler
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }
    if (!window.confirm("Reject this manufacturer application?")) return;
    try {
      setIsProcessing(true);
      await adminManufacturerApi.rejectManufacturer(
        manufacturerId,
        rejectionReason,
      );
      router.push("/admin/manufacturers?status=rejected");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject manufacturer");
      setIsProcessing(false);
    }
  };

  // Audit trigger
  const handleAudit = async () => {
    try {
      setIsProcessing(true);
      setError("");
      const result = await adminManufacturerApi.forceAudit(manufacturerId);
      console.log("[AUDIT_RESULT]", result);

      // Extract data from response (handle both wrapped and unwrapped responses)
      const auditData = result.data || result;
      const riskScore = auditData.riskScore ?? result.riskScore ?? "N/A";
      const trustScore = auditData.trustScore ?? result.trustScore ?? "N/A";
      const summary =
        auditData.summary ?? result.summary ?? "Audit completed successfully";

      // Show success message
      alert(
        `✅ Audit Complete!\n\nRisk Score: ${riskScore}\nTrust Score: ${trustScore}\n\n${summary}`,
      );

      // Refresh manufacturer details to show updated scores
      await fetchManufacturerDetails();
    } catch (err) {
      console.error("[AUDIT_ERROR]", err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to trigger audit";
      setError(errorMsg);
      alert(`❌ Audit Failed: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Suspend handler
  const handleSuspend = async () => {
    if (!window.confirm("Suspend this manufacturer account?")) return;
    try {
      setIsProcessing(true);
      await adminManufacturerApi.suspendManufacturer(manufacturerId);
      router.push("/admin/manufacturers?status=suspended");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to suspend manufacturer");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiZap className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading manufacturer details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!manufacturer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <FiChevronLeft className="w-4 h-4" />
            Back to Manufacturers
          </button>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiAlertCircle className="w-12 h-12 mx-auto text-red-600 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Manufacturer not found
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {manufacturer.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {manufacturer.country}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                manufacturer.accountStatus === "pending_verification"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : manufacturer.accountStatus === "verified"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : manufacturer.accountStatus === "rejected"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {manufacturer.accountStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Company Information */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Company Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Company Name
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {manufacturer.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Email
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {manufacturer.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Phone
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {manufacturer.phone || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Country
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {manufacturer.country}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Plan
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {manufacturer.plan}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Created
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {new Date(manufacturer.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Trust & Risk Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Trust Score
              </h3>
              <div className="text-3xl font-bold text-blue-600">
                {manufacturer.trustScore || 0}
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(manufacturer.trustScore || 0) * 2}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Risk Level
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  manufacturer.riskLevel === "LOW"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : manufacturer.riskLevel === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {manufacturer.riskLevel}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {manufacturer.verified
                ? "Manufacturer verified and active"
                : "Pending verification"}
            </p>
          </div>
        </div>

        {/* Documents */}
        {manufacturer.documents && manufacturer.documents.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Submitted Documents ({manufacturer.documents.length})
            </h2>
            <div className="space-y-3">
              {manufacturer.documents.map((doc, idx) => {
                const docUrl = doc.url || doc.fileUrl || doc.path;
                const docName =
                  doc.name || doc.fileName || doc.type || `Document ${idx + 1}`;
                const docType =
                  doc.type || doc.documentType || "Uploaded document";

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center gap-3">
                      <FiDownload className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-200">
                          {docName}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {docType}
                        </p>
                      </div>
                    </div>
                    {docUrl ? (
                      <a
                        href={docUrl}
                        download={docName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                      >
                        <FiDownload className="w-4 h-4" />
                        Download
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        No URL
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Review Actions
          </h2>

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                className="w-full mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="4"
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiX className="w-4 h-4" />
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiCheck className="w-5 h-5" />
              Approve Application
            </button>

            <button
              onClick={() => setShowRejectForm(!showRejectForm)}
              disabled={isProcessing || showRejectForm}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiX className="w-5 h-5" />
              Reject Application
            </button>

            <button
              onClick={handleAudit}
              disabled={isProcessing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiTrendingDown className="w-5 h-5" />
              Run AI Audit
            </button>

            <button
              onClick={handleSuspend}
              disabled={isProcessing}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              Suspend Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
