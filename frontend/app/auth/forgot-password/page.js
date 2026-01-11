"use client";

import { useState } from "react";
import { toast } from "react-toastify";

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const msg = "If this email exists, a password reset link has been sent.";
      setSuccess(msg);
      toast.success(msg);
    } catch (err) {
      const errorMsg = err.message || "Something went wrong";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Forgot Password
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
          Enter your email and we’ll send you a reset link.
        </p>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {success && (
          <p className="text-green-600 mb-4 text-center">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />

          <button
            disabled={loading}
            className="w-full bg-genuine text-white py-4 rounded-md font-semibold hover:bg-green-600 transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/auth/login"
            className="text-genuine hover:underline text-sm"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
