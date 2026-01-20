"use client";
import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiTrash2 } from "react-icons/fi";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/manufacturer/notifications");
      setNotifications(response.data?.notifications || []);
    } catch (err) {
      console.error("[FETCH_NOTIFICATIONS] Error:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/user/notifications/${notificationId}`, { read: true });
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
      );
      toast.success("Marked as read");
    } catch (err) {
      console.error("[MARK_AS_READ] Error:", err);
      toast.error("Failed to update notification");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      // Since there's no delete endpoint, we'll just remove from state
      setNotifications(notifications.filter((n) => n.id !== notificationId));
      toast.success("Notification deleted");
    } catch (err) {
      console.error("[DELETE_NOTIFICATION] Error:", err);
      toast.error("Failed to delete notification");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardSidebar userRole="manufacturer" />
      <MobileBottomNav userRole="manufacturer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 pt-12 md:pt-16">
          <Link
            href="/dashboard/manufacturer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 font-medium mb-6"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Notifications
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {unreadCount} unread · {notifications.length} total
                </p>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                {["all", "unread", "read"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === f
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-all ${
                    notification.read
                      ? "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-1 ring-blue-300 dark:ring-blue-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Notification Type Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-lg ${
                            notification.type === "alert"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : notification.type === "warning"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                                : notification.type === "info"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          }`}
                        >
                          {notification.type?.toUpperCase() || "INFO"}
                        </span>
                        {!notification.read && (
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>

                      {/* Title & Message */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {notification.message}
                      </p>

                      {/* Timestamp */}
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <FiCheck className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
