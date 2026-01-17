"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import DashboardSidebar from "@/components/DashboardSidebar";
import { FiArrowLeft } from "react-icons/fi";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/user/notifications");
      setNotifications(response.data?.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-6 dark:text-white">
        Loading notifications...
      </p>
    );

  if (!notifications.length)
    return (
      <p className="text-center mt-6 dark:text-white">
        No notifications yet. Stay safe!
      </p>
    );

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
                aria-label="Go back"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <ul className="space-y-3">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-600"
              >
                <p className="font-semibold">{notif.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-400">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
