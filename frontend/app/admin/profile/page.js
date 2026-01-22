"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminAuthApi } from "@/services/adminApi";
import { useAdmin } from "@/hooks/useAdmin";
import {
  FiUser,
  FiMail,
  FiShield,
  FiClock,
  FiEdit2,
  FiLock,
  FiZap,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

export default function ProfilePage() {
  const router = useRouter();
  const { adminUser, isHydrated } = useAdmin();

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  // Edit form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState("");

  useEffect(() => {
    if (!isHydrated) return;

    if (!adminUser) {
      router.push("/admin/login");
      return;
    }

    setFirstName(adminUser.firstName || "");
    setLastName(adminUser.lastName || "");
  }, [adminUser, isHydrated, router]);

  const handleUpdateProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await adminAuthApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      setSuccess("✓ Profile updated successfully");
      setEditModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = () => {
    const errors = [];

    if (newPassword !== confirmPassword) {
      errors.push("Passwords do not match");
    }

    if (newPassword.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(newPassword)) {
      errors.push("Password must contain uppercase letter");
    }

    if (!/[0-9]/.test(newPassword)) {
      errors.push("Password must contain number");
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      errors.push("Password must contain special character (!@#$%^&*)");
    }

    return errors;
  };

  const handleChangePassword = async () => {
    const errors = validatePassword();

    if (errors.length > 0) {
      setPasswordErrors(errors.join("\n"));
      return;
    }

    setIsLoading(true);
    setPasswordErrors("");
    setError("");

    try {
      await adminAuthApi.changePassword({
        currentPassword,
        newPassword,
      });

      setSuccess("✓ Password changed successfully");
      setPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Password change failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiZap className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  // Permission mapping
  const permissions = [
    {
      name: "View Dashboard",
      description: "Access admin dashboard & metrics",
      granted: true,
    },
    {
      name: "Review Manufacturers",
      description: "Approve/reject manufacturer registrations",
      granted: ["MODERATOR", "SUPER_ADMIN"].includes(adminUser.role),
    },
    {
      name: "Review Reports",
      description: "Review user-reported counterfeit drugs",
      granted: ["MODERATOR", "SUPER_ADMIN"].includes(adminUser.role),
    },
    {
      name: "Manage Cases",
      description: "Create and manage investigation cases",
      granted: ["MODERATOR", "SUPER_ADMIN"].includes(adminUser.role),
    },
    {
      name: "View Audit Logs",
      description: "Access immutable audit trail (SUPER_ADMIN only)",
      granted: adminUser.role === "SUPER_ADMIN",
    },
    {
      name: "Escalate to NAFDAC",
      description: "Bundle and send evidence to Nigerian regulators",
      granted: ["MODERATOR", "SUPER_ADMIN"].includes(adminUser.role),
    },
    {
      name: "Monitor AI System",
      description: "View AI confidence & false positive tracking",
      granted: ["MODERATOR", "SUPER_ADMIN"].includes(adminUser.role),
    },
    {
      name: "Manage Users",
      description: "View user history and ban accounts",
      granted: adminUser.role === "SUPER_ADMIN",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <FiUser className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
                Manage account settings and permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
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
      <div className="px-6 py-8 space-y-8">
        {/* 1. PROFILE INFORMATION */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Account Information
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Full Name */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Full Name
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {adminUser.firstName} {adminUser.lastName}
                </p>
              </div>

              {/* Email */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <FiMail className="w-4 h-4" />
                  Email Address
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">
                  {adminUser.email}
                </p>
              </div>

              {/* Role */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  Admin Role
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {adminUser.role}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      adminUser.role === "SUPER_ADMIN"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200"
                        : adminUser.role === "MODERATOR"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                    }`}
                  >
                    {adminUser.role === "SUPER_ADMIN"
                      ? "Highest"
                      : adminUser.role === "MODERATOR"
                        ? "High"
                        : "Standard"}
                  </span>
                </div>
              </div>

              {/* Last Login */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  Last Login
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {adminUser.lastLogin
                    ? new Date(adminUser.lastLogin).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "Never"}
                </p>
              </div>

              {/* Last Login IP */}
              {adminUser.lastLoginIp && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Last Login IP
                  </p>
                  <p className="text-lg font-mono text-gray-900 dark:text-white break-all">
                    {adminUser.lastLoginIp}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setEditModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={() => setPasswordModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition"
              >
                <FiLock className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>
        </section>

        {/* 2. SECURITY INFORMATION */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Security Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 2FA Status */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ✓ Enabled on this account
                  </p>
                </div>
              </div>
            </div>

            {/* Password Age */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiLock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Password Status
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Regularly update your password for security
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. ROLE-BASED PERMISSIONS */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Account Permissions
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Your role as <span className="font-semibold">{adminUser.role}</span> grants
              you the following capabilities:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permissions.map((perm, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 transition ${
                    perm.granted
                      ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {perm.granted ? (
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 dark:text-gray-400 text-xs font-bold">
                            ✗
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          perm.granted
                            ? "text-green-900 dark:text-green-200"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {perm.name}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          perm.granted
                            ? "text-green-800 dark:text-green-300"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {perm.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {adminUser.role === "VIEWER" && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Tip:</strong> Request elevated permissions from a SUPER_ADMIN
                  to access additional features like manufacturer review, reporting, and
                  case management.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 4. ROLE HIERARCHY INFO */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Admin Role Hierarchy
          </h2>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-start gap-3">
                <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs font-bold rounded">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    SUPER_ADMIN
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Full system access. Can manage all features, users, and audit logs.
                    Can view immutable audit trail. Highest security clearance.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-start gap-3">
                <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-bold rounded">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    MODERATOR
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Can review manufacturers, reports, and manage cases. Can escalate to
                    NAFDAC. Cannot access audit logs or manage other users.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-start gap-3">
                <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-bold rounded">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    VIEWER
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Read-only access to dashboard and metrics. Cannot perform any actions
                    or modifications. Monitoring only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Edit Profile
              </h3>
              <button
                onClick={() => setEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setEditModal(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Change Password
              </h3>
              <button
                onClick={() => {
                  setPasswordModal(false);
                  setPasswordErrors("");
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {passwordErrors && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 whitespace-pre-line">
                  {passwordErrors}
                </p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Requirements: 8+ characters, uppercase, number, special character
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleChangePassword}
                disabled={
                  isLoading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Change Password"}
              </button>
              <button
                onClick={() => {
                  setPasswordModal(false);
                  setPasswordErrors("");
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
