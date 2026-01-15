"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";

/**
 * Batches & Code Generation Page
 *
 * Features:
 * - List all batches with code counts
 * - Create new batch with quota enforcement
 * - Show daily quota progress
 * - Download codes as CSV/PDF
 * - View batch details
 * - Responsive design
 * - Real-time quota updates
 */

export default function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState({ used: 0, limit: 50, remaining: 50 });
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    productionDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    quantity: 50,
  });

  // Fetch batches and products
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batchesRes, productsRes, dashboardRes] = await Promise.all([
        api.get("/manufacturer/batches?limit=100"),
        api.get("/manufacturer/products?limit=100"),
        api.get("/manufacturer/dashboard"),
      ]);

      setBatches(batchesRes.data.data || []);
      setProducts(productsRes.data.data || []);
      setQuota(dashboardRes.data.quota);
    } catch (err) {
      console.error("[FETCH_DATA] Error:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation
      if (!formData.productId) {
        toast.error("Please select a product");
        setSubmitting(false);
        return;
      }

      if (!formData.expiryDate) {
        toast.error("Please select an expiration date");
        setSubmitting(false);
        return;
      }

      const response = await api.post("/manufacturer/batch", {
        productId: formData.productId,
        productionDate: formData.productionDate,
        expiryDate: formData.expiryDate,
        quantity: parseInt(formData.quantity),
      });

      toast.success(
        `Batch created with ${response.data.codesGenerated} codes!`
      );
      setQuota(response.data.quota);
      setFormData({
        productId: "",
        productionDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        quantity: 50,
      });
      setShowModal(false);
      await fetchData();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create batch";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getProductName = (productId) => {
    return products.find((p) => p.id === productId)?.name || "Unknown Product";
  };

  const quotaPercentage = (quota.used / quota.limit) * 100;

  return (
    <div className="p-4 pt-12 md:pt-16 pb-20 md:pb-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
            Batches & Codes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and manage verification codes for your products
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all flex items-center gap-2 w-fit"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Generate Batch
        </button>
      </div>

      {/* Quota Progress */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Daily Quota
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {quota.used} / {quota.limit}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Remaining Today
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.max(quota.remaining, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Used
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(quotaPercentage)}%
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              quotaPercentage < 50
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : quotaPercentage < 80
                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                : "bg-gradient-to-r from-red-500 to-red-600"
            }`}
            style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
          ></div>
        </div>

        {quota.remaining < 10 && quota.remaining > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ You're running low on daily quota.{" "}
              <Link
                href="/dashboard/manufacturer/billing"
                className="font-semibold hover:underline"
              >
                Upgrade to Premium
              </Link>{" "}
              for more codes.
            </p>
          </div>
        )}

        {quota.remaining <= 0 && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">
              ❌ Daily quota exhausted.{" "}
              <Link
                href="/dashboard/manufacturer/billing"
                className="font-semibold hover:underline"
              >
                Upgrade to Premium
              </Link>{" "}
              or wait until tomorrow.
            </p>
          </div>
        )}
      </div>

      {/* Batches List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Batches
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Loading batches...
            </p>
          </div>
        ) : batches.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            <p className="mb-4">No batches created yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-green-600 hover:underline font-medium"
            >
              Create your first batch
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Product
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Codes
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {batches.map((batch) => (
                  <tr
                    key={batch.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getProductName(batch.productId)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Batch ID: {batch.id.substring(0, 8)}...
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {batch.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(batch.expirationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          toast.info(
                            "Download feature coming soon. Download as CSV/PDF will be available shortly."
                          )
                        }
                        className="px-3 py-1 text-sm rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        title="Download codes"
                      >
                        ⬇ CSV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Generate Batch</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:opacity-80 transition-opacity"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product *
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) =>
                    setFormData({ ...formData, productId: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.codeCount} existing codes)
                    </option>
                  ))}
                </select>
                {products.length === 0 && (
                  <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                    No products found.{" "}
                    <Link
                      href="/dashboard/manufacturer/products"
                      className="font-semibold hover:underline"
                    >
                      Create a product first.
                    </Link>
                  </p>
                )}
              </div>

              {/* Production Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Production Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.productionDate}
                  onChange={(e) =>
                    setFormData({ ...formData, productionDate: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiration Date *
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Codes *
                  {quota.remaining < formData.quantity && (
                    <span className="ml-2 text-red-600 dark:text-red-400 text-xs font-normal">
                      (Exceeds quota)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="10000"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {quota.remaining - formData.quantity >= 0
                    ? `✓ ${
                        quota.remaining - formData.quantity
                      } codes will remain after this batch`
                    : `✗ This exceeds your daily limit by ${Math.abs(
                        quota.remaining - formData.quantity
                      )} codes`}
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  ℹ️ QR codes will be auto-generated and downloadable after
                  batch creation.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting || quota.remaining <= 0 || products.length === 0
                  }
                  className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium transition-colors"
                >
                  {submitting ? "Generating..." : "Generate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
