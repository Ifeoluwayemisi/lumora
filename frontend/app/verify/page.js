"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import api from "@/services/api";
import { getLocationPermission } from "@/utils/geolocation";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationRequested, setLocationRequested] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a product code");
      toast.error("Please enter a product code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      console.log("🔍 Starting verification with location capture...");

      // Show explanation for location request
      toast.info(
        "📍 We'll request your location to help detect counterfeit products in your area",
        {
          autoClose: 3000,
        }
      );

      const location = await getLocationPermission();

      console.log("📊 Location data before sending:", location);
      console.log("📤 Sending to backend:", {
        codeValue: code,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      const response = await api.post("/verify/manual", {
        codeValue: code,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      console.log("✅ Backend response received:", response.data);

      // Store the verification result in localStorage
      if (response.data) {
        localStorage.setItem(
          "verificationResult",
          JSON.stringify(response.data)
        );
      }

      toast.success("Code verified! Redirecting...");
      // Add small delay to ensure localStorage persists before navigation
      setTimeout(() => {
        const status = response.data?.verification?.state || "UNKNOWN";
        router.push(
          `/verify/states/${encodeURIComponent(
            status
          )}?code=${encodeURIComponent(code)}`
        );
      }, 100);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Verification failed";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      setLocationRequested(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-8">
      {/* Back Button */}
      <a
        href="/dashboard/user"
        className="fixed top-4 left-4 p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors shadow-sm"
        aria-label="Back to home"
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
      </a>

      <div className="w-full max-w-md">
        {/* Header Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-genuine/20 dark:bg-genuine/10 rounded-full mb-4">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Product
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your product code to check authenticity
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Code
              </label>
              <input
                type="text"
                placeholder="e.g., LUM-XXXX"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-genuine focus:outline-none transition"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                You'll find this code on your product packaging
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full px-6 py-3 bg-genuine hover:bg-green-300 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-blue-500 font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Verifying...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Verify Code
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                OR
              </span>
            </div>
          </div>

          {/* QR Code Link */}
          <Link
            href="/verify/qr"
            className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>📱</span>
            Scan QR Code Instead
          </Link>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <span>ℹ️</span>
            Why Verify?
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>✓ Check product authenticity</li>
            <li>✓ Detect counterfeit items</li>
            <li>✓ Verify product safety</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
