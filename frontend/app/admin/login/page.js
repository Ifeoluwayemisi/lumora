"use client";

// Mark this page as dynamic to prevent static prerendering
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiShield, FiAlertCircle } from "react-icons/fi";
import { adminAuthApi } from "@/services/adminApi";

export default function AdminLoginPage() {
  const router = useRouter();

  // Step 1: Email/Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [adminId, setAdminId] = useState("");

  // Step 2: 2FA
  const [twoFactorCode, setTwoFactorCode] = useState("");

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Step 1: Email/Password
  const handleStep1 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await adminAuthApi.loginStep1(email, password);
      setTempToken(response.data.tempToken);
      setAdminId(response.data.adminId);
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2: 2FA
  const handleStep2 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await adminAuthApi.loginStep2(tempToken, twoFactorCode, adminId);

      // Save to localStorage
      localStorage.setItem("admin_user", JSON.stringify(response.data.user));
      localStorage.setItem("admin_token", response.data.authToken);

      router.push("/admin/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "2FA verification failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Lumora Admin</h1>
          <p className="text-slate-400">Secure Access Portal</p>
        </div>

        {/* Error Message - Always rendered but hidden if no error */}
        {error !== "" && (
          <div className="bg-red-950 border border-red-800 rounded-lg p-4 mb-6 flex items-start gap-3">
            <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Email/Password */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-6"
            >
              {isLoading ? "Verifying..." : "Continue"}
            </button>
          </form>
        )}

        {/* Step 2: 2FA */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <p className="text-slate-300 text-center mb-6">
              Enter the 6-digit code from your authenticator app
            </p>

            {/* 2FA Code Input */}
            <div>
              <input
                type="text"
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) =>
                  setTwoFactorCode(
                    e.target.value.slice(0, 6).replace(/\D/g, ""),
                  )
                }
                maxLength="6"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-6"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setTwoFactorCode("");
                setError("");
              }}
              disabled={isLoading}
              className="w-full text-sm text-slate-400 hover:text-slate-300 disabled:opacity-50 py-2 transition"
            >
              Back to Email/Password
            </button>
          </form>
        )}

        {/* Security Notice */}
        <p className="text-xs text-slate-500 text-center mt-6">
          This is a secure admin portal. All access is logged and monitored.
        </p>
      </div>
    </div>
  );
}
