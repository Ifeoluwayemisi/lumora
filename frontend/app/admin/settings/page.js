"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { adminSettingsApi } from "@/services/adminApi";
import { useAdmin } from "@/hooks/useAdmin";
import {
  FiSettings,
  FiBell,
  FiLock,
  FiMonitor,
  FiZap,
  FiToggleLeft,
  FiToggleRight,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default function SettingsPage() {
  const { adminUser, isHydrated } = useAdmin();

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState("weekly");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [twoFactorRequired, setTwoFactorRequired] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [theme, setTheme] = useState("auto");
  const [alertsCritical, setAlertsCritical] = useState(true);
  const [alertsHigh, setAlertsHigh] = useState(true);
  const [alertsModerate, setAlertsModerate] = useState(false);

  // Load settings on mount
  useEffect(() => {
    if (isHydrated && adminUser) {
      fetchSettings();
    }
  }, [isHydrated, adminUser]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await adminSettingsApi.getSettings();
      const settings = response.data;

      // Populate settings
      setEmailNotifications(settings.emailNotifications ?? true);
      setPushNotifications(settings.pushNotifications ?? false);
      setDigestFrequency(settings.digestFrequency ?? "weekly");
      setSessionTimeout(settings.sessionTimeout ?? 30);
      setTwoFactorRequired(settings.twoFactorRequired ?? true);
      setIpWhitelist(settings.ipWhitelist ?? false);
      setTheme(settings.theme ?? "auto");
      setAlertsCritical(settings.alertsCritical ?? true);
      setAlertsHigh(settings.alertsHigh ?? true);
      setAlertsModerate(settings.alertsModerate ?? false);
    } catch (err) {
      console.error("Failed to load settings:", err);
      // Use defaults on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (sessionTimeout < 5 || sessionTimeout > 120) {
      setError("Session timeout must be between 5 and 120 minutes");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await adminSettingsApi.updateSettings({
        emailNotifications,
        pushNotifications,
        digestFrequency,
        sessionTimeout,
        twoFactorRequired,
        ipWhitelist,
        theme,
        alertsCritical,
        alertsHigh,
        alertsModerate,
      });

      setSuccess("✓ Settings saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Reset all settings to defaults?")) return;

    setIsSaving(true);
    setError("");

    try {
      await adminSettingsApi.resetSettings();
      await fetchSettings();
      setSuccess("✓ Settings reset to defaults");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiZap className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <FiSettings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
                Customize your admin preferences and security options
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mx-6 mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {success}
          </p>
        </div>
      )}

      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-600 dark:text-red-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-8 max-w-3xl space-y-8">
        {isLoading ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiZap className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* 1. NOTIFICATION SETTINGS */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiBell className="w-5 h-5 text-blue-600" />
                </div>
                Notifications
              </h2>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden">
                {/* Email Notifications */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Email Notifications
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Receive email alerts for important admin events
                      </p>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className="ml-4 flex-shrink-0"
                    >
                      {emailNotifications ? (
                        <FiToggleRight className="w-8 h-8 text-green-600" />
                      ) : (
                        <FiToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Push Notifications
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Receive browser push alerts for critical issues
                      </p>
                    </div>
                    <button
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className="ml-4 flex-shrink-0"
                    >
                      {pushNotifications ? (
                        <FiToggleRight className="w-8 h-8 text-green-600" />
                      ) : (
                        <FiToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Digest Frequency */}
                <div className="p-6">
                  <label className="block">
                    <p className="font-semibold text-gray-900 dark:text-white mb-3">
                      Email Digest Frequency
                    </p>
                    <select
                      value={digestFrequency}
                      onChange={(e) => setDigestFrequency(e.target.value)}
                      className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="never">Never</option>
                    </select>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Receive a summary of all activities and alerts
                    </p>
                  </label>
                </div>

                {/* Alert Severity */}
                <div className="p-6">
                  <p className="font-semibold text-gray-900 dark:text-white mb-4">
                    Alert Severity Levels
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Critical Alerts
                        </span>
                      </div>
                      <button
                        onClick={() => setAlertsCritical(!alertsCritical)}
                      >
                        {alertsCritical ? (
                          <FiToggleRight className="w-8 h-8 text-green-600" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-orange-600 rounded-full" />
                        <span className="text-gray-700 dark:text-gray-300">
                          High Priority Alerts
                        </span>
                      </div>
                      <button onClick={() => setAlertsHigh(!alertsHigh)}>
                        {alertsHigh ? (
                          <FiToggleRight className="w-8 h-8 text-green-600" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-yellow-600 rounded-full" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Moderate Alerts
                        </span>
                      </div>
                      <button
                        onClick={() => setAlertsModerate(!alertsModerate)}
                      >
                        {alertsModerate ? (
                          <FiToggleRight className="w-8 h-8 text-green-600" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. SECURITY SETTINGS */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <FiLock className="w-5 h-5 text-red-600" />
                </div>
                Security
              </h2>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden">
                {/* Session Timeout */}
                <div className="p-6">
                  <label className="block">
                    <p className="font-semibold text-gray-900 dark:text-white mb-3">
                      Session Timeout (minutes)
                    </p>
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={sessionTimeout}
                      onChange={(e) =>
                        setSessionTimeout(parseInt(e.target.value) || 30)
                      }
                      className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      You'll be automatically logged out after this period of
                      inactivity (5-120 minutes)
                    </p>
                  </label>
                </div>

                {/* 2FA Requirement */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Require Two-Factor Authentication
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Enforce 2FA for all login attempts
                      </p>
                    </div>
                    <button
                      onClick={() => setTwoFactorRequired(!twoFactorRequired)}
                      className="ml-4 flex-shrink-0"
                    >
                      {twoFactorRequired ? (
                        <FiToggleRight className="w-8 h-8 text-green-600" />
                      ) : (
                        <FiToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* IP Whitelist */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        IP Whitelist
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Only allow login from whitelisted IP addresses (requires
                        configuration)
                      </p>
                    </div>
                    <button
                      onClick={() => setIpWhitelist(!ipWhitelist)}
                      className="ml-4 flex-shrink-0"
                    >
                      {ipWhitelist ? (
                        <FiToggleRight className="w-8 h-8 text-green-600" />
                      ) : (
                        <FiToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. APPEARANCE SETTINGS */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FiMonitor className="w-5 h-5 text-purple-600" />
                </div>
                Appearance
              </h2>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <label className="block">
                  <p className="font-semibold text-gray-900 dark:text-white mb-3">
                    Theme Preference
                  </p>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="auto">Auto (System Setting)</option>
                  </select>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Choose your preferred theme for the admin dashboard
                  </p>
                </label>
              </div>
            </section>

            {/* 4. ACTION BUTTONS */}
            <section className="flex gap-3 pt-4">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
              <button
                onClick={handleResetDefaults}
                disabled={isSaving}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition disabled:opacity-50"
              >
                Reset to Defaults
              </button>
            </section>

            {/* 5. DANGER ZONE */}
            <section className="pt-8 border-t-2 border-red-200 dark:border-red-800">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5" />
                Danger Zone
              </h2>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800 p-6">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Admin Account
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Permanently delete your admin account and all associated data.
                  This action cannot be undone and all your access will be
                  revoked immediately.
                </p>
                <button
                  disabled={true}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium cursor-not-allowed opacity-50"
                  title="Contact SUPER_ADMIN to delete account"
                >
                  Delete Account (Contact SUPER_ADMIN)
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
