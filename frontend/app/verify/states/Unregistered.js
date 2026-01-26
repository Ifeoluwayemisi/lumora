"use client";
import { useRouter } from "next/navigation";
import AIProductGuide from "@/components/AIProductGuide";

export default function UnregisteredProduct({ code, product, verification }) {
  const router = useRouter();
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
            Unregistered Product
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This code is not registered with Lumora
          </p>
        </div>

        {/* Risk Score */}
        {verification?.riskScore !== undefined && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg mb-6 text-center">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">
              AI Risk Assessment
            </p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {verification.riskScore}/100
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Risk Level: <strong>{verification.riskLevel}</strong>
            </p>
          </div>
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

        {/* AI Product Guide */}
        {product?.guide && (
          <AIProductGuide
            guide={product.guide}
            defaultExpanded={false}
            tone="warning"
          />
        )}

        {/* Details */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            This product code is not registered in our system. This could mean:
          </p>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 ml-4 list-disc">
            <li>The product is counterfeit</li>
            <li>The code is invalid or fake</li>
            <li>The product hasn't been registered yet</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/verify")}
            className="w-full px-4 py-3 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition"
          >
            ← Try Another Code
          </button>
          <button
            onClick={() =>
              router.push(
                `/report?code=${encodeURIComponent(code)}&type=unregistered`,
              )
            }
            className="w-full px-4 py-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition"
          >
            🚩 Report Counterfeit
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          ⛔ Not verified. Be careful with this product.
        </p>
      </div>
    </div>
  );
}
