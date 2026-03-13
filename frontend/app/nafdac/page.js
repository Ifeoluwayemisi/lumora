"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/hooks/useAdmin";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiMap,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function NAFDACDashboard() {
  const router = useRouter();
  const { adminUser, isHydrated } = useAdmin();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [trend, setTrend] = useState([]);

  // Check auth and fetch data on hydration
  useEffect(() => {
    if (!isHydrated) return;

    if (!adminUser) {
      router.push("/admin/login");
      return;
    }

    if (adminUser.role !== "NAFDAC") {
      router.push("/admin/dashboard");
      return;
    }

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [isHydrated, adminUser, router]);

  const fetchDashboardData = async () => {
    try {
      setError("");
      setIsRefreshing(true);
      const adminToken = localStorage.getItem("admin_token");

      // Fetch incidents
      const incidentRes = await fetch("/api/nafdac/incidents?status=OPEN", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!incidentRes.ok) throw new Error("Failed to fetch incidents");

      const incidentData = await incidentRes.json();
      setIncidents(incidentData.data || []);

      // Fetch hotspots
      const hotspotsRes = await fetch("/api/nafdac/hotspots", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const hotspotsData = await hotspotsRes.json();
      setHotspots(hotspotsData.data || []);

      // Calculate stats
      const openCount = (incidentData.data || []).length;
      const highRisk = (hotspotsData.data || []).length;

      // Generate trend data (mock - would need real data from backend)
      const mockTrend = Array.from({ length: 7 }, (_, i) => ({
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        incidents: Math.floor(Math.random() * 20) + 5,
      }));

      setStats({
        openIncidents: openCount,
        highRiskAreas: highRisk,
        closedToday: 3,
        escalatedCases: 8,
      });

      setTrend(mockTrend);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Regulatory Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor product safety incidents and hotspots
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={isRefreshing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Open Incidents */}
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Open Incidents
                </p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">
                  {stats.openIncidents}
                </p>
              </div>
              <FiAlertTriangle className="w-12 h-12 text-red-300 dark:text-red-800" />
            </div>
          </div>

          {/* High Risk Areas */}
          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  High Risk Areas
                </p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
                  {stats.highRiskAreas}
                </p>
              </div>
              <FiMap className="w-12 h-12 text-orange-300 dark:text-orange-800" />
            </div>
          </div>

          {/* Closed Today */}
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Resolved Today
                </p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                  {stats.closedToday}
                </p>
              </div>
              <FiCheckCircle className="w-12 h-12 text-green-300 dark:text-green-800" />
            </div>
          </div>

          {/* Escalated Cases */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Escalated Cases
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                  {stats.escalatedCases}
                </p>
              </div>
              <FiTrendingUp className="w-12 h-12 text-blue-300 dark:text-blue-800" />
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            7-Day Incident Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="incidents" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link href="/nafdac/cases">
              <a className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition">
                <span>View All Cases</span>
                <FiArrowRight className="w-4 h-4" />
              </a>
            </Link>
            <Link href="/nafdac/alerts">
              <a className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition">
                <span>View Alerts</span>
                <FiArrowRight className="w-4 h-4" />
              </a>
            </Link>
            <button className="flex items-center justify-between p-3 w-full bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition">
              <span>Generate Report</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Open Incidents
          </h2>
        </div>

        {incidents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {incidents.slice(0, 5).map((incident) => (
                  <tr
                    key={incident.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {incident.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {incident.type || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-xs font-medium">
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No open incidents
          </div>
        )}
      </div>
    </div>
  );
}
