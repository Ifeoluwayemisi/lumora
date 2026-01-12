"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill email if provided in query
  useEffect(() => {
    const prefilledEmail = searchParams.get("email");
    if (prefilledEmail) {
      setForm((prev) => ({ ...prev, email: prefilledEmail }));
    }
  }, [searchParams]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log("Login API response:", data); // 🔹 Debug API response

    // Check if user exists in response
    if (!res.ok || !data.user) {
      const msg =
        data.message || "Login failed. Please check your credentials.";
      setError(msg);
      toast.error(msg);
      return; // stop further execution
    }

    // Store user data and token via AuthContext
    await login(data.user, data.token);
    toast.success("Login successful! Redirecting...");

    // Redirect safely based on role
    switch (data.user.role) {
      case "manufacturer":
        router.push("/dashboard/manufacturer");
        break;
      case "admin":
        router.push("/dashboard/admin");
        break;
      default:
        router.push("/dashboard/user");
        break;
    }
  } catch (err) {
    const errorMsg =
      err.message || "An unexpected error occurred. Please try again.";
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
                  href="/auth/register"
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
