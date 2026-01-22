"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { adminAuditApi } from "@/services/adminApi";
import { useAdmin } from "@/hooks/useAdmin";
import {
  AdminLoadingSpinner,
  AdminErrorMessage,
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminSelect,
  AdminModal,
  AdminCard,
} from "@/components/admin/AdminComponents";
import {
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiDownload,
  FiAlertTriangle,
} from "react-icons/fi";

export default function AuditLogsPage() {
  const { hasRole } = useAdmin();

  // Redirect non-SUPER_ADMIN users
  useEffect(() => {
    if (!hasRole("SUPER_ADMIN")) {
      window.location.href = "/admin/unauthorized";
    }
  }, [hasRole]);

  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal states
  const [detailModal, setDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, action, adminUser, startDate, endDate]);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await adminAuditApi.getLogs(
        (page - 1) * pageSize,
        pageSize,
        {
          action: action || undefined,
          admin: adminUser || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      );
      setLogs(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const response = await adminAuditApi.exportLogs({
        action: action || undefined,
        admin: adminUser || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `audit-logs-${new Date().toISOString()}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError(err.response?.data?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: "info",
      UPDATE: "warning",
      DELETE: "danger",
      APPROVE: "success",
      REJECT: "danger",
      SUSPEND: "warning",
      LOGIN: "default",
      LOGOUT: "default",
      EXPORT: "info",
    };
    return colors[action] || "default";
  };

  if (isLoading && logs.length === 0) return <AdminLoadingSpinner />;

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {error && <AdminErrorMessage message={error} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">
            Immutable system activity logs (SUPER_ADMIN ONLY)
          </p>
        </div>
        <div className="flex gap-2">
          <AdminButton onClick={fetchLogs} disabled={isLoading}>
            <FiRefreshCw size={18} />
            Refresh
          </AdminButton>
          <AdminButton onClick={handleExport} disabled={exporting}>
            <FiDownload size={18} />
            Export
          </AdminButton>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AdminSelect
            label="Action Type"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
            <option value="SUSPEND">Suspend</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="EXPORT">Export</option>
          </AdminSelect>

          <AdminInput
            label="Admin User"
            value={adminUser}
            onChange={(e) => {
              setAdminUser(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by admin email..."
          />

          <AdminInput
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />

          <AdminInput
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total logs: {total.toLocaleString()}
          </div>
          <AdminButton size="sm" onClick={fetchLogs}>
            <FiSearch size={16} />
            Apply Filters
          </AdminButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminCard
          title="Total Logs"
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
          icon={FiAlertTriangle}
        />
        <AdminCard title="Action" value={action || "All"} icon={FiDownload} />
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Resource Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Resource ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {log.adminName}
                      </p>
                      <p className="text-xs text-gray-600">{log.adminEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge variant={getActionColor(log.action)}>
                        {log.action}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.resourceType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {log.resourceId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4">
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedLog(log);
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
                    No audit logs found
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
      {detailModal && selectedLog && (
        <AdminModal
          title={`Audit Log Details`}
          onClose={() => {
            setDetailModal(false);
            setSelectedLog(null);
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Timestamp</p>
                <p className="font-semibold text-gray-900 font-mono text-xs">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Action</p>
                <AdminBadge variant={getActionColor(selectedLog.action)}>
                  {selectedLog.action}
                </AdminBadge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Admin</p>
                <p className="font-semibold text-gray-900">
                  {selectedLog.adminName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Admin Email</p>
                <p className="text-sm text-gray-900">
                  {selectedLog.adminEmail}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Resource Type</p>
                <p className="font-semibold text-gray-900">
                  {selectedLog.resourceType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Resource ID</p>
                <p className="text-sm text-gray-900 font-mono">
                  {selectedLog.resourceId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">IP Address</p>
                <p className="font-semibold text-gray-900 font-mono">
                  {selectedLog.ipAddress}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User Agent</p>
                <p className="text-xs text-gray-900 font-mono break-all">
                  {selectedLog.userAgent}
                </p>
              </div>
            </div>

            {selectedLog.changes && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Changes</p>
                <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700 max-h-40 overflow-y-auto">
                  <pre>{JSON.stringify(selectedLog.changes, null, 2)}</pre>
                </div>
              </div>
            )}

            {selectedLog.description && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                  {selectedLog.description}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 font-mono">
                Log ID: {selectedLog.id}
              </p>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
