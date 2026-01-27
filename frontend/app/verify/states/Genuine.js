"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import AIProductGuide from "@/components/AIProductGuide";

export default function Genuine({
  code,
  product,
  batch,
  verification,
  codeInfo,
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProduct = async () => {
    setSaving(true);
    try {
      await api.post("/user/favorites", {
        codeValue: code,
        productName: product?.name,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save product:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/verify")}
        className="fixed top-4 left-4 p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors shadow-sm"
        aria-label="Back to verify"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            Genuine Product
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This product is authentic and verified
          </p>
        </div>

        {/* Product Details - Essential Info Only */}
        {product && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6 space-y-2 text-sm">
            {product.name && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Product
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </p>
              </div>
            )}
            {product.category && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Category
                </p>
                <p className="text-gray-900 dark:text-white">
                  {product.category}
                </p>
              </div>
            )}
            {product.manufacturer && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Manufacturer
                </p>
                <p className="text-gray-900 dark:text-white">
                  {product.manufacturer}
                </p>
              </div>
            )}
            {batch?.batchNumber && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Batch
                </p>
                <p className="font-mono text-xs text-gray-900 dark:text-white">
                  {batch.batchNumber}
                </p>
              </div>
            )}
            {batch?.expirationDate && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Expiration
                </p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(batch.expirationDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Safety Guide - Collapsed for genuine products (low risk) */}
        {product?.guide && (
          <AIProductGuide
            guide={product.guide}
            defaultExpanded={false}
            tone="neutral"
            riskLevel="LOW"
          />
        )}

        {/* Code Display */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-6">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Verification Code
          </p>
          <p className="font-mono text-sm font-bold text-gray-900 dark:text-white break-all">
            {code}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleCopy}
            className="w-full px-4 py-3 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
          >
            {copied ? "✓ Copied!" : "📋 Copy Code"}
          </button>
          <button
            onClick={handleSaveProduct}
            disabled={saving || saved}
            className={`w-full px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
              saved
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {saving
              ? "⏳ Saving..."
              : saved
                ? "❤️ Saved to Favorites"
                : "🔖 Save Product"}
          </button>
          <button
            onClick={() => router.push("/verify")}
            className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Back
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          ✔️ Product verified and safe to use
        </p>
      </div>
    </div>
  );
}
