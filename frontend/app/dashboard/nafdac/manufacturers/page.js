"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import api from "@/services/api";
import { FiSearch, FiFilter, FiAlertCircle, FiCheckCircle, FiFlag } from "react-icons/fi";

/**
 * Manufacturer Compliance Tracking
 * Role-based access: NAFDAC only
 */
export default function ManufacturerCompliancePage() {
  const router = useRouter();
  const { user, isHydrated } = useContext(AuthContext);
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompliance, setFilterCompliance] = useState("all");

  // Security: Verify role authorization
  useEffect(() => {
    if (!isHydrated) return;

    if (!user || user.role !== "NAFDAC") {
      router.replace("/auth/login");
      return;
    }
  }, [isHydrated, user, router]);

  // Fetch manufacturers only after auth is confirmed
  useEffect(() => {
    if (!user || user.role !== "NAFDAC") return;

    const fetchManufacturers = async () => {
      try {
        const response = await api.get("/nafdac/manufacturers");
        setManufacturers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("[NAFDAC_MANUFACTURERS] Error fetching data:", error);
        setManufacturers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchManufacturers();
  }, [user]);

  const getComplianceColor = (status) => {
    if (status === "compliant") return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
    if (status === "warning") return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
  };

  const filteredManufacturers = manufacturers.filter((mfg) => {
    const matchesSearch =
      mfg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mfg.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompliance = filterCompliance === "all" || mfg.complianceStatus === filterCompliance;

    return matchesSearch && matchesCompliance;
  });

  return (
    <AuthGuard allowedRoles={["NAFDAC"]}>
      <DashboardSidebar userRole="nafdac" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manufacturer Compliance Monitoring
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor manufacturers for suspicious behavior, compliance status, and risk patterns
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by manufacturer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <FiFilter size={20} className="text-gray-600" />
              <select
                value={filterCompliance}
                onChange={(e) => setFilterCompliance(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="compliant">Compliant</option>
                <option value="warning">Warning</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Manufacturers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400">
                Loading manufacturers...
              </div>
            ) : filteredManufacturers.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400">
                No manufacturers found
              </div>
            ) : (
              filteredManufacturers.map((mfg) => (
                <div
                  key={mfg.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {mfg.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{mfg.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getComplianceColor(mfg.complianceStatus || "warning")}`}>
                      {mfg.complianceStatus?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Codes Generated</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mfg.codesGenerated || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Risk Score</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2">
                          <div
                            className="h-2 rounded bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                            style={{ width: `${mfg.riskScore || 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {mfg.riskScore || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {mfg.suspiciousActivity && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                      <p className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                        <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                        {mfg.suspiciousActivity}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                      Review Details
                    </button>
                    <button className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                      <FiFlag size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Manufacturers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {filteredManufacturers.length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
              <p className="text-green-700 dark:text-green-400 text-sm">Compliant</p>
              <p className="text-3xl font-bold text-green-600">
                {filteredManufacturers.filter((m) => m.complianceStatus === "compliant").length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">Warning</p>
              <p className="text-3xl font-bold text-yellow-600">
                {filteredManufacturers.filter((m) => m.complianceStatus === "warning").length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
              <p className="text-red-700 dark:text-red-400 text-sm">Suspended</p>
              <p className="text-3xl font-bold text-red-600">
                {filteredManufacturers.filter((m) => m.complianceStatus === "suspended").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
