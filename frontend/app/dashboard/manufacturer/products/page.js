"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiEye,
  FiSearch,
  FiX,
} from "react-icons/fi";
import api from "@/services/api";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";

function ProductsContent() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = async (pageNum = 1, search = "") => {
    try {
      setLoading(true);
      const response = await api.get("/manufacturer/products", {
        params: {
          page: pageNum,
          limit: 10,
          search,
        },
      });
      setProducts(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.error || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, searchTerm);
  }, [searchTerm]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Product name is required");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/manufacturer/products", {
        name: formData.name,
        description: formData.description,
      });

      setFormData({ name: "", description: "" });
      setShowModal(false);
      await fetchProducts(1, searchTerm);
      alert("Product created successfully!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/manufacturer/products/${productId}`);
      await fetchProducts(page, searchTerm);
      setDeleteConfirm(null);
      alert("Product deleted successfully!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete product"
      );
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-genuine"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading products...
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
                    My Products
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage all products you own
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-genuine text-white rounded-lg hover:bg-green-600 transition font-medium"
              >
                <FiPlus className="w-5 h-5" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-6 relative">
            <FiSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-genuine"
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold dark:text-white">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {product.description}
                        </p>
                      )}
                      <div className="flex gap-6 mt-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Batches
                          </p>
                          <p className="text-lg font-bold dark:text-white">
                            {product.batchCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Created
                          </p>
                          <p className="text-sm dark:text-gray-300">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {product.latestBatch && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Latest Batch
                            </p>
                            <p className="text-sm dark:text-gray-300">
                              {product.latestBatch.batchNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                        title="View Details"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition"
                        title="Delete Product"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No products found
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-genuine text-white rounded-lg hover:bg-green-600 transition font-medium"
              >
                <FiPlus className="w-5 h-5" />
                Create Your First Product
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 dark:text-white">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                <h2 className="text-2xl font-bold dark:text-white">
                  Add New Product
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium dark:text-white mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Aspirin 500mg"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-genuine"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Product details..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-genuine"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-genuine text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create Product"}
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

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm w-full p-6">
              <h2 className="text-xl font-bold text-red-600 mb-4">
                Delete Product?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This action cannot be undone. Make sure all codes for this
                product have been used or archived.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteProduct(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">
                  Product Details
                </h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Product Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedProduct.name}
                  </p>
                </div>

                {selectedProduct.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Batches
                    </p>
                    <p className="text-2xl font-bold dark:text-white">
                      {selectedProduct.batchCount}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created Date
                    </p>
                    <p className="text-sm font-semibold dark:text-white">
                      {new Date(selectedProduct.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedProduct.batches && selectedProduct.batches.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Recent Batches
                    </label>
                    <div className="space-y-2 mt-2">
                      {selectedProduct.batches.slice(0, 5).map((batch) => (
                        <div
                          key={batch.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <p className="font-semibold dark:text-white">
                            {batch.batchNumber}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Expires:{" "}
                            {new Date(
                              batch.expirationDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setSelectedProduct(null)}
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

export default function ProductsPage() {
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
      <ProductsContent />
    </Suspense>
  );
}
