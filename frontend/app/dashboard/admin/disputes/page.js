"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState({});

  const limit = 10;

  useEffect(() => {
    fetchDisputes();
    fetchStats();
  }, [filter, page]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/disputes?page=${page}&limit=${limit}${
        filter !== "all" ? `&status=${filter}` : ""
      }`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setDisputes(data.disputes || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      alert("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/disputes/stats/overview");
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleAction = (dispute, action) => {
    setSelectedDispute(dispute);
    setModalAction(action);
    setShowModal(true);
    setModalData({});
  };

  const submitAction = async () => {
    if (!selectedDispute) return;

    try {
      let endpoint = `/api/admin/disputes/${selectedDispute.id}`;
      let method = "PATCH";
      let body = {};

      switch (modalAction) {
        case "investigate":
          endpoint += "/investigate";
          body = { resolutionNotes: modalData.notes || "Under investigation" };
          break;
        case "resolve":
          endpoint += "/resolve";
          body = { resolutionNotes: modalData.notes };
          break;
        case "refund":
          endpoint += "/refund";
          body = { refundAmount: modalData.refundAmount || selectedDispute.amount };
          break;
        case "reject":
          endpoint += "/reject";
          body = { reason: modalData.reason };
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      alert(`Dispute ${modalAction}ed successfully`);
      setShowModal(false);
      setSelectedDispute(null);
      fetchDisputes();
      fetchStats();
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Action failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-800";
      case "UNDER_INVESTIGATION":
        return "bg-yellow-100 text-yellow-800";
      case "RESOLVED":
        return "bg-blue-100 text-blue-800";
      case "REFUNDED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (amount) => {
    return `₦${(amount / 100).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Dispute Resolution</h1>
          <p className="text-gray-600 mt-2">Manage and resolve customer disputes</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Open Disputes</div>
              <div className="text-3xl font-bold text-red-600">{stats.openCount}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Under Investigation</div>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.underInvestigationCount}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Resolved</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.resolvedCount}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Refunded</div>
              <div className="text-3xl font-bold text-green-600">{stats.refundedCount}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Total Refunded</div>
              <div className="text-2xl font-bold text-green-700">
                {formatAmount(stats.refundedAmount)}
              </div>
            </div>
          </div>
        )}

        {/* Filter & Table */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Filter */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {["all", "OPEN", "UNDER_INVESTIGATION", "RESOLVED", "REFUNDED", "REJECTED"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilter(status);
                        setPage(1);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        filter === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status === "all" ? "All Disputes" : status.replace(/_/g, " ")}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading disputes...</div>
              ) : disputes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No disputes found</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Payment Ref
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Manufacturer
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputes.map((dispute) => (
                      <tr key={dispute.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-900">
                          {dispute.payment.reference}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {dispute.manufacturer.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{dispute.reason}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatAmount(dispute.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              dispute.status
                            )}`}
                          >
                            {dispute.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(dispute.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setShowModal(true);
                              setModalAction("view");
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="p-6 border-t border-gray-200 flex justify-center gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      page === p
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalAction === "view" ? "Dispute Details" : `${modalAction.charAt(0).toUpperCase() + modalAction.slice(1)} Dispute`}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalAction === "view" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Payment Reference</label>
                      <p className="text-gray-900 font-mono mt-1">
                        {selectedDispute.payment.reference}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Amount</label>
                      <p className="text-gray-900 font-bold mt-1">
                        {formatAmount(selectedDispute.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Manufacturer</label>
                      <p className="text-gray-900 mt-1">{selectedDispute.manufacturer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Email</label>
                      <p className="text-gray-900 mt-1">{selectedDispute.manufacturer.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Status</label>
                    <p className="mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          selectedDispute.status
                        )}`}
                      >
                        {selectedDispute.status.replace(/_/g, " ")}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Reason</label>
                    <p className="text-gray-900 mt-1">{selectedDispute.reason}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Description</label>
                    <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                      {selectedDispute.description}
                    </p>
                  </div>

                  {selectedDispute.resolutionNotes && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">
                        Resolution Notes
                      </label>
                      <p className="text-gray-900 mt-1 p-3 bg-blue-50 rounded-lg">
                        {selectedDispute.resolutionNotes}
                      </p>
                    </div>
                  )}

                  {selectedDispute.status === "REFUNDED" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-600">
                          Refund Amount
                        </label>
                        <p className="text-green-600 font-bold mt-1">
                          {formatAmount(selectedDispute.refundAmount)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">
                          Refunded At
                        </label>
                        <p className="text-gray-900 mt-1">
                          {new Date(selectedDispute.refundedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex gap-3 flex-wrap">
                    {selectedDispute.status === "OPEN" && (
                      <>
                        <button
                          onClick={() => handleAction(selectedDispute, "investigate")}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        >
                          Start Investigation
                        </button>
                        <button
                          onClick={() => handleAction(selectedDispute, "refund")}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Approve Refund
                        </button>
                        <button
                          onClick={() => handleAction(selectedDispute, "reject")}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {selectedDispute.status === "UNDER_INVESTIGATION" && (
                      <>
                        <button
                          onClick={() => handleAction(selectedDispute, "resolve")}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleAction(selectedDispute, "refund")}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Approve Refund
                        </button>
                        <button
                          onClick={() => handleAction(selectedDispute, "reject")}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {modalAction === "investigate" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Investigation Notes
                      </label>
                      <textarea
                        placeholder="Enter your investigation notes..."
                        value={modalData.notes || ""}
                        onChange={(e) =>
                          setModalData({ ...modalData, notes: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="5"
                      />
                    </div>
                  )}

                  {modalAction === "resolve" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Resolution Notes
                      </label>
                      <textarea
                        placeholder="Enter resolution details..."
                        value={modalData.notes || ""}
                        onChange={(e) =>
                          setModalData({ ...modalData, notes: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="5"
                      />
                    </div>
                  )}

                  {modalAction === "refund" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Refund Amount (₦)
                      </label>
                      <input
                        type="number"
                        placeholder={`Full amount: ${selectedDispute.amount / 100}`}
                        value={modalData.refundAmount ? modalData.refundAmount / 100 : ""}
                        onChange={(e) =>
                          setModalData({
                            ...modalData,
                            refundAmount: Math.round(parseFloat(e.target.value) * 100),
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Original Amount: {formatAmount(selectedDispute.amount)}
                      </p>
                    </div>
                  )}

                  {modalAction === "reject" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rejection Reason
                      </label>
                      <textarea
                        placeholder="Explain why this dispute is being rejected..."
                        value={modalData.reason || ""}
                        onChange={(e) =>
                          setModalData({ ...modalData, reason: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="5"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDispute(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              {modalAction !== "view" && (
                <button
                  onClick={submitAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalAction === "investigate" && "Start Investigation"}
                  {modalAction === "resolve" && "Resolve"}
                  {modalAction === "refund" && "Process Refund"}
                  {modalAction === "reject" && "Reject"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
