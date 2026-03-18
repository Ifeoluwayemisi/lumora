"use client";
import { useState, useContext, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-toastify";
import api from "@/services/api";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Prefill email if provided in query
  useEffect(() => {
    const prefilledEmail = searchParams.get("email");
    if (prefilledEmail) {
      setForm((prev) => ({ ...prev, email: prefilledEmail }));
    }
  }, [searchParams]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const response = await api.get("/auth/google/url?intent=signin");
      const { authUrl } = response.data;
      window.location.href = authUrl;
    } catch (err) {
      console.error("[GOOGLE_LOGIN] Error:", err);
      let errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to initiate Google sign-in";

      // Provide more helpful error messages
      if (err.response?.status === 503) {
        errorMsg =
          "Google OAuth not configured. Please contact admin or try signing in with your email.";
      } else if (
        errorMsg.includes("not configured") ||
        errorMsg.includes("admin")
      ) {
        errorMsg =
          errorMsg +
          " For now, please use email and password to sign in instead.";
      }

      setError(errorMsg);
      toast.error(errorMsg);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);
      const data = response.data;

      // Check if user exists in response
      if (!data.user) {
        const msg = "Login failed. Please check your credentials.";
        setError(msg);
        toast.error(msg);
        return;
      }

      // Store user data and token via AuthContext
      await login(data.user, data.token);
      toast.success("Login successful! Redirecting...");

      console.log("[LOGIN FRONTEND] Response received:", {
        role: data.user.role,
        userId: data.user.id,
        email: data.user.email,
      });

      // Redirect safely based on role
      const userRole = data.user.role;
      console.log(
        "[LOGIN FRONTEND] Original role from API:",
        userRole,
        "Type:",
        typeof userRole,
      );

      switch (userRole) {
        case "manufacturer":
          console.log("[LOGIN FRONTEND] Redirecting to manufacturer dashboard");
          router.push("/dashboard/manufacturer");
          break;
        case "admin":
          console.log("[LOGIN FRONTEND] Redirecting to admin dashboard");
          router.push("/dashboard/admin");
          break;
        case "NAFDAC":
          console.log("[LOGIN FRONTEND] Redirecting to NAFDAC dashboard");
          router.push("/dashboard/nafdac");
          break;
        default:
          console.log(
            "[LOGIN FRONTEND] Redirecting to user dashboard (default). Role was:",
            userRole,
          );
          router.push("/dashboard/user");
          break;
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-900 px-4 py-16">
      {/* Back Button */}
      <a
        href="/"
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-genuine to-green-600 px-8 py-8 text-center">
            <h2 className="text-3xl font-bold text-white">Sign In</h2>
            <p className="text-green-100 text-sm mt-1">
              Access your Lumora account
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                  ⚠️ {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-genuine focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Email address"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-genuine focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 px-4 bg-genuine text-white font-semibold rounded-lg hover:bg-green-600 active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-busy={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                or
              </span>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            </div>

            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 dark:text-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              {googleLoading ? "Signing in..." : "Continue with Google"}
            </button>

            {/* Footer */}
            <div className="mt-6 space-y-3 text-sm">
              <a
                href="/auth/forgot-password"
                className="block text-center text-genuine hover:text-green-600 font-medium transition-colors"
              >
                Forgot your password?
              </a>
              <div className="text-center text-gray-600 dark:text-gray-400">
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
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-genuine-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-genuine"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
