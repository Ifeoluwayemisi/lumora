"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiPlus,
  FiEye,
  FiSearch,
  FiX,
  FiDownload,
} from "react-icons/fi";
import api from "@/services/api";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";

function BatchesContent() {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [formData, setFormData] = useState({
    productId: "",
    productionDate: "",
    expiryDate: "",
    quantity: 100,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const response = await api.get("/manufacturer/products?limit=1000");
      setProducts(response.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch batches
  const fetchBatches = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        limit: 10,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (productFilter) {
        params.productId = productFilter;
      }

      const response = await api.get("/manufacturer/batches", { params });
      setBatches(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching batches:", err);
      setError(err.response?.data?.error || "Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBatches(1);
  }, [statusFilter, productFilter]);

  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.expiryDate || !formData.quantity) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/manufacturer/batch", {
        productId: formData.productId,
        productionDate: formData.productionDate || new Date().toISOString(),
        expiryDate: formData.expiryDate,
        quantity: parseInt(formData.quantity),
      });

      setFormData({
        productId: "",
        productionDate: "",
        expiryDate: "",
        quantity: 100,
      });
      setShowModal(false);
      await fetchBatches(1);
      alert("Batch created successfully with codes generated!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create batch"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "expiring":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const handleDownloadCodes = async (batchId) => {
    try {
      const batch = batches.find((b) => b.id === batchId);
      if (!batch || !batch.codes) return;

      // Create CSV content
      const csvContent = [
        ["Code Value", "QR Code Path", "Created Date"],
        ...batch.codes.map((code) => [
          code.codeValue,
          code.qrImagePath || "N/A",
          new Date(code.createdAt).toLocaleDateString(),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `batch-${batch.batchNumber}-codes.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download codes");
    }
  };

  if (loading && batches.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-genuine"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading batches...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["manufacturer"]}>
      <DashboardSidebar userRole="manufacturer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  aria-label="Go back"
                >
                  <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold dark:text-white">
                    My Batches
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage product batches and codes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-genuine text-white rounded-lg hover:bg-green-600 transition font-medium"
              >
                <FiPlus className="w-5 h-5" />
                Create Batch
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="mb-6 flex gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-genuine"
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-genuine"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Batches List */}
          {batches.length > 0 ? (
            <div className="space-y-4">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold dark:text-white">
                          {batch.product?.name} - {batch.batchNumber}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(batch.status)}`}
                        >
                          {batch.status}
                        </span>
                      </div>
                      {batch.product?.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {batch.product.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Total Codes
                          </p>
                          <p className="text-lg font-bold dark:text-white">
                            {batch.codeStats?.total || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Used
                          </p>
                          <p className="text-lg font-bold dark:text-white">
                            {batch.codeStats?.used || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Unused
                          </p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {batch.codeStats?.unused || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Expires In
                          </p>
                          <p
                            className={`text-lg font-bold ${
                              batch.daysUntilExpiry <= 0
                                ? "text-red-600 dark:text-red-400"
                                : batch.daysUntilExpiry <= 30
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {Math.max(batch.daysUntilExpiry, 0)} days
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Production Date
                          </p>
                          <p className="dark:text-gray-300">
                            {new Date(
                              batch.productionDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Expiration Date
                          </p>
                          <p className="dark:text-gray-300">
                            {new Date(
                              batch.expirationDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Created
                          </p>
                          <p className="dark:text-gray-300">
                            {new Date(batch.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {batch.codeStats && (
                        <div className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Usage Progress
                          </p>
                          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-genuine h-2 rounded-full transition-all"
                              style={{
                                width: `${batch.codeStats.usagePercentage}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {batch.codeStats.usagePercentage.toFixed(1)}% used
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedBatch(batch)}
                        className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                        title="View Details"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadCodes(batch.id)}
                        className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition"
                        title="Download Codes"
                      >
                        <FiDownload className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No batches found
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-genuine text-white rounded-lg hover:bg-green-600 transition font-medium"
              >
                <FiPlus className="w-5 h-5" />
                Create Your First Batch
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => fetchBatches(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 dark:text-white">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => fetchBatches(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Create Batch Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                <h2 className="text-2xl font-bold dark:text-white">
                  Create New Batch
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddBatch} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium dark:text-white mb-2">
                    Product *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) =>
                      setFormData({ ...formData, productId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-genuine"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-white mb-2">
                    Production Date
                  </label>
                  <input
                    type="date"
                    value={formData.productionDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productionDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-genuine"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-white mb-2">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-genuine"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-white mb-2">
                    Number of Codes *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Math.min(10000, Math.max(1, e.target.value)),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-genuine"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Max 10,000 codes per batch
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-genuine text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create Batch"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Batch Details Modal */}
        {selectedBatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">
                  Batch Details
                </h2>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Batch Number
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedBatch.batchNumber}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Product
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedBatch.product?.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Production Date
                    </label>
                    <p className="text-sm dark:text-gray-300">
                      {new Date(
                        selectedBatch.productionDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Expiration Date
                    </label>
                    <p className="text-sm dark:text-gray-300">
                      {new Date(
                        selectedBatch.expirationDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedBatch.codeStats && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold dark:text-white mb-3">
                      Code Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total Codes
                        </p>
                        <p className="text-2xl font-bold dark:text-white">
                          {selectedBatch.codeStats.total}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Used Codes
                        </p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {selectedBatch.codeStats.used}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Unused Codes
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedBatch.codeStats.unused}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Usage Rate
                        </p>
                        <p className="text-2xl font-bold dark:text-white">
                          {selectedBatch.codeStats.usagePercentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleDownloadCodes(selectedBatch.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <FiDownload className="w-5 h-5" />
                    Download Codes
                  </button>
                  <button
                    onClick={() => setSelectedBatch(null)}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

export default function BatchesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-genuine"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <BatchesContent />
    </Suspense>
  );
}
