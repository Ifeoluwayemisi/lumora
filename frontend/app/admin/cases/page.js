"use client";

import { useState, useEffect } from "react";
import { adminCaseApi } from "@/services/adminApi";
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
  FiMessageSquare,
  FiTrendingUp,
  FiAlertTriangle,
} from "react-icons/fi";

export default function CaseManagementPage() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("OPEN");
  const [search, setSearch] = useState("");

  // Modal states
  const [detailModal, setDetailModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [escalateModal, setEscalateModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [note, setNote] = useState("");
  const [escalationData, setEscalationData] = useState({
    manufacturerDetails: "",
    productDetails: "",
    bundle: [],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCases();
  }, [page, pageSize, status, search]);

  const fetchCases = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await adminCaseApi.getCases(
        status,
        (page - 1) * pageSize,
        pageSize,
        search || undefined,
      );
      setCases(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load cases");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedCase || !note) return;
    setSubmitting(true);
    setError("");

    try {
      await adminCaseApi.addNote(selectedCase.id, {
        content: note,
      });
      setSuccess("Note added successfully");
      setNoteModal(false);
      setNote("");
      await fetchCases();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalateToNAFDAC = async () => {
    if (!selectedCase) return;
    setSubmitting(true);
    setError("");

    try {
      await adminCaseApi.escalateNAFDAC(selectedCase.id, {
        manufacturerDetails: escalationData.manufacturerDetails,
        productDetails: escalationData.productDetails,
        bundle: escalationData.bundle,
      });
      setSuccess("Case escalated to NAFDAC successfully");
      setEscalateModal(false);
      setEscalationData({
        manufacturerDetails: "",
        productDetails: "",
        bundle: [],
      });
      setDetailModal(false);
      setSelectedCase(null);
      await fetchCases();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Escalation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedCase) return;
    setSubmitting(true);
    setError("");

    try {
      await adminCaseApi.updateCaseStatus(selectedCase.id, newStatus);
      setSuccess(`Case status updated to ${newStatus}`);
      setDetailModal(false);
      setSelectedCase(null);
      await fetchCases();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Status update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: "warning",
      IN_PROGRESS: "default",
      RESOLVED: "success",
      ESCALATED: "info",
      CLOSED: "danger",
    };
    return colors[status] || "default";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: "text-green-600",
      MEDIUM: "text-yellow-600",
      HIGH: "text-orange-600",
      CRITICAL: "text-red-600",
    };
    return colors[priority] || "text-gray-600";
  };

  if (isLoading && cases.length === 0) return <AdminLoadingSpinner />;

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
          <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
          <p className="text-gray-600 mt-1">
            Manage counterfeit investigation cases
          </p>
        </div>
        <AdminButton onClick={fetchCases} disabled={isLoading}>
          <FiRefreshCw size={18} />
          Refresh
        </AdminButton>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminInput
            label="Search by Case ID / Product"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Enter case ID or product name..."
          />
          <AdminSelect
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
            <option value="CLOSED">Closed</option>
          </AdminSelect>
          <div className="flex items-end">
            <AdminButton className="w-full" onClick={fetchCases}>
              <FiSearch size={18} />
              Search
            </AdminButton>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard
          title="Total Cases"
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
          icon={FiTrendingUp}
        />
        <AdminCard title="Status" value={status} icon={FiAlertTriangle} />
      </div>

      {/* Cases List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Case ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Manufacturer
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cases.length > 0 ? (
                cases.map((caseItem) => (
                  <tr
                    key={caseItem.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {caseItem.id}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {caseItem.productName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {caseItem.manufacturerName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold ${getPriorityColor(caseItem.priority)}`}
                      >
                        {caseItem.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge variant={getStatusColor(caseItem.status)}>
                        {caseItem.status.replace(/_/g, " ")}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(caseItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCase(caseItem);
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
                    No cases found
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
      {detailModal && selectedCase && (
        <AdminModal
          title={`Case Details - ${selectedCase.id}`}
          onClose={() => {
            setDetailModal(false);
            setSelectedCase(null);
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Case ID</p>
                <p className="font-semibold text-gray-900">{selectedCase.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Product</p>
                <p className="font-semibold text-gray-900">
                  {selectedCase.productName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Manufacturer</p>
                <p className="font-semibold text-gray-900">
                  {selectedCase.manufacturerName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p
                  className={`font-bold ${getPriorityColor(selectedCase.priority)}`}
                >
                  {selectedCase.priority}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <AdminBadge variant={getStatusColor(selectedCase.status)}>
                  {selectedCase.status.replace(/_/g, " ")}
                </AdminBadge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedCase.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedCase.description && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                  {selectedCase.description}
                </div>
              </div>
            )}

            {selectedCase.notes && selectedCase.notes.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Case Notes</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedCase.notes.map((n, idx) => (
                    <div key={idx} className="bg-blue-50 p-2 rounded text-sm">
                      <p className="font-semibold text-blue-900">{n.addedBy}</p>
                      <p className="text-blue-700">{n.content}</p>
                      <p className="text-xs text-blue-600">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {selectedCase.status !== "CLOSED" && (
                <>
                  <AdminButton
                    variant="primary"
                    size="sm"
                    onClick={() => setNoteModal(true)}
                  >
                    <FiMessageSquare size={16} />
                    Add Note
                  </AdminButton>
                  {selectedCase.status === "OPEN" && (
                    <AdminButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateStatus("IN_PROGRESS")}
                      disabled={submitting}
                    >
                      Start Progress
                    </AdminButton>
                  )}
                  {selectedCase.status === "IN_PROGRESS" && (
                    <AdminButton
                      variant="success"
                      size="sm"
                      onClick={() => handleUpdateStatus("RESOLVED")}
                      disabled={submitting}
                    >
                      Mark Resolved
                    </AdminButton>
                  )}
                  <AdminButton
                    variant="warning"
                    size="sm"
                    onClick={() => setEscalateModal(true)}
                  >
                    <FiTrendingUp size={16} />
                    Escalate NAFDAC
                  </AdminButton>
                </>
              )}
            </div>
          </div>
        </AdminModal>
      )}

      {/* Add Note Modal */}
      {noteModal && selectedCase && (
        <AdminModal
          title="Add Case Note"
          onClose={() => {
            setNoteModal(false);
            setNote("");
          }}
        >
          <div className="space-y-4">
            <AdminTextarea
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter case note..."
              required
            />

            <div className="flex gap-2 pt-4 border-t">
              <AdminButton
                onClick={handleAddNote}
                disabled={submitting || !note}
              >
                {submitting ? "Adding..." : "Add Note"}
              </AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => {
                  setNoteModal(false);
                  setNote("");
                }}
                disabled={submitting}
              >
                Cancel
              </AdminButton>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Escalate to NAFDAC Modal */}
      {escalateModal && selectedCase && (
        <AdminModal
          title="Escalate to NAFDAC"
          onClose={() => setEscalateModal(false)}
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Provide details for NAFDAC escalation:
            </p>

            <AdminTextarea
              label="Manufacturer Details"
              value={escalationData.manufacturerDetails}
              onChange={(e) =>
                setEscalationData({
                  ...escalationData,
                  manufacturerDetails: e.target.value,
                })
              }
              placeholder="Enter manufacturer details..."
              required
            />

            <AdminTextarea
              label="Product Details"
              value={escalationData.productDetails}
              onChange={(e) =>
                setEscalationData({
                  ...escalationData,
                  productDetails: e.target.value,
                })
              }
              placeholder="Enter product details..."
              required
            />

            <div className="flex gap-2 pt-4 border-t">
              <AdminButton
                variant="danger"
                onClick={handleEscalateToNAFDAC}
                disabled={
                  submitting ||
                  !escalationData.manufacturerDetails ||
                  !escalationData.productDetails
                }
              >
                {submitting ? "Escalating..." : "Escalate"}
              </AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => setEscalateModal(false)}
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
