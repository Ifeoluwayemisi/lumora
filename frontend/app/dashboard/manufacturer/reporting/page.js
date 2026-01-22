"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";
import { FiArrowLeft, FiDownload, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function ReportingPage() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");
  const [formData, setFormData] = useState({
    title: "",
    period: "month",
    startDate: "",
    endDate: "",
    format: "pdf",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, schedulesRes] = await Promise.all([
        api.get("/manufacturer/reports"),
        api.get("/manufacturer/reports/schedules"),
      ]);

      setReports(reportsRes.data?.data || []);
      setSchedules(schedulesRes.data?.data || []);
    } catch (err) {
      console.error("[FETCH_REPORTS] Error:", err);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const response = await api.post("/manufacturer/reports/generate", formData);
      toast.success("Report generated successfully");
      setShowCreateModal(false);
      setFormData({ title: "", period: "month", startDate: "", endDate: "", format: "pdf" });
      fetchData();

      // Download if export data is available
      if (response.data?.export) {
        downloadFile(response.data.export);
      }
    } catch (err) {
      console.error("[GENERATE_REPORT] Error:", err);
      toast.error("Failed to generate report");
    }
  };

  const downloadFile = (file) => {
    const url = `data:${file.mimeType};base64,${file.data}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm("Delete this schedule?")) return;

    try {
      await api.delete(`/manufacturer/reports/schedules/${scheduleId}`);
      toast.success("Schedule deleted");
      fetchData();
    } catch (err) {
      console.error("[DELETE_SCHEDULE] Error:", err);
      toast.error("Failed to delete schedule");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading reports...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Reports & Scheduling</h1>
              <p className="text-gray-600">Create, view, and schedule analytics reports</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <FiPlus /> New Report
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("reports")}
                className={`flex-1 py-4 px-4 font-medium transition-colors ${
                  activeTab === "reports"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Recent Reports ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab("schedules")}
                className={`flex-1 py-4 px-4 font-medium transition-colors ${
                  activeTab === "schedules"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Scheduled Reports ({schedules.length})
              </button>
            </div>

            <div className="p-6">
              {/* Reports Tab */}
              {activeTab === "reports" && (
                <div>
                  {reports.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No reports generated yet</p>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{report.title}</h3>
                              <p className="text-sm text-gray-600">
                                {report.period.toUpperCase()} •{" "}
                                {new Date(report.generatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {report.exportFormat?.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-600">Authenticity</p>
                              <p className="font-bold text-lg">{report.authenticity || 0}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Expired Batches</p>
                              <p className="font-bold text-lg">{report.expiredBatches || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Suspicious</p>
                              <p className="font-bold text-lg">
                                {report.suspiciousActivity || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Schedules Tab */}
              {activeTab === "schedules" && (
                <div>
                  {schedules.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No scheduled reports</p>
                  ) : (
                    <div className="space-y-4">
                      {schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{schedule.name}</h3>
                              <p className="text-sm text-gray-600">
                                {schedule.frequency.toUpperCase()} • {schedule.format.toUpperCase()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  schedule.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {schedule.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-3">
                              Recipients: {schedule.recipients?.length || 0}
                            </p>
                            <div className="flex gap-2">
                              <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                                <FiEdit2 /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                              >
                                <FiTrash2 /> Delete
                              </button>
                            </div>
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

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Generate New Report</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Report Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Monthly Report"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Export Format</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav />
    </div>
  );
}
