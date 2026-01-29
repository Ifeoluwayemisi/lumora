"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
const CATEGORY_NAMES = {
  drugs: "Drugs & Pharmaceuticals",
  food: "Food & Beverages",
  cosmetics: "Cosmetics & Personal Care",
  other: "Other",
};

export default function CategoryDistributionPage() {
  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] = useState(null);
  const [history, setHistory] = useState([]);
  const [manufacturers, setManufacturers] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [distRes, historyRes, mfgRes] = await Promise.all([
        api.get("/admin/analytics/category-distribution"),
        api.get(`/admin/analytics/category-history?days=${days}`),
        api.get("/admin/analytics/manufacturers"),
      ]);

      setDistribution(distRes.data);
      setHistory(historyRes.data);
      setManufacturers(mfgRes.data);
    } catch (error) {
      console.error("[ANALYTICS] Error:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const pieData = distribution
    ? [
        { name: CATEGORY_NAMES.drugs, value: distribution.drugs },
        { name: CATEGORY_NAMES.food, value: distribution.food },
        { name: CATEGORY_NAMES.cosmetics, value: distribution.cosmetics },
        { name: CATEGORY_NAMES.other, value: distribution.other },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-4 md:ml-64">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6"
        >
          <FiArrowLeft /> Back to Admin
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Category Distribution
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Monitor manufacturer distribution across product categories
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Drugs</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {distribution?.drugs || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {distribution?.total > 0
                ? ((distribution.drugs / distribution.total) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Food</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {distribution?.food || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {distribution?.total > 0
                ? ((distribution.food / distribution.total) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cosmetics
            </p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {distribution?.cosmetics || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {distribution?.total > 0
                ? ((distribution.cosmetics / distribution.total) * 100).toFixed(
                    1,
                  )
                : 0}
              %
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Other</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {distribution?.other || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {distribution?.total > 0
                ? ((distribution.other / distribution.total) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {distribution?.total || 0}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Distribution
            </h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No data available
              </p>
            )}
          </div>

          {/* Trend Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Trend - Last {days} Days
              </h3>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-sm"
              >
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>

            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="snapshotDate"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="drugs"
                    stroke="#3b82f6"
                    name="Drugs"
                  />
                  <Line
                    type="monotone"
                    dataKey="food"
                    stroke="#10b981"
                    name="Food"
                  />
                  <Line
                    type="monotone"
                    dataKey="cosmetics"
                    stroke="#f59e0b"
                    name="Cosmetics"
                  />
                  <Line
                    type="monotone"
                    dataKey="other"
                    stroke="#ef4444"
                    name="Other"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No history data</p>
            )}
          </div>
        </div>

        {/* Manufacturers by Category */}
        {manufacturers && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Manufacturers by Category
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(manufacturers.byCategory).map(
                ([category, mfgs]) => (
                  <div
                    key={category}
                    className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {CATEGORY_NAMES[category]}
                    </h4>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">
                      {mfgs.length}
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {mfgs.map((mfg) => (
                        <div
                          key={mfg.id}
                          className="text-xs text-gray-600 dark:text-gray-400"
                        >
                          <span className="inline-block px-2 py-1 bg-white dark:bg-gray-800 rounded">
                            {mfg.name}
                            {mfg.verified ? " ✓" : " ⚠"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verified Manufacturers
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {manufacturers.totalVerified}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unverified Manufacturers
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {manufacturers.totalUnverified}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
