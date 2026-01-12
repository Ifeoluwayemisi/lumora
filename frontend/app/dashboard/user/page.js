"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function UserDashboardPage() {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is new (created within last hour)
  const isNewUser = () => {
    if (!user?.createdAt) return false;
    const createdAt = new Date(user.createdAt);
    const now = new Date();
    const diffInMinutes = (now - createdAt) / (1000 * 60);
    return diffInMinutes < 60;
  };

  const firstName = user?.name?.split(" ")[0];
  const isNew = isNewUser();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/user/dashboard-summary");
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

  return (
    <AuthGuard allowedRoles={["consumer"]}>
      <DashboardSidebar userRole="consumer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isNew ? "Welcome" : "Welcome back"}, {firstName}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View your verification history and product authenticity checks
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <p className="text-center dark:text-white mt-6">
              Loading dashboard...
            </p>
          ) : !summary ? (
            <p className="text-center dark:text-white mt-6">
              No summary data available.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow border dark:border-gray-600">
                <h2 className="font-semibold text-lg mb-2">
                  Total Verifications
                </h2>
                <p className="text-3xl font-bold">
                  {summary.totalVerifications}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow border dark:border-gray-600">
                <h2 className="font-semibold text-lg mb-2">Genuine vs Risky</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={summary.verificationStats}>
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow border dark:border-gray-600">
                <h2 className="font-semibold text-lg mb-2">Risk Score (Avg)</h2>
                <p className="text-3xl font-bold">{summary.avgRiskScore}</p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow border dark:border-gray-600">
                <h2 className="font-semibold text-lg mb-2">
                  Hotspot Predictions
                </h2>
                <ul className="text-sm text-gray-700 dark:text-gray-300">
                  {summary.hotspots.map((hs, idx) => (
                    <li key={idx}>
                      {hs.location}: {hs.prediction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </AuthGuard>
  );
}
