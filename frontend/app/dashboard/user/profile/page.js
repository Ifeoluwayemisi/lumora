"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  FiMail,
  FiUser,
  FiLock,
  FiTrash2,
  FiArrowLeft,
  FiCamera,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "@/services/api";

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmData, setDeleteConfirmData] = useState({
    password: "",
    confirmation: "",
  });
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    profilePicture: null,
  });
  const [profilePreview, setProfilePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/user/profile");
        setProfileData(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
        });
        if (response.data.profilePicture) {
          setProfilePreview(response.data.profilePicture);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type
        )
      ) {
        toast.error("Only JPEG, PNG, WebP, and GIF images are allowed");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Store file for upload
      setProfileData((prev) => ({ ...prev, profilePicture: file }));
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profileData.profilePicture) {
      toast.error("Please select a picture first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("profilePicture", profileData.profilePicture);

      await api.patch("/user/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile picture updated successfully!");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to upload profile picture";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch("/user/profile", formData);
      toast.success("Profile updated successfully!");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await api.patch("/user/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to change password";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Validate inputs
    if (!deleteConfirmData.password) {
      toast.error("Please enter your password");
      return;
    }

    if (deleteConfirmData.confirmation !== "DELETE MY ACCOUNT") {
      toast.error('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    setLoading(true);

    try {
      await api.delete("/user/account", {
        data: {
          password: deleteConfirmData.password,
          confirmation: deleteConfirmData.confirmation,
        },
      });

      toast.success("Account deleted successfully");
      logout();
      router.push("/");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to delete account";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
                  Profile Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your account information and preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
          {/* Profile Picture Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-6 border dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
              <FiCamera /> Profile Picture
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Picture Preview */}
              <div className="flex-shrink-0">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <FiUser className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Choose Image
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleProfilePictureChange}
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Max size: 5MB | Formats: JPEG, PNG, WebP, GIF
                  </p>
                </div>

                <button
                  onClick={handleUploadProfilePicture}
                  disabled={loading || !profileData.profilePicture}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  {loading ? "Uploading..." : "Upload Picture"}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-6 border dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
              <FiUser /> Basic Information
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white"
                  placeholder="your.email@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-genuine text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-medium"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Password Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-6 border dark:border-gray-800">
            <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
              <FiLock /> Change Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white"
                  placeholder="Enter new password (min. 8 characters)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Account Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow p-6 border border-red-200 dark:border-red-800">
            <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2 text-red-600 dark:text-red-400">
              <FiTrash2 /> Danger Zone
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete Account
              </button>
            ) : (
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-300 dark:border-red-700 space-y-4">
                <p className="font-semibold dark:text-white">
                  Are you absolutely sure? This cannot be undone.
                </p>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    value={deleteConfirmData.password}
                    onChange={(e) =>
                      setDeleteConfirmData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Type "DELETE MY ACCOUNT" to confirm deletion
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmData.confirmation}
                    onChange={(e) =>
                      setDeleteConfirmData((prev) => ({
                        ...prev,
                        confirmation: e.target.value,
                      }))
                    }
                    placeholder='Type "DELETE MY ACCOUNT"'
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={
                      loading ||
                      deleteConfirmData.confirmation !== "DELETE MY ACCOUNT"
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? "Deleting..." : "Yes, Delete My Account"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmData({ password: "", confirmation: "" });
                    }}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
