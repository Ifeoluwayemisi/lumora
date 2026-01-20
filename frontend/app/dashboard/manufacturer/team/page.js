"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";

export default function TeamPage() {
  const router = useRouter();
  const [manufacturerId, setManufacturerId] = useState("");
  const [plan, setPlan] = useState("BASIC");
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRole, setNewRole] = useState("viewer");
  const [inviteData, setInviteData] = useState({ email: "", role: "viewer" });

  useEffect(() => {
    // Get manufacturer ID from user
    const getManufacturerId = async () => {
      try {
        const response = await api.get("/manufacturer/profile");
        if (response.data?.manufacturer?.id) {
          setManufacturerId(response.data.manufacturer.id);
          setPlan(response.data.manufacturer.plan || "BASIC");

          // Check if user has premium plan
          if (response.data.manufacturer.plan !== "PREMIUM") {
            toast.warning(
              "Team management is only available for PREMIUM users",
            );
            router.push("/dashboard/manufacturer");
            return;
          }

          await fetchTeamData(response.data.manufacturer.id);
        }
      } catch (error) {
        console.error("Error getting manufacturer:", error);
        toast.error("Failed to load manufacturer info");
      }
    };

    getManufacturerId();
  }, [router]);

  const fetchTeamData = async (mfgId) => {
    try {
      setLoading(true);
      const [membersRes, invitesRes] = await Promise.all([
        api.get(`/manufacturer/team`),
        api.get(`/manufacturer/team/pending-invites`),
      ]);

      console.log("[TEAM_MEMBERS] Response:", membersRes.data);
      console.log("[TEAM_INVITES] Response:", invitesRes.data);

      setMembers(
        membersRes.data?.members || membersRes.data?.data?.members || [],
      );
      setInvites(
        invitesRes.data?.invites || invitesRes.data?.data?.invites || [],
      );
    } catch (error) {
      console.error("[TEAM_ERROR] Full error:", error);
      console.error("[TEAM_ERROR] Response data:", error.response?.data);
      console.error("[TEAM_ERROR] Response status:", error.response?.status);
      toast.error(
        "Failed to load team data - " +
          (error.response?.data?.error || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    // Validate email
    if (!inviteData.email) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate role
    if (!inviteData.role) {
      toast.error("Please select a role");
      return;
    }

    try {
      await api.post(`/manufacturer/team/invite`, inviteData);

      toast.success("✅ Invitation sent successfully!");
      setInviteData({ email: "", role: "viewer" });
      setShowInviteModal(false);
      await fetchTeamData(manufacturerId);
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error(error.response?.data?.message || "Failed to send invitation");
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;

    try {
      await api.patch(`/manufacturer/team/${selectedMember.id}/role`, {
        role: newRole,
      });

      toast.success("Role updated successfully!");
      setShowRoleModal(false);
      setSelectedMember(null);
      await fetchTeamData(manufacturerId);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      await api.delete(`/manufacturer/team/${memberId}`);

      toast.success("Team member removed successfully!");
      await fetchTeamData(manufacturerId);
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  const handleCancelInvite = async (inviteId) => {
    if (!confirm("Cancel this invitation?")) return;

    try {
      await api.delete(`/manufacturer/team/invite/${inviteId}`);

      toast.success("Invitation cancelled");
      await fetchTeamData(manufacturerId);
    } catch (error) {
      console.error("Error cancelling invite:", error);
      toast.error(
        error.response?.data?.message || "Failed to cancel invitation",
      );
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <DashboardSidebar userRole="manufacturer" />
      <MobileBottomNav userRole="manufacturer" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 pt-12 md:pt-16">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Team Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Manage your team members and permissions
                  </p>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  + Invite Member
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading team data...
              </div>
            ) : (
              <div className="p-6">
                {/* Team Members Section */}
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-6">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Team Members ({members.length})
                    </h2>
                  </div>

                  {members.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No team members yet. Invite someone to get started.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                              Joined
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member) => (
                            <tr
                              key={member.id}
                              className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                            >
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                {member.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                {member.email}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                                    member.role,
                                  )}`}
                                >
                                  {member.role.charAt(0).toUpperCase() +
                                    member.role.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setNewRole(member.role);
                                    setShowRoleModal(true);
                                  }}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium mr-4"
                                >
                                  Edit Role
                                </button>
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pending Invites Section */}
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Pending Invitations ({invites.length})
                    </h2>
                  </div>

                  {invites.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No pending invitations.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                              Sent
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                              Expires
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {invites.map((invite) => (
                            <tr
                              key={invite.id}
                              className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                            >
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {invite.email}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                                    invite.role,
                                  )}`}
                                >
                                  {invite.role.charAt(0).toUpperCase() +
                                    invite.role.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                {new Date(
                                  invite.createdAt,
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                {new Date(
                                  invite.expiresAt,
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleCancelInvite(invite.id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Role Information */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                    Role Permissions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        👑 Admin
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                        Full access to all features, can manage team members
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ✏️ Editor
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                        Can create codes, batches, and manage products
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        👁️ Viewer
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                        Can only view analytics and reports
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Invite Team Member
                  </h2>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteData.email}
                      onChange={(e) =>
                        setInviteData({ ...inviteData, email: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select
                      value={inviteData.role}
                      onChange={(e) =>
                        setInviteData({ ...inviteData, role: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="viewer">Viewer (View only)</option>
                      <option value="editor">Editor (Create codes)</option>
                      <option value="admin">Admin (Full access)</option>
                    </select>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    An invitation email will be sent to the email address with a
                    link to join the team. The invitation expires in 7 days.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvite}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send Invitation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Role Update Modal */}
          {showRoleModal && selectedMember && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Update Member Role
                  </h2>
                  <button
                    onClick={() => {
                      setShowRoleModal(false);
                      setSelectedMember(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Updating role for: <strong>{selectedMember.name}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      New Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="viewer">Viewer (View only)</option>
                      <option value="editor">Editor (Create codes)</option>
                      <option value="admin">Admin (Full access)</option>
                    </select>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    This change will take effect immediately. The team member
                    will see their updated permissions on next login.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowRoleModal(false);
                      setSelectedMember(null);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateRole}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Role
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
