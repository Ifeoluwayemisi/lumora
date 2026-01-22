"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiPlus,
  FiCopy,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

export default function ApiKeyManagementPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [activeTab, setActiveTab] = useState("keys");
  const [visibleKeys, setVisibleKeys] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    scope: "read",
    rateLimit: 1000,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [keysRes, logsRes] = await Promise.all([
        api.get("/manufacturer/api-keys"),
        api.get("/manufacturer/audit-logs"),
      ]);

      setApiKeys(keysRes.data?.data || []);
      setAuditLogs(logsRes.data?.data || []);
    } catch (err) {
      console.error("[FETCH_API_KEYS] Error:", err);
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!formData.name) {
      toast.error("Please enter a name for the key");
      return;
    }

    try {
      const response = await api.post("/manufacturer/api-keys", formData);
      setGeneratedKey(response.data?.data?.rawKey);
      setShowKeyModal(true);
      setShowCreateModal(false);
      setFormData({ name: "", scope: "read", rateLimit: 1000 });
      fetchData();
      toast.success("API key created successfully");
    } catch (err) {
      console.error("[CREATE_API_KEY] Error:", err);
      toast.error("Failed to create API key");
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!confirm("Delete this API key? This cannot be undone.")) return;

    try {
      await api.delete(`/manufacturer/api-keys/${keyId}/delete`);
      toast.success("API key deleted");
      fetchData();
    } catch (err) {
      console.error("[DELETE_API_KEY] Error:", err);
      toast.error("Failed to delete API key");
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!confirm("Revoke this API key?")) return;

    try {
      await api.delete(`/manufacturer/api-keys/${keyId}`);
      toast.success("API key revoked");
      fetchData();
    } catch (err) {
      console.error("[REVOKE_API_KEY] Error:", err);
      toast.error("Failed to revoke API key");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getRecentApiLogs = () => {
    return auditLogs
      .filter((log) => log.actionType.includes("api"))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading API keys...</p>
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
              <h1 className="text-2xl font-bold">API Key Management</h1>
              <p className="text-gray-600">Manage API keys for integrations</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <FiPlus /> New Key
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("keys")}
                className={`flex-1 py-4 px-4 font-medium transition-colors ${
                  activeTab === "keys"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                API Keys ({apiKeys.length})
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`flex-1 py-4 px-4 font-medium transition-colors ${
                  activeTab === "activity"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Activity Log
              </button>
            </div>

            <div className="p-6">
              {/* API Keys Tab */}
              {activeTab === "keys" && (
                <div>
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        No API keys created yet
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Create Your First Key
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {apiKeys.map((key) => (
                        <div
                          key={key.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {key.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Created{" "}
                                {new Date(key.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                key.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {key.isActive ? "Active" : "Revoked"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-600">Scope</p>
                              <p className="font-mono text-sm">{key.scope}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Rate Limit
                              </p>
                              <p className="font-semibold">
                                {key.rateLimit}/day
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Usage</p>
                              <p className="font-semibold">{key.usageCount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Last Used</p>
                              <p className="text-sm">
                                {key.lastUsedAt
                                  ? new Date(
                                      key.lastUsedAt,
                                    ).toLocaleDateString()
                                  : "Never"}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => copyToClipboard(key.id)}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <FiCopy /> Copy ID
                            </button>
                            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700">
                              <FiEdit2 /> Edit
                            </button>
                            {key.isActive ? (
                              <button
                                onClick={() => handleRevokeKey(key.id)}
                                className="flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-700"
                              >
                                Revoke
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleDeleteKey(key.id)}
                              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div>
                  {getRecentApiLogs().length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No activity yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {getRecentApiLogs().map((log, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {log.actionType.replace(/_/g, " ").toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {log.ipAddress}
                          </span>
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

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Create New API Key</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Production Integration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Scope</label>
                <select
                  value={formData.scope}
                  onChange={(e) =>
                    setFormData({ ...formData, scope: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="read">Read Only</option>
                  <option value="read,generate">Read & Generate Codes</option>
                  <option value="read,generate,revoke">Full Access</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rate Limit (requests/day)
                </label>
                <input
                  type="number"
                  value={formData.rateLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rateLimit: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
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
                onClick={handleCreateKey}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key Display Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">
                API Key Created Successfully
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ Save your API key now. You won't be able to see it again.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 font-mono text-sm break-all">
                {generatedKey}
              </div>

              <button
                onClick={() => copyToClipboard(generatedKey)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <FiCopy /> Copy API Key
              </button>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowKeyModal(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav />
    </div>
  );
}
