"use client";

// Mark this page as dynamic to prevent static prerendering
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminInput,
  AdminButton,
  AdminErrorMessage,
} from "@/components/admin/AdminComponents";
import { FiMail, FiLock, FiShield } from "react-icons/fi";
import { adminAuthApi } from "@/services/adminApi";

export default function AdminLoginPage() {
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
      const response = await adminAuthApi.loginStep1(email, password);
      setTempToken(response.tempToken);
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
      const response = await adminAuthApi.loginStep2(tempToken, twoFactorCode);

      // Save to localStorage
      localStorage.setItem("admin_user", JSON.stringify(response.user));
      localStorage.setItem("admin_token", response.authToken);

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

        {/* Error Message */}
        {error && <AdminErrorMessage message={error} className="mb-6" />}

        {/* Step 1: Email/Password */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <AdminInput
              icon={FiMail}
              placeholder="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="mb-4"
            />

            <AdminInput
              icon={FiLock}
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="mb-6"
            />

            <AdminButton
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Continue"}
            </AdminButton>
          </form>
        )}

        {/* Step 2: 2FA */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <p className="text-slate-300 text-center mb-4">
              Enter the 6-digit code from your authenticator app
            </p>

            <AdminInput
              icon={FiShield}
              placeholder="000000"
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.slice(0, 6))}
              maxLength="6"
              required
              disabled={isLoading}
              className="mb-6 text-center text-2xl tracking-widest"
            />

            <AdminButton
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </AdminButton>

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
