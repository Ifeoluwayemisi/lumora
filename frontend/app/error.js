"use client";

import Link from "next/link";

/**
 * @param {{
 *   error: Error & { digest?: string },
 *   reset: () => void,
 * }} props
 */
export default function ErrorBoundary({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">
          ⚠️
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Something Went Wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          An unexpected error occurred while loading this page.
        </p>
        {error.message && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-8 font-mono bg-red-50 dark:bg-red-900/20 p-3 rounded">
            {error.message}
          </p>
        )}

        <div className="flex gap-4 flex-col sm:flex-row justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-genuine text-white rounded-lg hover:bg-green-600 transition font-medium"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium"
          >
            Return Home
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Error ID
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {error.digest || "unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}
