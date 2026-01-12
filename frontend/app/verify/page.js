"use client";
import { useState } from "react";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/verification/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 pt-6 md:pt-12">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">
        Verify Product
      </h1>

      <input
        type="text"
        placeholder="Enter product code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="p-4 w-full max-w-md rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="px-6 py-3 bg-genuine text-white rounded-md font-semibold hover:bg-green-600 transition"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && (
        <div className="mt-6 w-full max-w-md rounded-lg p-4 border dark:border-gray-600 bg-white dark:bg-gray-800 shadow">
          <h2 className="font-bold text-lg mb-2">Verification Result:</h2>
          <p className="mb-2">
            Status: <span className="font-semibold">{result.status}</span>
          </p>
          {result.details && <p>Details: {result.details}</p>}
        </div>
      )}
    </div>
  );
}
