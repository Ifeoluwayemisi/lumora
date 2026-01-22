"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { adminManufacturerApi } from "@/services/adminApi";
import {
  AdminCard,
  AdminLoadingSpinner,
  AdminErrorMessage,
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminSelect,
  AdminModal,
  AdminTextarea,
} from "@/components/admin/AdminComponents";
import {
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiCheck,
  FiX,
} from "react-icons/fi";

export default function ManufacturerReviewPage() {
  const [manufacturers, setManufacturers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");

  // Modal states
  const [detailModal, setDetailModal] = useState(false);
  const [actionModal, setActionModal] = useState(false);
  const [selectedMfg, setSelectedMfg] = useState(null);
  const [actionType, setActionType] = useState("APPROVE"); // APPROVE, REJECT, SUSPEND
  const [actionNotes, setActionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchManufacturers();
  }, [page, pageSize, status, search]);

  const fetchManufacturers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await adminManufacturerApi.getReviewQueue(
        status,
        (page - 1) * pageSize,
        pageSize,
        search || undefined,
      );
      setManufacturers(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load manufacturers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedMfg) return;
    setSubmitting(true);
    setError("");

    try {
      if (actionType === "APPROVE") {
        await adminManufacturerApi.approveManufacturer(selectedMfg.id, {
          notes: actionNotes,
        });
        setSuccess(`Manufacturer ${selectedMfg.name} approved successfully`);
      } else if (actionType === "REJECT") {
        await adminManufacturerApi.rejectManufacturer(selectedMfg.id, {
          reason: actionNotes,
        });
        setSuccess(`Manufacturer ${selectedMfg.name} rejected successfully`);
      } else if (actionType === "SUSPEND") {
        await adminManufacturerApi.suspendManufacturer(selectedMfg.id, {
          reason: actionNotes,
        });
        setSuccess(`Manufacturer ${selectedMfg.name} suspended successfully`);
      }

      setActionModal(false);
      setDetailModal(false);
      setActionNotes("");
      setSelectedMfg(null);
      await fetchManufacturers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 75) return "text-red-600";
    if (score >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusColor = (status) => {
    const variants = {
      PENDING: "warning",
      APPROVED: "success",
      REJECTED: "danger",
      SUSPENDED: "danger",
    };
    return variants[status] || "default";
  };

  if (isLoading && manufacturers.length === 0) return <AdminLoadingSpinner />;

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
          <h1 className="text-3xl font-bold text-gray-900">
            Manufacturer Review
          </h1>
          <p className="text-gray-600 mt-1">
            Verify and approve new manufacturers
          </p>
        </div>
        <AdminButton onClick={fetchManufacturers} disabled={isLoading}>
          <FiRefreshCw size={18} />
          Refresh
        </AdminButton>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminInput
            label="Search by Name/ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Enter manufacturer name or ID..."
          />
          <AdminSelect
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </AdminSelect>
          <div className="flex items-end">
            <AdminButton className="w-full" onClick={fetchManufacturers}>
              <FiSearch size={18} />
              Search
            </AdminButton>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard
          title="Total in Queue"
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
          icon={FiDownload}
        />
      </div>

      {/* Manufacturer List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Manufacturer Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Registration ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {manufacturers.length > 0 ? (
                manufacturers.map((mfg) => (
                  <tr
                    key={mfg.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{mfg.name}</p>
                      <p className="text-sm text-gray-600">{mfg.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {mfg.registrationId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {mfg.location}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-lg font-bold ${getRiskColor(mfg.riskScore)}`}
                      >
                        {mfg.riskScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge variant="default">
                        {mfg.documentsVerified}/{mfg.totalDocuments}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge variant={getStatusColor(mfg.status)}>
                        {mfg.status}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4">
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMfg(mfg);
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
                    No manufacturers found
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
      {detailModal && selectedMfg && (
        <AdminModal
          title={`Manufacturer Details - ${selectedMfg.name}`}
          onClose={() => {
            setDetailModal(false);
            setSelectedMfg(null);
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">
                  {selectedMfg.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registration ID</p>
                <p className="font-semibold text-gray-900">
                  {selectedMfg.registrationId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">
                  {selectedMfg.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">
                  {selectedMfg.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Score</p>
                <p
                  className={`text-lg font-bold ${getRiskColor(selectedMfg.riskScore)}`}
                >
                  {selectedMfg.riskScore}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Documents Verified</p>
                <p className="font-semibold text-gray-900">
                  {selectedMfg.documentsVerified}/{selectedMfg.totalDocuments}
                </p>
              </div>
            </div>

            {selectedMfg.notes && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Notes</p>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                  {selectedMfg.notes}
                </div>
              </div>
            )}

            {selectedMfg.status === "PENDING" && (
              <div className="flex gap-2 pt-4 border-t">
                <AdminButton
                  variant="success"
                  onClick={() => {
                    setActionType("APPROVE");
                    setActionModal(true);
                  }}
                >
                  <FiCheck size={16} />
                  Approve
                </AdminButton>
                <AdminButton
                  variant="danger"
                  onClick={() => {
                    setActionType("REJECT");
                    setActionModal(true);
                  }}
                >
                  <FiX size={16} />
                  Reject
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  onClick={() => {
                    setActionType("SUSPEND");
                    setActionModal(true);
                  }}
                >
                  Suspend
                </AdminButton>
              </div>
            )}
          </div>
        </AdminModal>
      )}

      {/* Action Modal */}
      {actionModal && selectedMfg && (
        <AdminModal
          title={`${actionType} Manufacturer`}
          onClose={() => setActionModal(false)}
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {actionType === "APPROVE" &&
                `Approve ${selectedMfg.name} as a verified manufacturer?`}
              {actionType === "REJECT" &&
                `Reject ${selectedMfg.name} from the platform?`}
              {actionType === "SUSPEND" &&
                `Suspend ${selectedMfg.name} temporarily?`}
            </p>

            <AdminTextarea
              label={
                actionType === "APPROVE"
                  ? "Approval Notes"
                  : actionType === "REJECT"
                    ? "Rejection Reason"
                    : "Suspension Reason"
              }
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder={`Enter ${actionType.toLowerCase()} reason...`}
              required
            />

            <div className="flex gap-2 pt-4 border-t">
              <AdminButton
                variant={actionType === "APPROVE" ? "success" : "danger"}
                onClick={handleAction}
                disabled={submitting || !actionNotes}
              >
                {submitting ? "Processing..." : actionType}
              </AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => setActionModal(false)}
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
