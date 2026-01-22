"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiDownload,
  FiTrendingUp,
  FiMap,
  FiBarChart2,
  FiClock,
} from "react-icons/fi";
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

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

export default function RealTimeAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [productMetrics, setProductMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("authenticity");

  useEffect(() => {
    fetchRealTimeAnalytics();
  }, []);

  const fetchRealTimeAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, productsRes] = await Promise.all([
        api.get("/manufacturer/analytics/real-time"),
        api.get("/manufacturer/analytics/products"),
      ]);

      setAnalytics(analyticsRes.data?.data);
      setProductMetrics(productsRes.data?.data || []);
    } catch (err) {
      console.error("[FETCH_ANALYTICS] Error:", err);
      toast.error("Failed to load real-time analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading real-time analytics...</p>
        </div>
      </div>
    );
  }

  const authData = analytics?.codeAuthenticity || {};
  const geoData = (analytics?.geoDistribution?.topLocations || []).map(
    (loc) => ({
      name: loc.location,
      value: loc.count,
    }),
  );
  const batchData = analytics?.batchExpiration || {};

  const productChartData = productMetrics
    .map((p) => ({
      name: p.productName.substring(0, 10),
      authenticity: p.authenticityRate,
      verifications: p.totalVerifications,
    }))
    .slice(0, 8);

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <FiArrowLeft className="text-2xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Real-Time Analytics</h1>
              <p className="text-gray-600">
                Last 30 days • Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              {[
                {
                  id: "authenticity",
                  label: "Code Authenticity",
                  icon: FiTrendingUp,
                },
                {
                  id: "geographic",
                  label: "Geographic Distribution",
                  icon: FiMap,
                },
                {
                  id: "products",
                  label: "Product Performance",
                  icon: FiBarChart2,
                },
                { id: "expiration", label: "Batch Expiration", icon: FiClock },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 py-4 px-4 font-medium flex items-center justify-center gap-2 transition-colors ${
                    activeTab === id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Authenticity Tab */}
              {activeTab === "authenticity" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Genuine</p>
                      <p className="text-2xl font-bold text-green-600">
                        {authData.genuine || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Suspicious</p>
                      <p className="text-2xl font-bold text-red-600">
                        {authData.suspicious || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Invalid</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {authData.invalid || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Authenticity Rate</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {authData.authenticityRate || 0}%
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-yellow-50 p-4 rounded-lg border border-red-200">
                    <p className="font-semibold text-gray-900">Risk Score</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            authData.riskScore < 30
                              ? "bg-green-500"
                              : authData.riskScore < 70
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${authData.riskScore}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-lg">
                        {authData.riskScore || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Geographic Tab */}
              {activeTab === "geographic" && (
                <div className="space-y-6">
                  {geoData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={geoData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {geoData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>

                      <div>
                        <h3 className="font-semibold mb-4">Top Locations</h3>
                        <div className="space-y-3">
                          {geoData.map((loc, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-700">{loc.name}</span>
                              <span className="font-semibold">{loc.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">
                      No geographic data available
                    </p>
                  )}
                </div>
              )}

              {/* Products Tab */}
              {activeTab === "products" && (
                <div className="space-y-6">
                  {productChartData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="authenticity" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>

                      <div>
                        <h3 className="font-semibold mb-4">Product Metrics</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Product</th>
                                <th className="px-4 py-2 text-left">
                                  Authenticity
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Verifications
                                </th>
                                <th className="px-4 py-2 text-left">
                                  Risk Score
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {productMetrics.map((product) => (
                                <tr
                                  key={product.productId}
                                  className="border-t"
                                >
                                  <td className="px-4 py-2">
                                    {product.productName}
                                  </td>
                                  <td className="px-4 py-2">
                                    {product.authenticityRate}%
                                  </td>
                                  <td className="px-4 py-2">
                                    {product.totalVerifications}
                                  </td>
                                  <td className="px-4 py-2">
                                    {product.riskScore}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">No product data available</p>
                  )}
                </div>
              )}

              {/* Expiration Tab */}
              {activeTab === "expiration" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Expired</p>
                      <p className="text-2xl font-bold text-red-600">
                        {batchData.expired || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">
                        Expiring in 30 Days
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {batchData.expiringIn30Days || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Active</p>
                      <p className="text-2xl font-bold text-green-600">
                        {batchData.active || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
