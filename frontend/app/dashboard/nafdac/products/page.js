"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import api from "@/services/api";
import { FiChevronRight, FiFlag, FiSlash, FiSearch, FiFilter } from "react-icons/fi";

/**
 * Product Monitoring System
 * Role-based access: NAFDAC only
 */
export default function ProductMonitoringPage() {
  const router = useRouter();
  const { user, isHydrated } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");

  // Security: Verify role authorization
  useEffect(() => {
    if (!isHydrated) return;

    if (!user || user.role !== "NAFDAC") {
      router.replace("/auth/login");
      return;
    }
  }, [isHydrated, user, router]);

  // Fetch products only after auth is confirmed
  useEffect(() => {
    if (!user || user.role !== "NAFDAC") return;

    const fetchProducts = async () => {
      try {
        const response = await api.get("/nafdac/products");
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("[NAFDAC_PRODUCTS] Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const getRiskColor = (riskScore) => {
    if (riskScore >= 80) return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
    if (riskScore >= 50) return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
    return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
  };

  const getRiskStatus = (riskScore) => {
    if (riskScore >= 80) return "High Risk";
    if (riskScore >= 50) return "Suspicious";
    return "Safe";
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.batchId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk =
      filterRisk === "all" ||
      (filterRisk === "high" && product.riskScore >= 80) ||
      (filterRisk === "suspicious" && product.riskScore >= 50 && product.riskScore < 80) ||
      (filterRisk === "safe" && product.riskScore < 50);

    return matchesSearch && matchesRisk;
  });

  return (
    <AuthGuard allowedRoles={["NAFDAC"]}>
      <DashboardSidebar userRole="nafdac" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Product Monitoring System
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View all products across the system with risk assessments and regulatory actions
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by product name, manufacturer, or batch ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <FiFilter size={20} className="text-gray-600" />
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="high">High Risk</option>
                  <option value="suspicious">Suspicious</option>
                  <option value="safe">Safe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                No products found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Manufacturer
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Batch ID
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Scans
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Risk Score
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                          {product.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {product.manufacturer || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {product.batchId || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {product.scanCount || 0}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded h-2">
                              <div
                                className="h-2 rounded bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                                style={{
                                  width: `${product.riskScore || 0}%`,
                                }}
                              />
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {product.riskScore || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(
                              product.riskScore || 0,
                            )}`}
                          >
                            {getRiskStatus(product.riskScore || 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded">
                              <FiFlag size={18} />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                              <FiSlash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats Footer */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{filteredProducts.length}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
              <p className="text-red-700 dark:text-red-400 text-sm">High Risk</p>
              <p className="text-3xl font-bold text-red-600">
                {filteredProducts.filter((p) => (p.riskScore || 0) >= 80).length}
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
              <p className="text-amber-700 dark:text-amber-400 text-sm">Suspicious</p>
              <p className="text-3xl font-bold text-amber-600">
                {filteredProducts.filter((p) => (p.riskScore || 0) >= 50 && (p.riskScore || 0) < 80).length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
              <p className="text-green-700 dark:text-green-400 text-sm">Safe</p>
              <p className="text-3xl font-bold text-green-600">
                {filteredProducts.filter((p) => (p.riskScore || 0) < 50).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
