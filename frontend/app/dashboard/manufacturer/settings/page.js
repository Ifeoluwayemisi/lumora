"use client";
import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCopy,
  FiRefreshCw,
  FiSave,
  FiBell,
  FiLock,
} from "react-icons/fi";

/**
 * Settings Page
 *
 * Features:
 * - API key management
 * - Generate new API keys
 * - Notification preferences
 * - Account security settings
 * - Two-factor authentication
 * - Webhook configuration
 */

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnScan: true,
    emailOnFlaggedCode: true,
    emailOnBatchExpiration: true,
    emailOnLowQuota: true,
    emailWeeklyReport: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/manufacturer/settings");
      setApiKeys(response.data?.apiKeys || []);
      setNotificationSettings(
        response.data?.notifications || notificationSettings,
      );
      setTwoFactorEnabled(response.data?.twoFactorEnabled || false);
      setWebhookUrl(response.data?.webhookUrl || "");
    } catch (err) {
      console.error("[FETCH_SETTINGS] Error:", err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!keyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    setCreatingKey(true);
    try {
      const response = await api.post("/manufacturer/api-keys", {
        name: keyName,
      });
      setApiKeys([...apiKeys, response.data.apiKey]);
      toast.success("API key generated successfully");
      setShowNewKeyModal(false);
      setKeyName("");
    } catch (err) {
      console.error("[CREATE_API_KEY] Error:", err);
      toast.error("Failed to create API key");
    } finally {
      setCreatingKey(false);
    }
  };

  const handleDeleteApiKey = async (keyId) => {
    if (!window.confirm("Are you sure you want to delete this API key?"))
      return;

    try {
      await api.delete(`/manufacturer/api-keys/${keyId}`);
      setApiKeys(apiKeys.filter((k) => k.id !== keyId));
      toast.success("API key deleted");
    } catch (err) {
      console.error("[DELETE_API_KEY] Error:", err);
      toast.error("Failed to delete API key");
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      await api.patch(
        "/manufacturer/settings/notifications",
        notificationSettings,
      );
      toast.success("Notification settings saved");
    } catch (err) {
      console.error("[SAVE_NOTIFICATIONS] Error:", err);
      toast.error("Failed to save notification settings");
    }
  };

  const handleEnableTwoFactor = async () => {
    setShowTwoFactorModal(true);
  };

  const handleVerifyTwoFactor = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      await api.post("/manufacturer/settings/2fa/verify", {
        code: verificationCode,
      });
      setTwoFactorEnabled(true);
      setShowTwoFactorModal(false);
      setVerificationCode("");
      toast.success("Two-factor authentication enabled");
    } catch (err) {
      console.error("[VERIFY_2FA] Error:", err);
      toast.error("Invalid verification code");
    }
  };

  const handleDisableTwoFactor = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disable two-factor authentication?",
      )
    )
      return;

    try {
      await api.post("/manufacturer/settings/2fa/disable");
      setTwoFactorEnabled(false);
      toast.success("Two-factor authentication disabled");
    } catch (err) {
      console.error("[DISABLE_2FA] Error:", err);
      toast.error("Failed to disable two-factor authentication");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <>
        <DashboardSidebar userRole="manufacturer" />
        <MobileBottomNav userRole="manufacturer" />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading settings...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardSidebar userRole="manufacturer" />
      <MobileBottomNav userRole="manufacturer" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 pt-12 md:pt-16">
          {/* Header */}
          <div className="mb-8">
          <Link
            href="/dashboard/manufacturer"
            className="text-green-600 hover:text-green-700 font-medium mb-4 inline-flex items-center gap-2"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage API keys, notifications, and security
          </p>
        </div>

        {/* API Keys Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              API Keys
            </h2>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Generate New Key
            </button>
          </div>

          {apiKeys.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No API keys yet. Generate one to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {key.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-gray-700 dark:text-gray-300 font-mono">
                        {key.key.substring(0, 8)}...
                        {key.key.substring(key.key.length - 8)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.key)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Copy API key"
                      >
                        <FiCopy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteApiKey(key.id)}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiBell /> Notification Preferences
          </h2>

          <div className="space-y-4">
            {[
              { key: "emailOnScan", label: "Email on code scan" },
              {
                key: "emailOnFlaggedCode",
                label: "Email when code is flagged",
              },
              {
                key: "emailOnBatchExpiration",
                label: "Email when batch expires",
              },
              { key: "emailOnLowQuota", label: "Email when quota is low" },
              { key: "emailWeeklyReport", label: "Weekly performance report" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={notificationSettings[key]}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      [key]: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-green-600"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={handleSaveNotificationSettings}
            className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FiSave /> Save Changes
          </button>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiLock /> Security
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button
                onClick={
                  twoFactorEnabled
                    ? handleDisableTwoFactor
                    : handleEnableTwoFactor
                }
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  twoFactorEnabled
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200"
                    : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200"
                }`}
              >
                {twoFactorEnabled ? "Disable" : "Enable"}
              </button>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <p className="font-medium text-gray-900 dark:text-white mb-2">
                Webhook URL
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Receive real-time updates for code verifications and flags
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-webhook-endpoint.com"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Generate New API Key
            </h3>

            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g., Production API, Mobile App, etc."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewKeyModal(false);
                  setKeyName("");
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateApiKey}
                disabled={creatingKey}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {creatingKey ? "Creating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Factor Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Enable Two-Factor Authentication
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the verification code from your authenticator app
            </p>

            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-4 text-center text-2xl tracking-widest"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowTwoFactorModal(false);
                  setVerificationCode("");
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyTwoFactor}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
    </>
  );
}
