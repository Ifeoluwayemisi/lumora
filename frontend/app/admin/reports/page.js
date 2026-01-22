"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { adminReportApi } from "@/services/adminApi";
import {
  AdminLoadingSpinner,
  AdminErrorMessage,
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminSelect,
  AdminModal,
  AdminTextarea,
  AdminCard,
} from "@/components/admin/AdminComponents";
import {
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiCheck,
  FiLink2,
  FiMapPin,
} from "react-icons/fi";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("NEW");
  const [search, setSearch] = useState("");

  // Modal states
  const [detailModal, setDetailModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [riskLevel, setRiskLevel] = useState("MEDIUM");
  const [reviewNotes, setReviewNotes] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkedCaseId, setLinkedCaseId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [page, pageSize, status, search]);

  const fetchReports = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await adminReportApi.getReports(
        status,
        (page - 1) * pageSize,
        pageSize,
        search || undefined,
      );
      setReports(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedReport) return;
    setSubmitting(true);
    setError("");

    try {
      await adminReportApi.reviewReport(selectedReport.id, {
        riskLevel,
        notes: reviewNotes,
      });
      setSuccess("Report reviewed successfully");
      setReviewModal(false);
      setReviewNotes("");
      setRiskLevel("MEDIUM");
      setSelectedReport(null);
      await fetchReports();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Review failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkToCase = async () => {
    if (!selectedReport || !linkedCaseId) return;
    setSubmitting(true);
    setError("");

    try {
      await adminReportApi.linkToCase(selectedReport.id, linkedCaseId);
      setSuccess("Report linked to case successfully");
      setLinking(false);
      setLinkedCaseId("");
      setDetailModal(false);
      setSelectedReport(null);
      await fetchReports();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Link failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = async (reportId) => {
    setSubmitting(true);
    setError("");

    try {
      await adminReportApi.dismissReport(reportId);
      setSuccess("Report dismissed successfully");
      await fetchReports();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Dismiss failed");
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      LOW: "text-green-600",
      MEDIUM: "text-yellow-600",
      HIGH: "text-orange-600",
      CRITICAL: "text-red-600",
    };
    return colors[level] || "text-gray-600";
  };

  const getStatusVariant = (status) => {
    const variants = {
      NEW: "warning",
      UNDER_REVIEW: "default",
      REVIEWED: "success",
      LINKED_TO_CASE: "info",
      DISMISSED: "danger",
    };
    return variants[status] || "default";
  };

  if (isLoading && reports.length === 0) return <AdminLoadingSpinner />;

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {error && <AdminErrorMessage message={error} />}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          ✓ {success}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Reports</h1>
          <p className="text-gray-600 mt-1">
            Review and manage counterfeit reports
          </p>
        </div>
        <AdminButton onClick={fetchReports} disabled={isLoading}>
          <FiRefreshCw size={18} />
          Refresh
        </AdminButton>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminInput
            label="Search by Product/ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Enter product name or report ID..."
          />
          <AdminSelect
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="NEW">New</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="LINKED_TO_CASE">Linked to Case</option>
            <option value="DISMISSED">Dismissed</option>
          </AdminSelect>
          <div className="flex items-end">
            <AdminButton className="w-full" onClick={fetchReports}>
              <FiSearch size={18} />
              Search
            </AdminButton>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminCard
          title="Total Reports"
          value={total.toString()}
          icon={FiSearch}
        />
        <AdminCard
          title="Current Page"
          value={`${page} of ${totalPages}`}
          icon={FiRefreshCw}
        />
        <AdminCard
          title="Page Size"
          value={pageSize.toString()}
          icon={FiMapPin}
        />
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {report.productName}
                      </p>
                      <p className="text-xs text-gray-600">{report.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {report.reporterName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {report.reporterEmail}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.location}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold ${getRiskColor(report.riskLevel)}`}
                      >
                        {report.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge variant={getStatusVariant(report.status)}>
                        {report.status.replace(/_/g, " ")}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReport(report);
                          setDetailModal(true);
                        }}
                      >
                        <FiEye size={16} />
                        View
                      </AdminButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, total)} of {total}
            </div>
            <div className="flex gap-2">
              <AdminButton
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </AdminButton>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={(e) =>
                  setPage(
                    Math.min(
                      totalPages,
                      Math.max(1, parseInt(e.target.value) || 1),
                    ),
                  )
                }
                className="px-2 py-1 border border-gray-300 rounded text-sm w-12 text-center"
              />
              <span className="px-2 py-1 text-sm text-gray-600">
                of {totalPages}
              </span>
              <AdminButton
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </AdminButton>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailModal && selectedReport && (
        <AdminModal
          title={`Report Details - ${selectedReport.productName}`}
          onClose={() => {
            setDetailModal(false);
            setSelectedReport(null);
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Product Name</p>
                <p className="font-semibold text-gray-900">
                  {selectedReport.productName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Report ID</p>
                <p className="font-semibold text-gray-900">
                  {selectedReport.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reporter</p>
                <p className="font-semibold text-gray-900">
                  {selectedReport.reporterName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">
                  {selectedReport.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Level</p>
                <p
                  className={`text-lg font-bold ${getRiskColor(selectedReport.riskLevel)}`}
                >
                  {selectedReport.riskLevel}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <AdminBadge variant={getStatusVariant(selectedReport.status)}>
                  {selectedReport.status.replace(/_/g, " ")}
                </AdminBadge>
              </div>
            </div>

            {selectedReport.description && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                  {selectedReport.description}
                </div>
              </div>
            )}

            {selectedReport.evidence && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Evidence</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedReport.evidence.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Evidence"
                      className="rounded h-40 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              {selectedReport.status === "NEW" && (
                <>
                  <AdminButton
                    variant="primary"
                    onClick={() => setReviewModal(true)}
                  >
                    <FiCheck size={16} />
                    Review
                  </AdminButton>
                  <AdminButton
                    variant="danger"
                    onClick={() => handleDismiss(selectedReport.id)}
                    disabled={submitting}
                  >
                    Dismiss
                  </AdminButton>
                </>
              )}
              {selectedReport.status !== "DISMISSED" &&
                selectedReport.status !== "LINKED_TO_CASE" && (
                  <AdminButton
                    variant="secondary"
                    onClick={() => setLinking(true)}
                  >
                    <FiLink2 size={16} />
                    Link to Case
                  </AdminButton>
                )}
            </div>
          </div>
        </AdminModal>
      )}

      {/* Review Modal */}
      {reviewModal && selectedReport && (
        <AdminModal
          title={`Review Report - ${selectedReport.productName}`}
          onClose={() => setReviewModal(false)}
        >
          <div className="space-y-4">
            <AdminSelect
              label="Risk Level"
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
            >
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </AdminSelect>

            <AdminTextarea
              label="Review Notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Enter your review analysis..."
              required
            />

            <div className="flex gap-2 pt-4 border-t">
              <AdminButton
                onClick={handleReview}
                disabled={submitting || !reviewNotes}
              >
                {submitting ? "Processing..." : "Submit Review"}
              </AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => setReviewModal(false)}
                disabled={submitting}
              >
                Cancel
              </AdminButton>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Link to Case Modal */}
      {linking && selectedReport && (
        <AdminModal title="Link to Case" onClose={() => setLinking(false)}>
          <div className="space-y-4">
            <p className="text-gray-700">
              Enter the case ID to link this report to an existing case:
            </p>

            <AdminInput
              label="Case ID"
              value={linkedCaseId}
              onChange={(e) => setLinkedCaseId(e.target.value)}
              placeholder="Enter case ID..."
              required
            />

            <div className="flex gap-2 pt-4 border-t">
              <AdminButton
                onClick={handleLinkToCase}
                disabled={submitting || !linkedCaseId}
              >
                {submitting ? "Linking..." : "Link Report"}
              </AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => setLinking(false)}
                disabled={submitting}
              >
                Cancel
              </AdminButton>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
