"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiAlertTriangle,
  FiTrendingDown,
  FiCalendar,
} from "react-icons/fi";

export default function BatchManagementPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState(null);
  const [recalls, setRecalls] = useState([]);
  const [batchPerformance, setBatchPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [recallForm, setRecallForm] = useState({
    reason: "",
    description: "",
    recalledUnits: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, recallsRes, performanceRes] = await Promise.all([
        api.get("/manufacturer/batches/expiration-metrics"),
        api.get("/manufacturer/batches/recalls"),
        api.get("/manufacturer/batches/performance/all"),
      ]);

      setMetrics(metricsRes.data?.data);
      setRecalls(recallsRes.data?.data || []);
      setBatchPerformance(performanceRes.data?.data || []);
    } catch (err) {
      console.error("[FETCH_BATCH_DATA] Error:", err);
      toast.error("Failed to load batch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecall = async () => {
    if (!selectedBatch || !recallForm.reason || !recallForm.description) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await api.post(
        `/manufacturer/batches/${selectedBatch}/recall`,
        recallForm,
      );
      toast.success("Batch recall created");
      setShowRecallModal(false);
      setRecallForm({ reason: "", description: "", recalledUnits: "" });
      fetchData();
    } catch (err) {
      console.error("[CREATE_RECALL] Error:", err);
      toast.error("Failed to create recall");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading batch management...</p>
        </div>
      </div>
    );
  }

  const expMetrics = metrics || {
    expired: 0,
    expiringIn30Days: 0,
    active: 0,
    totalBatches: 0,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <FiArrowLeft className="text-2xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Batch Management</h1>
              <p className="text-gray-600">
                Track, recall, and manage product batches
              </p>
            </div>
          </div>

          {/* Alerts */}
          {expMetrics.expired > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
              <FiAlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Expired Batches</h3>
                <p className="text-sm text-red-800">
                  You have {expMetrics.expired} expired batch
                  {expMetrics.expired !== 1 ? "es" : ""}. Consider initiating
                  recalls.
                </p>
              </div>
            </div>
          )}

          {expMetrics.expiringIn30Days > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
              <FiCalendar className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">
                  Batches Expiring Soon
                </h3>
                <p className="text-sm text-yellow-800">
                  {expMetrics.expiringIn30Days} batch
                  {expMetrics.expiringIn30Days !== 1 ? "es" : ""} will expire in
                  the next 30 days.
                </p>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-600 text-sm">Total Batches</p>
              <p className="text-3xl font-bold">{expMetrics.totalBatches}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {expMetrics.active}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200">
              <p className="text-gray-600 text-sm">Expiring Soon</p>
              <p className="text-3xl font-bold text-yellow-600">
                {expMetrics.expiringIn30Days}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-200">
              <p className="text-gray-600 text-sm">Expired</p>
              <p className="text-3xl font-bold text-red-600">
                {expMetrics.expired}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("performance")}
                className={`flex-1 py-4 px-4 font-medium transition-colors ${
                  activeTab === "performance"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Performance ({batchPerformance.length})
              </button>
              <button
                onClick={() => setActiveTab("recalls")}
                className={`flex-1 py-4 px-4 font-medium transition-colors ${
                  activeTab === "recalls"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Recalls ({recalls.length})
              </button>
            </div>

            <div className="p-6">
              {/* Performance Tab */}
              {activeTab === "performance" && (
                <div>
                  {batchPerformance.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No batch data available
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">
                              Batch Number
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Authenticity
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Verifications
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Genuine
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Risk Score
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Days Left
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {batchPerformance.map((batch) => (
                            <tr
                              key={batch.batchNumber}
                              className="border-t hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 font-mono text-xs">
                                {batch.batchNumber}
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-semibold">
                                  {batch.authenticityRate}%
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {batch.totalVerifications}
                              </td>
                              <td className="px-4 py-3">
                                {batch.genuineCount}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    batch.riskScore < 30
                                      ? "bg-green-100 text-green-700"
                                      : batch.riskScore < 70
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {batch.riskScore}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={
                                    batch.daysUntilExpiration < 0
                                      ? "text-red-600 font-semibold"
                                      : batch.daysUntilExpiration < 30
                                        ? "text-yellow-600 font-semibold"
                                        : "text-gray-600"
                                  }
                                >
                                  {batch.daysUntilExpiration < 0
                                    ? `Expired ${Math.abs(batch.daysUntilExpiration)}d ago`
                                    : `${batch.daysUntilExpiration}d`}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => {
                                    setSelectedBatch(batch.batchNumber);
                                    setShowRecallModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-700 font-medium text-xs"
                                >
                                  Recall
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Recalls Tab */}
              {activeTab === "recalls" && (
                <div>
                  {recalls.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No recalls initiated
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {recalls.map((recall) => (
                        <div
                          key={recall.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Batch Recall: {recall.reason}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(
                                  recall.initiatedAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                recall.status === "active"
                                  ? "bg-red-100 text-red-700"
                                  : recall.status === "closed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {recall.status.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-gray-700 mb-3">
                            {recall.description}
                          </p>

                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <span className="text-sm text-gray-600">
                              Recalled Units:{" "}
                              {recall.recalledUnits || "Not specified"}
                            </span>
                            {recall.status === "active" && (
                              <button className="text-sm text-blue-600 hover:text-blue-700">
                                Update Status
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Recall Modal */}
      {showRecallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiAlertTriangle className="text-red-600" />
                Initiate Batch Recall
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Batch</label>
                <input
                  type="text"
                  value={selectedBatch}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <select
                  value={recallForm.reason}
                  onChange={(e) =>
                    setRecallForm({ ...recallForm, reason: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reason</option>
                  <option value="quality_issue">Quality Issue</option>
                  <option value="safety_concern">Safety Concern</option>
                  <option value="counterfeit_detected">
                    Counterfeit Detected
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={recallForm.description}
                  onChange={(e) =>
                    setRecallForm({
                      ...recallForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Provide details about the recall reason..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Units Recalled (Optional)
                </label>
                <input
                  type="number"
                  value={recallForm.recalledUnits}
                  onChange={(e) =>
                    setRecallForm({
                      ...recallForm,
                      recalledUnits: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Number of units recalled"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowRecallModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRecall}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Initiate Recall
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav />
    </div>
  );
}
