"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

/**
 * Products Management Page
 *
 * Features:
 * - List all products with pagination
 * - Search by name/description
 * - Filter by category
 * - Create new product (modal form)
 * - Edit product (modal form)
 * - Delete product (with confirmation)
 * - Show code/batch counts
 * - Disable edit if codes generated
 * - Responsive table & card view
 */

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    skuPrefix: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [pagination.page, search, category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(category && { category }),
      });

      const response = await api.get(`/manufacturer/products?${params}`);
      
      // Handle API response
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else {
        setProducts([]);
      }
      
      if (response.data && response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error("[FETCH_PRODUCTS] Error:", err.response?.data || err.message);
      setProducts([]);
      toast.error("Failed to load products - " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Open create/edit modal
  const openModal = async (product = null) => {
    if (product) {
      // Fetch full product details for editing
      try {
        const response = await api.get(`/manufacturer/products/${product.id}`);
        setFormData({
          name: response.data.name,
          description: response.data.description || "",
          category: response.data.category || "",
          skuPrefix: response.data.skuPrefix || "",
        });
        setEditingId(product.id);
      } catch (err) {
        toast.error("Failed to load product details");
        return;
      }
    } else {
      setFormData({ name: "", description: "", category: "", skuPrefix: "" });
      setEditingId(null);
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: "", description: "", category: "", skuPrefix: "" });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        // Update product
        await api.patch(`/manufacturer/products/${editingId}`, formData);
        toast.success("Product updated successfully");
      } else {
        // Create product
        await api.post("/manufacturer/products", formData);
        toast.success("Product created successfully");
      }

      closeModal();
      setPagination({ ...pagination, page: 1 });
      await fetchProducts();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save product";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setSubmitting(true);
    try {
      await api.delete(`/manufacturer/products/${deleteConfirm.id}`);
      toast.success("Product deleted successfully");
      setDeleteConfirm(null);
      await fetchProducts();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete product";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <>
      <DashboardSidebar userRole="manufacturer" />
      <MobileBottomNav userRole="manufacturer" />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 pt-12 md:pt-16">
          {/* Back Button */}
          <Link
            href="/dashboard/manufacturer"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                Products
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your products and generate verification codes
              </p>
            </div>

            <button
              onClick={() => openModal()}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all flex items-center gap-2 w-fit"
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
              Add Product
            </button>
          </div>

          {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearchChange}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={category}
          onChange={handleCategoryChange}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Pharmaceuticals">Pharmaceuticals</option>
          <option value="Beverages">Beverages</option>
          <option value="Fashion">Fashion</option>
          <option value="Cosmetics">Cosmetics</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Products Table - Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Loading products...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            <p className="mb-4">No products found</p>
            <button
              onClick={() => openModal()}
              className="text-blue-600 hover:underline font-medium"
            >
              Create your first product
            </button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Category
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Codes
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Batches
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
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.category || "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {product.codeCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        {product.batchCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {product.canEdit ? (
                          <button
                            onClick={() => openModal(product)}
                            className="px-3 py-1 text-sm rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            title="Edit product"
                          >
                            ✎
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                            title="Cannot edit - codes already generated"
                          >
                            ✎
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteConfirm(product)}
                          className="px-3 py-1 text-sm rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="Delete product"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.pages} (
                  {pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: Math.max(pagination.page - 1, 1),
                      })
                    }
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: Math.min(pagination.page + 1, pagination.pages),
                      })
                    }
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Products Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Loading products...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            <p className="mb-4">No products found</p>
            <button
              onClick={() => openModal()}
              className="text-blue-600 hover:underline font-medium"
            >
              Create your first product
            </button>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {product.codeCount}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Codes
                  </p>
                </div>
                <div className="p-2 rounded bg-green-50 dark:bg-green-900/20">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {product.batchCount}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Batches
                  </p>
                </div>
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white mt-1">
                    Created
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {product.canEdit ? (
                  <button
                    onClick={() => openModal(product)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  >
                    Edit (Locked)
                  </button>
                )}

                <button
                  onClick={() => setDeleteConfirm(product)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={closeModal}
                className="text-white hover:opacity-80 transition-opacity"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Premium Cocoa Butter"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Product details..."
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value }) required
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Cosmetics">Cosmetics</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* SKU Prefix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SKU Prefix (Optional)
                </label>
                <input
                  type="text"
                  value={formData.skuPrefix}
                  onChange={(e) =>
                    setFormData({ ...formData, skuPrefix: e.target.value })
                  }
                  placeholder="e.g., PCB"
                  maxLength="10"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium transition-colors"
                >
                  {submitting ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                Delete Product?
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                Are you sure you want to delete "{deleteConfirm.name}"?
              </p>

              {deleteConfirm.codeCount > 0 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    ⚠️ This product has {deleteConfirm.codeCount} generated
                    code(s) and cannot be deleted.
                  </p>
                </div>
              )}

              {deleteConfirm.codeCount === 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium transition-colors"
                  >
                    {submitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}

              {deleteConfirm.codeCount > 0 && (
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
}
