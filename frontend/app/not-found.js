import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-gray-400 dark:text-gray-600 mb-4">
          404
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-4 flex-col sm:flex-row justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-genuine text-white rounded-lg hover:bg-green-600 transition font-medium"
          >
            Return Home
          </Link>
          <Link
            href="/verify"
            className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium"
          >
            Verify Product
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Error code: 404 - Not Found
          </p>
        </div>
      </div>
    </div>
  );
}
