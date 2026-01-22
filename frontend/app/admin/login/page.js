"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { adminAuthApi } from "@/services/adminApi";
import {
  AdminInput,
  AdminButton,
  AdminErrorMessage,
  AdminLoadingSpinner,
} from "@/components/admin/AdminComponents";
import { FiMail, FiLock, FiShield } from "react-icons/fi";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isHydrated, adminUser } = useAdmin();

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

  // Redirect if already logged in
  useEffect(() => {
    if (isHydrated && adminUser) {
      router.push("/admin/dashboard");
    }
  }, [adminUser, isHydrated, router]);

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
      login(response.user, response.authToken);
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

  if (!isHydrated) {
    return <AdminLoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">LUMORA</h1>
          <p className="text-blue-100">Admin Control Panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {error && <AdminErrorMessage message={error} />}

          {step === 1 ? (
            // Step 1: Email/Password
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Enter your credentials to continue
                </p>
              </div>

              <form onSubmit={handleStep1} className="space-y-4">
                <AdminInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lumora.io"
                  required
                  disabled={isLoading}
                  icon={FiMail}
                />

                <AdminInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  icon={FiLock}
                />

                <AdminButton
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  className="w-full"
                  type="submit"
                >
                  Continue
                </AdminButton>
              </form>

              <p className="text-center text-gray-600 text-sm mt-6">
                Don't have an account?{" "}
                <button
                  onClick={() => router.push("/admin/register")}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Register here
                </button>
              </p>
            </>
          ) : (
            // Step 2: 2FA
            <>
              <div className="mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4">
                  <FiShield className="text-blue-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                  Two-Factor Authentication
                </h2>
                <p className="text-gray-600 text-sm mt-2 text-center">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <form onSubmit={handleStep2} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Authentication Code
                  </label>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setTwoFactorCode(val);
                    }}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono"
                    required
                    disabled={isLoading}
                    autoComplete="off"
                  />
                </div>

                <AdminButton
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  className="w-full"
                  type="submit"
                >
                  Verify
                </AdminButton>
              </form>

              <button
                onClick={() => {
                  setStep(1);
                  setTempToken("");
                  setTwoFactorCode("");
                  setError("");
                }}
                className="w-full mt-6 text-center text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Back to Sign In
              </button>
            </>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-xs">
              For security reasons, please ensure you're on a secure device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
