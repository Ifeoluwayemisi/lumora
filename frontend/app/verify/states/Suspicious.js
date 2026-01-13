"use client";
import { useRouter } from "next/navigation";

export default function Suspicious({ code, product }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        {/* Danger Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <span className="text-4xl">🚨</span>
          </div>
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
            Suspicious Activity
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Unusual patterns detected
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

        {/* Product Info if available */}
        {product && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6 space-y-2">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Product
              </p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {product.name}
              </p>
            </div>
            {product.manufacturer && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Manufacturer
                </p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {product.manufacturer}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Details */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6">
          <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
            ⚠️ Risk Detected:
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            This code shows unusual verification patterns. Possible counterfeit
            or tampering detected.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => (window.location.href = "/support")}
            className="w-full px-4 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
          >
            📞 Report Suspicious Product
          </button>
          <button
            onClick={() => router.push("/verify")}
            className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            ← Go Back
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          🚨 High risk - Do not use this product
        </p>
      </div>
    </div>
  );
}
