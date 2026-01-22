"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { adminUsersApi } from "@/services/adminApi";
import { useAdmin } from "@/hooks/useAdmin";
import {
  FiUsers,
  FiZap,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiEye,
  FiBlock,
  FiFlag,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

export default function UserManagementPage() {
  const { adminUser, isHydrated } = useAdmin();

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, suspended, flagged

  // Data
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [flagReason, setFlagReason] = useState("");

  // Fetch users
  const fetchUsers = async () => {
    try {
      setError("");
      const [usersRes, statsRes] = await Promise.all([
        adminUsersApi.getUsers({ status: filterStatus }),
        adminUsersApi.getUserStats(),
      ]);

      setUsers(usersRes.data.users || []);
      setStats(statsRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load user management data",
      );
      console.error("[USER_MGMT] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isHydrated && adminUser) {
      fetchUsers();
    }
  }, [isHydrated, adminUser]);

  // Refetch when filter changes
  useEffect(() => {
    if (isHydrated && adminUser) {
      setIsLoading(true);
      fetchUsers();
    }
  }, [filterStatus]);

  // Filter users by search
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery)),
  );

  // Suspend user action
  const handleSuspendUser = async (userId) => {
    if (!suspendReason.trim()) {
      setError("Please provide a reason for suspension");
      return;
    }

    try {
      setError("");
      await adminUsersApi.suspendUser(userId, {
        reason: suspendReason,
      });

      setSuccess("✓ User account suspended");
      setSuspendReason("");
      setShowDetailModal(false);
      setTimeout(() => setSuccess(""), 3000);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to suspend user");
    }
  };

  // Unsuspend user action
  const handleUnsuspendUser = async (userId) => {
    try {
      setError("");
      await adminUsersApi.unsuspendUser(userId);

      setSuccess("✓ User account restored");
      setShowDetailModal(false);
      setTimeout(() => setSuccess(""), 3000);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to restore user");
    }
  };

  // Flag user action
  const handleFlagUser = async (userId) => {
    if (!flagReason.trim()) {
      setError("Please provide a reason for flagging");
      return;
    }

    try {
      setError("");
      await adminUsersApi.flagUser(userId, {
        reason: flagReason,
      });

      setSuccess("✓ User flagged for review");
      setFlagReason("");
      setShowDetailModal(false);
      setTimeout(() => setSuccess(""), 3000);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to flag user");
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  User Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
                  Monitor users, flag suspicious activity, manage accounts
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await fetchUsers();
                setIsRefreshing(false);
              }}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
            >
              <FiRefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
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

      {success && (
        <div className="mx-6 mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {success}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-8 space-y-8">
        {isLoading ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <FiZap className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* STATS CARDS */}
            {stats && (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalUsers || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    All registered users
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                    Active Users
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.activeUsers || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    In good standing
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                    Suspended
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.suspendedUsers || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Account suspended
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                    Flagged
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.flaggedUsers || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Under review
                  </p>
                </div>
              </section>
            )}

            {/* FILTERS & SEARCH */}
            <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by email, name, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                {/* Filter Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                  <option value="flagged">Flagged Only</option>
                </select>
              </div>
            </section>

            {/* USERS TABLE */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                User Accounts ({filteredUsers.length})
              </h2>
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                {filteredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            User
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Joined
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Verifications
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                          >
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {user.fullName}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {user.email}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">
                              {new Date(user.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-gray-900 dark:text-white font-medium">
                                {user.verificationCount || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {user.status === "suspended" ? (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                                  Suspended
                                </span>
                              ) : user.flagged ? (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                                  Flagged
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDetailModal(true);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition"
                              >
                                <FiEye className="w-4 h-4" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <FiUsers className="w-12 h-12 mx-auto text-gray-400 opacity-50 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No users found matching your criteria
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* USER DETAIL MODAL */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedUser.fullName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedUser.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSuspendReason("");
                  setFlagReason("");
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-6">
              {/* User Info */}
              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Account Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Email
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white break-all">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Phone
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedUser.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Joined
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedUser.createdAt).toLocaleDateString(
                        "en-US",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Status
                    </p>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.status === "suspended"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                          : selectedUser.flagged
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                      }`}
                    >
                      {selectedUser.status === "suspended"
                        ? "Suspended"
                        : selectedUser.flagged
                          ? "Flagged"
                          : "Active"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Activity */}
              <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Activity
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Total Verifications
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedUser.verificationCount || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      Last Verification
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedUser.lastVerificationDate
                        ? new Date(
                            selectedUser.lastVerificationDate,
                          ).toLocaleDateString("en-US")
                        : "Never"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Suspension Section */}
              {selectedUser.status !== "suspended" && (
                <section className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiBlock className="w-4 h-4" />
                    Suspend Account
                  </h3>
                  <div className="space-y-3">
                    <textarea
                      placeholder="Reason for suspension..."
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition resize-none"
                      rows={3}
                    />
                    <button
                      onClick={() => handleSuspendUser(selectedUser.id)}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                    >
                      Suspend Account
                    </button>
                  </div>
                </section>
              )}

              {/* Restore Section */}
              {selectedUser.status === "suspended" && (
                <section className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <button
                    onClick={() => handleUnsuspendUser(selectedUser.id)}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                  >
                    Restore Account
                  </button>
                </section>
              )}

              {/* Flag Section */}
              {!selectedUser.flagged && (
                <section className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiFlag className="w-4 h-4" />
                    Flag for Review
                  </h3>
                  <div className="space-y-3">
                    <textarea
                      placeholder="Reason for flagging (e.g., suspicious activity, abuse, etc.)..."
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition resize-none"
                      rows={3}
                    />
                    <button
                      onClick={() => handleFlagUser(selectedUser.id)}
                      className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition"
                    >
                      Flag User
                    </button>
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSuspendReason("");
                  setFlagReason("");
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
