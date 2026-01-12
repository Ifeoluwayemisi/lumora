"use client";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/user/notifications");
      const data = await res.json();
      setNotifications(data);
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
    <div className="p-4 pt-12 md:pt-16">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Notifications</h1>
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
  );
}
