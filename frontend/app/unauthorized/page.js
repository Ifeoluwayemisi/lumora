import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">
          403
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Access Denied
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You don't have permission to access this resource. This might be due
          to insufficient privileges or your account type.
        </p>

        <div className="flex gap-4 flex-col sm:flex-row justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-genuine text-white rounded-lg hover:bg-green-600 transition font-medium"
          >
            Return Home
          </Link>
          <Link
            href="/dashboard/user"
            className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Need Help?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If you believe this is a mistake, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
