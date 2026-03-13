"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";

export default function AlertsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    acknowledged: 0,
    closed: 0,
  });

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    const adminUser = localStorage.getItem("admin_user");
    
    if (!adminToken || !adminUser) {
      router.push("/admin/login");
      return;
    }

    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    let filtered = incidents;

    if (searchTerm) {
      filtered = filtered.filter(
        (i) =>
          i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (i.type && i.type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }

    setFilteredIncidents(filtered);
  }, [searchTerm, statusFilter, incidents]);

  const fetchIncidents = async () => {
    try {
      const adminToken = localStorage.getItem("admin_token");
      const res = await fetch("/api/nafdac/incidents?status=OPEN", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!res.ok) throw new Error("Failed to fetch incidents");

      const data = await res.json();
      const incidentsData = data.data || data || [];
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);

      // Calculate stats
      const total = incidentsData.length;
      const open = incidentsData.filter((i) => i.status === "OPEN").length;
      const acknowledged = incidentsData.filter(
        (i) => i.status === "ACKNOWLEDGED"
      ).length;
      const closed = incidentsData.filter((i) => i.status === "CLOSED").length;

      setStats({ total, open, acknowledged, closed });
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching incidents:", err);
      setIsLoading(false);
    }
  };

  const updateIncidentStatus = async (incidentId, newStatus) => {
    try {
      const adminToken = localStorage.getItem("admin_token");
      const res = await fetch(`/api/nafdac/incidents/${incidentId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update incident");

      // Refetch incidents
      fetchIncidents();
    } catch (err) {
      console.error("Error updating incident:", err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "OPEN":
        return <FiAlertTriangle className="w-5 h-5 text-red-600" />;
      case "ACKNOWLEDGED":
        return <FiClock className="w-5 h-5 text-yellow-600" />;
      case "CLOSED":
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "ACKNOWLEDGED":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "CLOSED":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading alerts...</p>
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
            Product Alerts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage regulatory incidents
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchIncidents}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <FiDownload className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Incidents */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Incidents
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {stats.total}
          </p>
        </div>

        {/* Open */}
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Open
          </p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-2">
            {stats.open}
          </p>
        </div>

        {/* Acknowledged */}
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
            Acknowledged
          </p>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">
            {stats.acknowledged}
          </p>
        </div>

        {/* Closed */}
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            Closed
          </p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">
            {stats.closed}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg- white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-600 dark:text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        {filteredIncidents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Incident
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(incident.status)}
                        <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                          {incident.id.slice(0, 12)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {incident.type || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(
                          incident.status
                        )}`}
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {incident.status !== "CLOSED" && (
                        <select
                          value={incident.status}
                          onChange={(e) =>
                            updateIncidentStatus(incident.id, e.target.value)
                          }
                          className="px-2 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="OPEN">Open</option>
                          <option value="ACKNOWLEDGED">Acknowledge</option>
                          <option value="CLOSED">Close</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No incidents found
            </p>
            <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">
              All systems nominal
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
