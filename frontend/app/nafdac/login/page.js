"use client";

// Mark this page as dynamic to prevent static prerendering
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiMail, FiLock, FiShield, FiAlertCircle } from "react-icons/fi";
import { nafdacAuthApi } from "@/services/nafdacApi";

/**
 * NAFDAC Login Page
 * Secure two-factor authentication for regulatory staff
 * This is a separate, dedicated login portal for NAFDAC officials only
 */
export default function NAFDACLoginPage() {
  const router = useRouter();

  // Step 1: Email/Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tempToken, setTempToken] = useState("");

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
      const response = await nafdacAuthApi.loginStep1(email, password);
      setTempToken(response.data.tempToken);
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.data?.message ||
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
      const response = await nafdacAuthApi.loginStep2(tempToken, twoFactorCode);
      // Store NAFDAC-specific tokens
      localStorage.setItem("nafdac_user", JSON.stringify(response.data.user));
      localStorage.setItem("nafdac_token", response.data.token);

      // Redirect to NAFDAC dashboard
      router.push("/dashboard/nafdac");
    } catch (err) {
      console.error("2FA error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.data?.message ||
          "2FA verification failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <Image
              src="/image/logo.png"
              alt="Lumora Logo"
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NAFDAC Portal</h1>
          <p className="text-emerald-300 flex items-center justify-center gap-2">
            <FiShield className="w-5 h-5" />
            Regulatory Intelligence & Enforcement
          </p>
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
              <label className="block text-emerald-300 text-sm font-semibold mb-2">
                Official Email
              </label>
              <input
                type="email"
                placeholder="your.name@nafdac.gov.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-emerald-300 text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-6"
            >
              {isLoading ? "Verifying..." : "Continue"}
            </button>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-slate-900 border border-emerald-800 rounded-lg flex items-start gap-2">
              <FiShield className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-xs">
                This is a secure portal for NAFDAC regulatory staff only. All access is logged.
              </p>
            </div>
          </form>
        )}

        {/* Step 2: 2FA */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <div className="bg-emerald-950 border border-emerald-800 rounded-lg p-4 mb-4">
              <p className="text-emerald-200 text-sm text-center">
                A verification code has been sent to your secure email.
              </p>
            </div>

            {/* 2FA Code Input */}
            <div>
              <label className="block text-emerald-300 text-sm font-semibold mb-2">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength="6"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-center text-2xl tracking-widest placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
              <p className="text-slate-400 text-xs mt-2">6-digit code from your email</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || twoFactorCode.length !== 6}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-6"
            >
              {isLoading ? "Verifying..." : "Verify & Login"}
            </button>

            {/* Go Back Button */}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setTwoFactorCode("");
                setError("");
              }}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Back
            </button>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-slate-900 border border-emerald-800 rounded-lg flex items-start gap-2">
              <FiShield className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-xs">
                Two-factor authentication protects your account from unauthorized access.
              </p>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 text-xs">
          <p>
            Authorized personnel only. Unauthorized access is prohibited and will be reported.
          </p>
        </div>
      </div>
    </div>
  );
}
