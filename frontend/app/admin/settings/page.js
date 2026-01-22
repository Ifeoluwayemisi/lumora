"use client";

import { useState } from "react";
import {
  AdminButton,
  AdminSelect,
  AdminInput,
} from "@/components/admin/AdminComponents";
import { FiSliders, FiBell, FiLock, FiUser } from "react-icons/fi";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    digestEmail: "weekly",
    sessionTimeout: 30,
    twoFactorRequired: true,
    ipWhitelist: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value,
    });
    setSaved(false);
  };

  const handleSaveSettings = async () => {
    // In a real app, this would call an API endpoint
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiBell size={20} />
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">
                Receive email alerts for important events
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) =>
                handleSettingChange("emailNotifications", e.target.checked)
              }
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">
                Receive push notifications on your device
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) =>
                handleSettingChange("pushNotifications", e.target.checked)
              }
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block mb-2">
              <p className="font-semibold text-gray-900 mb-2">Digest Email</p>
              <select
                value={settings.digestEmail}
                onChange={(e) =>
                  handleSettingChange("digestEmail", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="never">Never</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiLock size={20} />
          Security
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block">
              <p className="font-semibold text-gray-900 mb-2">
                Session Timeout (minutes)
              </p>
              <input
                type="number"
                min={5}
                max={120}
                value={settings.sessionTimeout}
                onChange={(e) =>
                  handleSettingChange(
                    "sessionTimeout",
                    parseInt(e.target.value),
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                You'll be logged out after this period of inactivity
              </p>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">
                Require 2FA for Login
              </p>
              <p className="text-sm text-gray-600">
                Two-factor authentication for all logins
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.twoFactorRequired}
              onChange={(e) =>
                handleSettingChange("twoFactorRequired", e.target.checked)
              }
              className="w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">IP Whitelist</p>
              <p className="text-sm text-gray-600">
                Only allow login from specific IP addresses
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.ipWhitelist}
              onChange={(e) =>
                handleSettingChange("ipWhitelist", e.target.checked)
              }
              className="w-5 h-5 rounded"
            />
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiSliders size={20} />
          Appearance
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block">
              <p className="font-semibold text-gray-900 mb-2">Theme</p>
              <select
                defaultValue="light"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-2">
        <AdminButton onClick={handleSaveSettings}>Save Settings</AdminButton>
        <AdminButton variant="outline">Reset to Defaults</AdminButton>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-500">
        <h2 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h2>
        <div className="space-y-3">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="font-semibold text-gray-900 mb-2">Delete Account</p>
            <p className="text-sm text-gray-600 mb-3">
              Permanently delete your admin account and all associated data.
              This cannot be undone.
            </p>
            <AdminButton variant="danger" size="sm">
              Delete Account
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
}
