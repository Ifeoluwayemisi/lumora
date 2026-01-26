"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AIProductGuide from "@/components/AIProductGuide";

export default function CodeUsed({ code, product, batch, codeInfo }) {
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
        {/* Warning Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
            <span className="text-4xl">🔄</span>
          </div>
          <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            Code Already Used
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This code has been verified before
          </p>
        </div>

        {/* Code Display */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-6">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Verification Code
          </p>
          <p className="font-mono text-sm font-bold text-gray-900 dark:text-white break-all">
            {code}
          </p>
        </div>

        {/* Product Details if Available */}
        {product && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6 space-y-2">
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
            {product.manufacturer && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Manufacturer
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {product.manufacturer}
                </p>
              </div>
            )}
            {batch?.batchNumber && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Batch
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {batch.batchNumber}
                </p>
              </div>
            )}
            {codeInfo?.usedCount && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Times Used
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {codeInfo.usedCount}
                </p>
              </div>
            )}
            {codeInfo?.usedAt && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  First Used
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(codeInfo.usedAt).toLocaleString()}
                </p>
              </div>
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

        {/* Details */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg mb-6">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            ⚠️ This code was already used before. Be cautious as:
          </p>
          <ul className="text-sm text-orange-700 dark:text-orange-300 mt-2 space-y-1 ml-4 list-disc">
            <li>The product may be refurbished</li>
            <li>Code could have been tampered with</li>
            <li>Multiple uses indicate possible counterfeiting</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/verify")}
            className="w-full px-4 py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
          >
            ← Try Another Code
          </button>
          <button
            onClick={handleCopy}
            className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            📋 Copy Code
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          ⚠️ Use with caution - code already used
        </p>
      </div>
    </div>
  );
}
