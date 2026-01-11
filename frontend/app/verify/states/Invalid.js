export default function Invalid({ code }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-gray-500 dark:text-gray-400 mb-4">
        ❌ Invalid Code
      </h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        The scanned code <span className="font-mono">{code}</span> is invalid.
        Please check and try again.
      </p>

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-md bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Back to Verify
        </button>
      </div>
    </div>
  );
}
