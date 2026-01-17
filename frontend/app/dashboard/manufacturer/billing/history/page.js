"use client";
import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { FiArrowLeft, FiDownload, FiCalendar } from "react-icons/fi";

/**
 * Billing History Page
 * Display manufacturer's transaction history
 */
export default function BillingHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, completed, failed, refunded
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    fetchBillingHistory();
  }, []);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/billing/history");
      setHistory(response.data?.data || []);
    } catch (err) {
      console.error("[BILLING_HISTORY] Error:", err);
      toast.error("Failed to load billing history");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      const filtered = getFilteredHistory();
      const csv = convertToCSV(filtered);
      downloadCSV(csv);
      toast.success("Billing history exported as CSV");
    } catch (err) {
      toast.error("Failed to export CSV");
    }
  };

  const convertToCSV = (data) => {
    const headers = ["Reference", "Amount (₦)", "Plan", "Status", "Date"];
    const rows = data.map((item) => [
      item.reference,
      (item.amount / 100).toLocaleString(),
      item.planId,
      item.status,
      new Date(item.transactionDate).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csvContent;
  };

  const downloadCSV = (csv) => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    );
    element.setAttribute(
      "download",
      `billing-history-${new Date().toISOString().split("T")[0]}.csv`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getFilteredHistory = () => {
    let filtered = history;

    // Filter by status
    if (filter !== "all") {
      filtered = filtered.filter((item) => item.status === filter);
    }

    // Filter by date range
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      filtered = filtered.filter(
        (item) => new Date(item.transactionDate) >= fromDate
      );
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      filtered = filtered.filter(
        (item) => new Date(item.transactionDate) <= toDate
      );
    }

    return filtered;
  };

  const filteredHistory = getFilteredHistory();

  // Calculate totals
  const totalAmount = filteredHistory.reduce((sum, item) => {
    if (item.status === "completed") return sum + item.amount;
    return sum;
  }, 0);

  const totalTransactions = filteredHistory.length;
  const completedTransactions = filteredHistory.filter(
    (item) => item.status === "completed"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading billing history...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardSidebar userRole="manufacturer" />
      <MobileBottomNav userRole="manufacturer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 pt-12 md:pt-16 max-w-6xl mx-auto">
          {/* Back Button */}
          <Link
            href="/dashboard/manufacturer/billing"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 font-medium mb-6"
          >
            <FiArrowLeft /> Back to Billing
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Billing History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage your transaction history
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Transactions
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {totalTransactions}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Completed
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {completedTransactions}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Paid
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                ₦{(totalAmount / 100).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Transactions</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                <FiDownload /> Export CSV
              </button>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {filteredHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Reference
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Plan
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                          {item.reference}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-xs font-medium">
                            {item.planId}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white font-semibold">
                          ₦{(item.amount / 100).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.status === "completed"
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                                : item.status === "failed"
                                  ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
                                  : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100"
                            }`}
                          >
                            {item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(item.transactionDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No transactions found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
