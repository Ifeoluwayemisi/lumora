import ExpiryBadge from "@/components/ExpiryBadge";
import RiskScoreBadge from "@/components/RiskScoreBadge";
import AIInsights from "@/components/AIInsights";

export default function Suspicious({ code, product, risk, aiInsights }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
        🔴 Suspicious Product
      </h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        The scanned code <span className="font-mono">{code}</span> shows unusual
        patterns and may be unsafe.
      </p>

      {product && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
          <p>
            <strong>Product Name:</strong> {product.name}
          </p>
          <p>
            <strong>Manufacturer:</strong> {product.manufacturer}
          </p>
          <p>
            <strong>Batch:</strong> {product.batch}
          </p>
          <ExpiryBadge expiryDate={product.expiryDate} />
        </div>
      )}

      <RiskScoreBadge score={risk?.score} />
      <AIInsights insights={aiInsights} />

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-md bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Back to Verify
        </button>
        <button
          onClick={() => (window.location.href = "/support")}
          className="px-6 py-3 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
        >
          Report a Problem
        </button>
      </div>
    </div>
  );
}
