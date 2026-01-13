"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Invalid({ code }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
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

        {/* Details */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6">
          <p className="text-sm text-red-800 dark:text-red-200">
            This code is invalid because:
          </p>
          <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1 ml-4 list-disc">
            <li>Product has expired</li>
            <li>Code format is incorrect</li>
            <li>Code was already used</li>
          </ul>
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
            onClick={handleCopy}
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
