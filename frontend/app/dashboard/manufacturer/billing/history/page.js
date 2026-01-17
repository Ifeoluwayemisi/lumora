"use client";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  FiArrowLeft,
  FiDownload,
  FiCalendar,
  FiFilter,
} from "react-icons/fi";
import { format } from "date-fns";

/**
 * Billing History Page
 * 
 * Features:
 * - View all past transactions
 * - Filter by date range
 * - Filter by status (completed, failed, refunded)
 * - View transaction details
 * - Download invoice as PDF
 * - Real-time status indicators
 */
export default function BillingHistoryPage() {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all, completed, failed, refunded
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchBillingHistory();
  }, []);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/manufacturer/billing/history");
      setTransactions(response.data?.data || []);
    } catch (err) {
      console.error("[FETCH_BILLING] Error:", err);
      toast.error("Failed to load billing history");
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Status filter
    if (filterStatus !== "all" && tx.status !== filterStatus) {
      return false;
    }

    // Date range filter
    if (startDate) {
      const txDate = new Date(tx.transactionDate);
      const start = new Date(startDate);
      if (txDate < start) return false;
    }

    if (endDate) {
      const txDate = new Date(tx.transactionDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (txDate > end) return false;
    }

    return true;
  });

  // Calculate summary stats
  const stats = {
    total: filteredTransactions.length,
    completed: filteredTransactions.filter((tx) => tx.status === "completed").length,
    failed: filteredTransactions.filter((tx) => tx.status === "failed").length,
    refunded: filteredTransactions.filter((tx) => tx.status === "refunded").length,
    totalAmount: filteredTransactions
      .filter((tx) => tx.status === "completed")
      .reduce((sum, tx) => sum + tx.amount, 0),
  };

  // Download invoice as PDF (for now, show JSON)
  const downloadInvoice = (transaction) => {
    const invoiceData = `
LUMORA INVOICE
==============
Reference: ${transaction.reference}
Date: ${format(new Date(transaction.transactionDate), "dd MMM yyyy")}
Amount: ₦${(transaction.amount / 100).toLocaleString()}
Plan: ${transaction.planId}
Status: ${transaction.status.toUpperCase()}

Thank you for your business!
    `.trim();

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(invoiceData)
    );
    element.setAttribute("download", `invoice-${transaction.reference}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Invoice downloaded!");
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "refunded":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✓";
      case "failed":
        return "✕";
      case "refunded":
        return "↻";
      default:
        return "•";
    }
  };

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
        <div className="p-4 pt-12 md:pt-16">
          {/* Back Button */}
          <Link
            href="/dashboard/manufacturer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 font-medium mb-6"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Billing History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage your payment history
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Total Transactions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Completed
              </p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Failed
              </p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Total Spent
              </p>
              <p className="text-2xl font-bold text-blue-600">
                ₦{(stats.totalAmount / 100).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiFilter /> Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FiCalendar /> Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FiCalendar /> End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setFilterStatus("all");
                setStartDate("");
                setEndDate("");
              }}
              className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
            >
              Clear Filters
            </button>
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No transactions found
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {format(new Date(tx.transactionDate), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                        {tx.reference.substring(0, 12)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                        {tx.planId.toLowerCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white text-right">
                        ₦{(tx.amount / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            tx.status
                          )}`}
                        >
                          <span>{getStatusIcon(tx.status)}</span>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => downloadInvoice(tx)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition"
                          title="Download invoice"
                        >
                          <FiDownload className="w-4 h-4" />
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Tip:</strong> Download invoices for your records. All
              transactions are secure and encrypted.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
