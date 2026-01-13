"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import { FiBell, FiDownload, FiTrash, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    suspiciousActivityAlerts: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/user/settings");
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save settings");

      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format) => {
    setLoading(true);

    try {
      const res = await fetch(`/api/user/history/export?format=${format}`);

      if (!res.ok) throw new Error("Failed to export data");

      // Create blob and download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lumora-history.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (
      !window.confirm(
        "Are you sure? This will permanently delete all verification history."
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to clear history");

      toast.success("Verification history cleared");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const settingOptions = [
    {
      key: "emailNotifications",
      label: "Email Notifications",
      description: "Receive email updates about verifications and alerts",
    },
    {
      key: "pushNotifications",
      label: "Push Notifications",
      description: "Get browser notifications for important updates",
    },
    {
      key: "weeklyDigest",
      label: "Weekly Digest",
      description: "Receive a weekly summary of your verification activity",
    },
    {
      key: "suspiciousActivityAlerts",
      label: "Suspicious Activity Alerts",
      description: "Get notified when suspicious patterns are detected",
    },
  ];

  return (
    <>
      <DashboardSidebar userRole="consumer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Preferences
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Customize your Lumora experience
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-6 border dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
              <FiBell /> Notification Settings
            </h2>

            <div className="space-y-4">
              {settingOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-start justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(option.key)}
                    className={`relative ml-4 h-6 w-11 rounded-full transition-colors ${
                      settings[option.key]
                        ? "bg-genuine"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        settings[option.key] ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="w-full mt-6 px-4 py-2 bg-genuine text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-medium"
            >
              {loading ? "Saving..." : "Save Preferences"}
            </button>
          </div>

          {/* Data Management */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-6 border dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
              <FiDownload /> Data Management
            </h2>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download your verification history in your preferred format
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => handleExportData("csv")}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm font-medium"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExportData("json")}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition text-sm font-medium"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExportData("pdf")}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition text-sm font-medium"
                >
                  Export as PDF
                </button>
              </div>
            </div>

            <hr className="dark:border-gray-700 my-6" />

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Permanently delete all your verification history (cannot be
                undone)
              </p>
              <button
                onClick={handleClearHistory}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-medium flex items-center gap-2"
              >
                <FiTrash /> Clear History
              </button>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Your Privacy Matters
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              We take your data privacy seriously. All your information is
              encrypted and never shared with third parties. You can export or
              delete your data at any time.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
