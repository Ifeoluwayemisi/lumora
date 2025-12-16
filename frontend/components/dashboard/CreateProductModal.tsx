"use client";
import { useState, useEffect } from "react";
import { X, Calendar, Package, Layers, ChevronRight, Info } from "lucide-react";

type Product = {
  id?: string;
  name: string;
  category: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
};

export default function CreateProductModal({
  isOpen,
  onClose,
  onGenerate,
  editingProduct,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (details: Product & { mode: "create" | "edit" }) => void;
  editingProduct?: Product | null;
}) {
  const [formData, setFormData] = useState<Product>({
    name: "",
    category: "Pharmaceuticals",
    batchNumber: `BN-${Math.floor(1000 + Math.random() * 9000)}`,
    expiryDate: "",
    quantity: 1000,
  });

  // 🔥 OPTIMISTIC UI STATE
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ PREFILL WHEN EDITING
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        category: editingProduct.category,
        batchNumber: editingProduct.batchNumber,
        expiryDate: editingProduct.expiryDate,
        quantity: editingProduct.quantity,
      });
    }
  }, [editingProduct]);

  if (!isOpen) return null;

  const categories = [
    "Pharmaceuticals",
    "Skincare",
    "Electronics",
    "Food & Bev",
    "Apparel",
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Close */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-8 top-8 text-gray-500 hover:text-white disabled:opacity-40"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {editingProduct ? "Edit Product" : "New Batch"}
          </h2>
          <p className="text-gray-400 text-sm">
            {editingProduct
              ? "Update product information."
              : "Register a new product run to generate secure Lumora codes."}
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setIsSubmitting(true); // ⚡ OPTIMISTIC FEEDBACK

            // 🚀 OPTIMISTIC HANDOFF
            onGenerate({
              ...formData,
              id: editingProduct?.id,
              mode: editingProduct ? "edit" : "create",
            });

            // Close immediately — UI already updated optimistically
            onClose();
          }}
        >
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Package size={14} /> Product Name
            </label>
            <input
              required
              type="text"
              value={formData.name}
              disabled={isSubmitting}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-green-500 text-white disabled:opacity-60"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} /> Category
              </label>
              <select
                value={formData.category}
                disabled={isSubmitting}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-green-500 text-white disabled:opacity-60"
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#111]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Expiry Date
              </label>
              <input
                required
                type="date"
                value={formData.expiryDate}
                disabled={isSubmitting}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-green-500 text-white disabled:opacity-60"
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3">
            <Info className="text-amber-500 shrink-0" size={18} />
            <p className="text-[11px] text-amber-200/70 leading-relaxed">
              Batch numbers are permanent once created and cannot be changed.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all
                ${
                  isSubmitting
                    ? "bg-green-500/40 cursor-wait"
                    : "bg-green-600 hover:bg-green-500 active:scale-95"
                }`}
            >
              {isSubmitting
                ? "Saving…"
                : editingProduct
                ? "Save Changes"
                : "Initialize Generation"}
              <ChevronRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
