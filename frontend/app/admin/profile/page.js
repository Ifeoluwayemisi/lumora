"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminAuthApi } from "@/services/adminApi";
import { useAdmin } from "@/hooks/useAdmin";
import {
  AdminCard,
  AdminLoadingSpinner,
  AdminErrorMessage,
  AdminButton,
  AdminInput,
  AdminModal,
} from "@/components/admin/AdminComponents";
import {
  FiUser,
  FiMail,
  FiShield,
  FiClock,
  FiEdit2,
  FiLock,
} from "react-icons/fi";

export default function ProfilePage() {
  const router = useRouter();
  const { adminUser, isHydrated } = useAdmin();
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
    setIsLoading(true);
    setError("");

    try {
      await adminAuthApi.updateProfile({
        firstName,
        lastName,
      });

      setSuccess("Profile updated successfully");
      setEditModal(false);
      setTimeout(() => setSuccess(""), 3000);

      // Refresh user data
      // Note: In a real app, you'd call a refresh method on the context
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await adminAuthApi.changePassword({
        currentPassword,
        newPassword,
      });

      setSuccess("Password changed successfully");
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

  if (!isHydrated || !adminUser) return <AdminLoadingSpinner />;

  return (
    <div className="space-y-6 max-w-2xl">
      {error && <AdminErrorMessage message={error} />}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          ✓ {success}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {adminUser.firstName} {adminUser.lastName}
            </h2>
            <p className="text-gray-600 mt-1">{adminUser.email}</p>
          </div>
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FiUser size={32} className="text-blue-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">First Name</p>
            <p className="text-lg font-semibold text-gray-900">
              {adminUser.firstName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Last Name</p>
            <p className="text-lg font-semibold text-gray-900">
              {adminUser.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Email</p>
            <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiMail size={18} />
              {adminUser.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Role</p>
            <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiShield size={18} />
              {adminUser.role}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Last Login</p>
            <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiClock size={18} />
              {new Date(adminUser.lastLogin).toLocaleString()}
            </p>
          </div>
          {adminUser.lastLoginIp && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Last Login IP</p>
              <p className="text-lg font-mono text-gray-900">
                {adminUser.lastLoginIp}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-6 border-t">
          <AdminButton onClick={() => setEditModal(true)} variant="primary">
            <FiEdit2 size={18} />
            Edit Profile
          </AdminButton>
          <AdminButton
            onClick={() => setPasswordModal(true)}
            variant="secondary"
          >
            <FiLock size={18} />
            Change Password
          </AdminButton>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Security</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700 font-semibold">
              Two-Factor Authentication
            </span>
            <span className="text-green-600 font-semibold">✓ Enabled</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-700 font-semibold">
              Last Password Change
            </span>
            <span className="text-gray-600 text-sm">90 days ago</span>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Permissions</h2>
        <p className="text-gray-600 mb-4">
          Your account has the following permissions:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: "View Dashboard", granted: true },
            {
              name: "Review Manufacturers",
              granted: ["MODERATOR", "SUPER_ADMIN"].includes(adminUser.role),
            },
            {
              name: "Review Reports",
              granted: ["MODERATOR", "SUPER_ADMIN"].includes(adminUser.role),
            },
            {
              name: "Manage Cases",
              granted: ["MODERATOR", "SUPER_ADMIN"].includes(adminUser.role),
            },
            {
              name: "View Audit Logs",
              granted: adminUser.role === "SUPER_ADMIN",
            },
            {
              name: "Escalate to NAFDAC",
              granted: ["MODERATOR", "SUPER_ADMIN"].includes(adminUser.role),
            },
          ].map((permission, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border-2 ${
                permission.granted
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <p
                className={`font-semibold ${permission.granted ? "text-green-900" : "text-gray-600"}`}
              >
                {permission.granted ? "✓" : "✗"} {permission.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModal && (
        <AdminModal title="Edit Profile" onClose={() => setEditModal(false)}>
          <div className="space-y-4">
            <AdminInput
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <AdminInput
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <div className="flex gap-2 pt-4 border-t">
              <AdminButton onClick={handleUpdateProfile} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => setEditModal(false)}
                disabled={isLoading}
              >
                Cancel
              </AdminButton>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Change Password Modal */}
      {passwordModal && (
        <AdminModal
          title="Change Password"
          onClose={() => setPasswordModal(false)}
        >
          <div className="space-y-4">
            <AdminInput
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <AdminInput
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <AdminInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="flex gap-2 pt-4 border-t">
              <AdminButton
                onClick={handleChangePassword}
                disabled={
                  isLoading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {isLoading ? "Updating..." : "Change Password"}
              </AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => setPasswordModal(false)}
                disabled={isLoading}
              >
                Cancel
              </AdminButton>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
