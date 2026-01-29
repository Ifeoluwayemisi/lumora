"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiX, FiRefreshCw } from "react-icons/fi";

const AGENCIES = {
  NAFDAC: {
    name: "National Agency for Food & Drug Administration",
    color:
      "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  },
  FIRS: {
    name: "Federal Inland Revenue Service",
    color:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  },
  "NAFDAC-COSMETICS": {
    name: "NAFDAC - Cosmetics Division",
    color:
      "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  },
};

export default function RateLimitingPage() {
  const [loading, setLoading] = useState(true);
  const [rateLimits, setRateLimits] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState("NAFDAC");
  const [agencyDetail, setAgencyDetail] = useState(null);
  const [webhookConfig, setWebhookConfig] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [editingLimits, setEditingLimits] = useState(null);
  const [alertsPerHour, setAlertsPerHour] = useState("");
  const [alertsPerDay, setAlertsPerDay] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedAgency) {
      fetchAgencyDetail();
      fetchWebhookConfig();
      fetchWebhookLogs();
    }
  }, [selectedAgency]);

  const fetchAllData = async () => {
    try {
      const res = await api.get("/admin/management/rate-limits");
      setRateLimits(res.data);
      setLoading(false);
    } catch (error) {
      console.error("[RATE_LIMIT] Error:", error);
      toast.error("Failed to load rate limits");
      setLoading(false);
    }
  };

  const fetchAgencyDetail = async () => {
    try {
      const res = await api.get(
        `/admin/management/rate-limits/${selectedAgency}`,
      );
      setAgencyDetail(res.data);
      setAlertsPerHour(res.data.alertsPerHour || "");
      setAlertsPerDay(res.data.alertsPerDay || "");
    } catch (error) {
      console.error("[RATE_LIMIT] Error fetching detail:", error);
    }
  };

  const fetchWebhookConfig = async () => {
    try {
      const res = await api.get(
        `/admin/management/webhooks/${selectedAgency}/config`,
      );
      setWebhookConfig(res.data);
      setWebhookUrl(res.data?.webhookUrl || "");
    } catch (error) {
      console.error("[WEBHOOK] Error fetching config:", error);
    }
  };

  const fetchWebhookLogs = async () => {
    try {
      const res = await api.get(
        `/admin/management/webhooks/${selectedAgency}/logs?limit=10`,
      );
      setWebhookLogs(res.data);
    } catch (error) {
      console.error("[WEBHOOK] Error fetching logs:", error);
    }
  };

  const updateRateLimits = async () => {
    if (!alertsPerHour || !alertsPerDay) {
      toast.error("Please enter both limits");
      return;
    }

    try {
      await api.put(`/admin/management/rate-limits/${selectedAgency}`, {
        alertsPerHour: parseInt(alertsPerHour),
        alertsPerDay: parseInt(alertsPerDay),
      });
      toast.success("Rate limits updated successfully");
      setEditingLimits(null);
      fetchAgencyDetail();
      fetchAllData();
    } catch (error) {
      console.error("[RATE_LIMIT] Error updating:", error);
      toast.error("Failed to update rate limits");
    }
  };

  const registerWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Please enter webhook URL");
      return;
    }

    try {
      await api.post(`/admin/management/webhooks/${selectedAgency}/register`, {
        webhookUrl,
        customHeaders: {},
      });
      toast.success("Webhook registered successfully");
      setShowWebhookForm(false);
      setWebhookUrl("");
      fetchWebhookConfig();
    } catch (error) {
      console.error("[WEBHOOK] Error registering:", error);
      toast.error("Failed to register webhook");
    }
  };

  const testWebhook = async () => {
    try {
      await api.post(`/admin/management/webhooks/${selectedAgency}/test`, {});
      toast.success("Test webhook sent");
      setTimeout(() => fetchWebhookLogs(), 1000);
    } catch (error) {
      console.error("[WEBHOOK] Error testing:", error);
      toast.error("Failed to send test webhook");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-4 md:ml-64">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6"
        >
          <FiArrowLeft /> Back to Admin
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Rate Limiting & Webhooks
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Configure per-agency rate limits and webhook notifications
        </p>

        {/* Agency Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Regulatory Agency
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(AGENCIES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedAgency(key)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedAgency === key
                    ? config.color + " border-current"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                <p className="font-semibold text-gray-900 dark:text-white">
                  {key}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {config.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {agencyDetail && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rate Limiting Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Rate Limiting
                </h2>
                {!editingLimits && (
                  <button
                    onClick={() => setEditingLimits(true)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingLimits ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alerts per Hour
                    </label>
                    <input
                      type="number"
                      value={alertsPerHour}
                      onChange={(e) => setAlertsPerHour(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alerts per Day
                    </label>
                    <input
                      type="number"
                      value={alertsPerDay}
                      onChange={(e) => setAlertsPerDay(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={updateRateLimits}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingLimits(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Hourly Limit
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {agencyDetail.alertsPerHour}
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Daily Limit
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {agencyDetail.alertsPerDay}
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current Hour Usage
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {agencyDetail.currentHourCount}/
                          {agencyDetail.alertsPerHour}
                        </span>
                        <span className="text-sm">
                          {(
                            (agencyDetail.currentHourCount /
                              agencyDetail.alertsPerHour) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (agencyDetail.currentHourCount /
                                agencyDetail.alertsPerHour) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current Day Usage
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {agencyDetail.currentDayCount}/
                          {agencyDetail.alertsPerDay}
                        </span>
                        <span className="text-sm">
                          {(
                            (agencyDetail.currentDayCount /
                              agencyDetail.alertsPerDay) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (agencyDetail.currentDayCount /
                                agencyDetail.alertsPerDay) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Webhook Configuration */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Webhook Configuration
              </h2>

              {webhookConfig ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <FiCheck className="text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-900 dark:text-green-200">
                        Webhook Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
                      {webhookConfig.webhookUrl}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Status
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {webhookConfig.isActive ? "✓ Active" : "✗ Inactive"}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Last Delivery
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {webhookConfig.lastDeliveryAt
                        ? new Date(
                            webhookConfig.lastDeliveryAt,
                          ).toLocaleString()
                        : "Never"}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Success Rate
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {webhookConfig.successRate?.toFixed(1) || 0}%
                    </p>
                  </div>

                  <button
                    onClick={testWebhook}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <FiRefreshCw size={16} />
                    Send Test Webhook
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    No webhook configured. Add one to receive notifications.
                  </p>

                  {!showWebhookForm ? (
                    <button
                      onClick={() => setShowWebhookForm(true)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Register Webhook
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://your-agency.com/webhooks/flags"
                          className="w-full px-3 py-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={registerWebhook}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Register
                        </button>
                        <button
                          onClick={() => {
                            setShowWebhookForm(false);
                            setWebhookUrl("");
                          }}
                          className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Webhook Logs */}
        {webhookLogs && (
          <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Recent Webhook Deliveries
            </h2>

            {webhookLogs.length > 0 ? (
              <div className="space-y-3">
                {webhookLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Delivery #{log.id}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(
                          log.deliveredAt || log.createdAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Status: {log.status}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Attempt {log.attemptNumber || 1}
                        </p>
                      </div>
                      {log.status === "success" ? (
                        <FiCheck className="text-green-600 text-xl" />
                      ) : (
                        <FiX className="text-red-600 text-xl" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No webhook logs yet
              </p>
            )}
          </div>
        )}

        {/* All Rate Limits Overview */}
        {rateLimits && (
          <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              All Agencies Rate Limits
            </h2>

            <div className="space-y-4">
              {Object.entries(rateLimits).map(([agency, status]) => (
                <div
                  key={agency}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {agency}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Hourly: {status.currentHourCount}/{status.alertsPerHour}{" "}
                        • Daily: {status.currentDayCount}/{status.alertsPerDay}
                      </p>
                    </div>
                    {status.isThrottled && (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded">
                        Throttled
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium">Hour</span>
                        <span className="text-xs">
                          {(
                            (status.currentHourCount / status.alertsPerHour) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{
                            width: `${
                              (status.currentHourCount / status.alertsPerHour) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium">Day</span>
                        <span className="text-xs">
                          {(
                            (status.currentDayCount / status.alertsPerDay) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{
                            width: `${
                              (status.currentDayCount / status.alertsPerDay) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
