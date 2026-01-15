"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import api from "@/services/api";

/**
 * Forgot Password Page Component
 *
 * Features:
 * - Email input for password reset request
 * - Toast notifications for feedback
 * - Secure link-based password reset
 * - Accessibility support (aria-labels)
 * - Responsive design with dark mode
 * - Back button to return to login
 * - Links to login and register pages
 */

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/forgot-password", { email });

      const msg =
        response.data?.message ||
        "If this email exists, a password reset link has been sent.";
      setSuccess(msg);
      toast.success(msg);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-900 px-4">
      {/* Back Button */}
      <a
        href="/auth/login"
        className="fixed top-4 left-4 p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors shadow-sm"
        aria-label="Back to login"
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

      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Forgot Password
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
          Enter your email and we’ll send you a reset link.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">
              ⚠️ {error}
            </p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-300 text-sm font-medium">
              ✓ {success}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-genuine focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Email address"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-genuine text-white font-semibold rounded-lg hover:bg-green-600 active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-busy={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            Remember your password?{" "}
            <a
              href="/auth/login"
              className="text-genuine hover:text-green-600 font-medium transition-colors"
            >
              Sign in
            </a>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <a
              href="/auth/register/select-role"
              className="text-genuine hover:text-green-600 font-medium transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
