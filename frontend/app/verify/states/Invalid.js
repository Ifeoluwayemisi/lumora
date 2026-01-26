"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AIProductGuide from "@/components/AIProductGuide";

export default function Invalid({ code, product, verification }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        {/* Error Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
            Invalid Code
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This code could not be verified
          </p>
        </div>

        {/* Code Display */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-6">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Code Entered
          </p>
          <p className="font-mono text-sm font-bold text-gray-900 dark:text-white break-all">
            {code}
          </p>
        </div>

        {/* Product Info if Available */}
        {product && product.name && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-6">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Product Information
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {product.name}
            </p>
            {product.manufacturer && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {product.manufacturer}
              </p>
            )}
          </div>
        )}

        {/* AI Product Guide */}
        {product?.guide && (
          <AIProductGuide
            guide={product.guide}
            defaultExpanded={false}
            tone="danger"
          />
        )}

        {/* Details - Show Specific Reason */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6">
          <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
            {verification?.state === "PRODUCT_EXPIRED"
              ? "Product Has Expired"
              : verification?.state === "UNREGISTERED_PRODUCT"
                ? "Unregistered Product"
                : "Invalid Product Code"}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            {verification?.state === "PRODUCT_EXPIRED" &&
              "The expiration date for this product has passed. Please do not use."}
            {verification?.state === "UNREGISTERED_PRODUCT" &&
              "This code does not exist in our system. Please verify the code is correct."}
            {verification?.advisory && verification.advisory}
            {!verification?.advisory &&
              verification?.state !== "PRODUCT_EXPIRED" &&
              verification?.state !== "UNREGISTERED_PRODUCT" &&
              "This code could not be verified."}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/verify")}
            className="w-full px-4 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
          >
            ← Try Another Code
          </button>
          <button
            onClick={() =>
              router.push(
                `/report?code=${encodeURIComponent(
                  code,
                )}&product=${encodeURIComponent(
                  product?.name || "Unknown",
                )}&type=invalid`,
              )
            }
            className="w-full px-4 py-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition"
          >
            🚩 Report Fake Product
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            📋 Copy Code
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          ⛔ Not verified. Do not use this product.
        </p>
      </div>
    </div>
  );
}
