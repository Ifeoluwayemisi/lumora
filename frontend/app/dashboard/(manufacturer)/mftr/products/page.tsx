"use client";
import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  BarChart2,
  Edit3,
} from "lucide-react";
import CreateProductModal from "@/components/Dashboard/CreateProductModal";

// 🔗 BACKEND_NODEJS_CONNECTION: This will come from `SELECT * FROM products WHERE manufacturer_id = ?`
const mockProducts = [
  {
    id: 1,
    name: "Glow-Skin Vit C Serum",
    category: "Skincare",
    scans: 1240,
    health: 98,
    status: "Healthy",
  },
  {
    id: 2,
    name: "Healing Balm (Extra)",
    category: "Pharmaceuticals",
    scans: 850,
    health: 42,
    status: "Under Attack",
  }, // Low health triggers alert
  {
    id: 3,
    name: "Active Soap",
    category: "Personal Care",
    scans: 3200,
    health: 95,
    status: "Healthy",
  },
];

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Product Catalog</h1>
          <p className="text-gray-400">
            Manage your product lines and monitor scan integrity.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition shadow-lg shadow-green-900/20"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-green-500 text-white transition"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-2 text-gray-400 hover:text-white transition">
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProducts
          .filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((product) => (
            <div
              key={product.id}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 hover:border-green-500/30 transition group"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`p-3 rounded-2xl ${
                    product.health < 60
                      ? "bg-red-500/10 text-red-500"
                      : "bg-green-500/10 text-green-500"
                  }`}
                >
                  {product.health < 60 ? (
                    <ShieldAlert size={24} />
                  ) : (
                    <ShieldCheck size={24} />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {product.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-green-500 transition">
                  {product.name}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                      Total Scans
                    </p>
                    <p className="text-xl font-bold">
                      {product.scans.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                      Security Health
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        product.health < 60 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {product.health}%
                    </p>
                  </div>
                </div>

                {/* Health Progress Bar */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      product.health < 60 ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${product.health}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Reuse Modal for both Create and Edit */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProduct} // Pass data if editing
        onGenerate={(data) => {
          // 🔗 BACKEND_NODEJS_CONNECTION: Update or Create based on editingProduct.id
          console.log("Saving Product:", data);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
