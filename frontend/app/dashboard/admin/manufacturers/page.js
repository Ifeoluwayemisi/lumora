"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";

export default function AdminManufacturersPage() {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMfg, setSelectedMfg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // approve, reject, info
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchManufacturers();
  }, [filter]);

  const fetchManufacturers = async () => {
    setLoading(true);
    try {
      let url = "/admin/manufacturers";
      if (filter !== "all") {
        url += `?status=${filter}`;
      }
      const response = await api.get(url);
      setManufacturers(response.data?.data || []);
    } catch (err) {
      console.error("[FETCH_MANUFACTURERS] Error:", err);
      toast.error("Failed to load manufacturers");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mfg, action) => {
    setSelectedMfg(mfg);
    setModalAction(action);
    setMessage("");
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedMfg || !modalAction) return;

    setProcessing(true);
    try {
      let endpoint = `/admin/manufacturers/${selectedMfg.id}`;
      let data = {};

      if (modalAction === "approve") {
        endpoint += "/approve";
        data = { notes: message };
      } else if (modalAction === "reject") {
        endpoint += "/reject";
        data = { reason: message };
      } else if (modalAction === "info") {
        endpoint += "/request-info";
        data = { message, requiredDocuments: [] };
      }

      await api.patch(endpoint, data);

      toast.success(`Manufacturer ${modalAction}ed successfully`);
      setShowModal(false);
      setSelectedMfg(null);
      setModalAction(null);
      fetchManufacturers();
    } catch (err) {
      console.error("[ACTION] Error:", err);
      toast.error(`Failed to ${modalAction} manufacturer`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading manufacturers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Manufacturer Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve/reject manufacturer registrations
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {["all", "pending_verification", "active", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {f.replace(/_/g, " ").toUpperCase()}
            </button>
          ))}
        </div>

        {/* Table */}
        {manufacturers.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              No manufacturers found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Trust Score
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {manufacturers.map((mfg) => (
                  <tr
                    key={mfg.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {mfg.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {mfg.country} · Products: {mfg._count?.products || 0}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {mfg.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          (mfg.trustScore || 0) >= 80
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : (mfg.trustScore || 0) >= 50
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {mfg.trustScore || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          mfg.riskLevel === "LOW"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : mfg.riskLevel === "MEDIUM"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {mfg.riskLevel || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          mfg.accountStatus === "active"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : mfg.accountStatus === "pending_verification"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {mfg.accountStatus?.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenModal(mfg, "approve")}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <FiCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(mfg, "info")}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Request info"
                        >
                          <FiAlertCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(mfg, "reject")}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <FiX className="w-5 h-5" />
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

      {/* Modal */}
      {showModal && selectedMfg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {modalAction === "approve"
                ? "Approve Manufacturer"
                : modalAction === "reject"
                ? "Reject Application"
                : "Request More Information"}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedMfg.name}
            </p>

            {/* Message Input */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                modalAction === "approve"
                  ? "Add approval notes (optional)"
                  : modalAction === "reject"
                  ? "Rejection reason (required)"
                  : "Request message"
              }
              required={modalAction === "reject"}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={
                  processing || (modalAction === "reject" && !message.trim())
                }
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${
                  modalAction === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {processing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
