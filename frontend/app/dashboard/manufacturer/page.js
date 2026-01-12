"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ManufacturerDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/manufacturer/dashboard-summary");
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-6 dark:text-white">Loading dashboard...</p>
    );

  return (
    <div className="p-4 pt-12 md:pt-16">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        Manufacturer Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow border dark:border-gray-600">
          <h2 className="font-semibold mb-2">Codes Generated Today</h2>
          <p className="text-3xl font-bold">
            {summary?.codesToday || 0} / {summary?.dailyLimit}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow border dark:border-gray-600">
          <h2 className="font-semibold mb-2">Total Codes in System</h2>
          <p className="text-3xl font-bold">{summary?.totalCodes || 0}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow border dark:border-gray-600">
          <h2 className="font-semibold mb-2">Plan Type</h2>
          <p className="text-2xl font-bold">{summary?.planType || "Basic"}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow border dark:border-gray-600">
          <h2 className="font-semibold mb-2">AI Alerts</h2>
          <ul className="text-sm text-gray-700 dark:text-gray-300">
            {summary?.aiAlerts?.length ? (
              summary.aiAlerts.map((alert, idx) => (
                <li key={idx}>
                  {alert.code}: {alert.message}
                </li>
              ))
            ) : (
              <li>No alerts</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
