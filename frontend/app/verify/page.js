"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await api.post("/verify/manual", { codeValue: code });
      // Redirect to result page with code
      router.push(`/verify/result?code=${encodeURIComponent(code)}`);
    } catch (err) {
      setError(err.message);
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
    </div>
  );
}
