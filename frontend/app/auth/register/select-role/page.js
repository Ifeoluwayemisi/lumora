"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Role Intent Picker Page
 *
 * This is Step 1 of the signup flow.
 * Users select their intent (Consumer or Manufacturer)
 * which determines what happens in Step 2 (actual signup form)
 *
 * Flow:
 * 1. User selects "I want to verify products" → CONSUMER
 * 2. User selects "I own/manufacture products" → MANUFACTURER
 * 3. Redirect to /auth/register?role=consumer or ?role=manufacturer
 */

export default function SelectRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleRoleSelect = (role) => {
    setIsTransitioning(true);
    setSelectedRole(role);

    // Redirect to signup form with role query param
    setTimeout(() => {
      router.push(`/auth/register?role=${role}`);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-16">
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

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome to Lumora
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            What brings you here? Let's get you set up.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Consumer Card */}
          <button
            onClick={() => handleRoleSelect("consumer")}
            disabled={isTransitioning}
            className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 ${
              selectedRole === "consumer"
                ? "ring-2 ring-genuine ring-offset-2 dark:ring-offset-gray-900"
                : "hover:shadow-xl"
            } ${
              isTransitioning && selectedRole !== "consumer" ? "opacity-50" : ""
            }`}
            style={{
              background:
                selectedRole === "consumer"
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)",
            }}
          >
            {/* Animated background blur for dark mode */}
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                selectedRole !== "consumer"
                  ? "dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800"
                  : ""
              }`}
            ></div>

            {/* Content */}
            <div className="relative z-10 text-left">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                  selectedRole === "consumer"
                    ? "bg-white/20"
                    : "bg-genuine/10 dark:bg-genuine/20"
                }`}
              >
                <svg
                  className={`w-7 h-7 ${
                    selectedRole === "consumer"
                      ? "text-white"
                      : "text-genuine dark:text-green-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2
                className={`text-2xl font-bold mb-2 ${
                  selectedRole === "consumer"
                    ? "text-white"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                Verify Products
              </h2>

              <p
                className={`text-sm mb-6 leading-relaxed ${
                  selectedRole === "consumer"
                    ? "text-green-50"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Scan QR codes to verify product authenticity and see AI-powered
                insights about brand safety.
              </p>

              <div
                className={`space-y-2 text-sm ${
                  selectedRole === "consumer"
                    ? "text-green-50"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Instant authenticity checks
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  View product details
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Report suspicious items
                </div>
              </div>

              <div
                className={`mt-6 inline-block px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  selectedRole === "consumer"
                    ? "bg-white/20 text-white"
                    : "bg-genuine/10 dark:bg-genuine/20 text-genuine dark:text-green-400"
                }`}
              >
                {selectedRole === "consumer" ? "✓ Selected" : "Get Started"}
              </div>
            </div>
          </button>

          {/* Manufacturer Card */}
          <button
            onClick={() => handleRoleSelect("manufacturer")}
            disabled={isTransitioning}
            className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 ${
              selectedRole === "manufacturer"
                ? "ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900"
                : "hover:shadow-xl"
            } ${
              isTransitioning && selectedRole !== "manufacturer"
                ? "opacity-50"
                : ""
            }`}
            style={{
              background:
                selectedRole === "manufacturer"
                  ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                  : "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)",
            }}
          >
            {/* Content */}
            <div className="relative z-10 text-left">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                  selectedRole === "manufacturer"
                    ? "bg-white/20"
                    : "bg-blue-600/10 dark:bg-blue-500/20"
                }`}
              >
                <svg
                  className={`w-7 h-7 ${
                    selectedRole === "manufacturer"
                      ? "text-white"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <h2
                className={`text-2xl font-bold mb-2 ${
                  selectedRole === "manufacturer"
                    ? "text-white"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                Own/Manufacture Products
              </h2>

              <p
                className={`text-sm mb-6 leading-relaxed ${
                  selectedRole === "manufacturer"
                    ? "text-blue-50"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Protect your brand with verification codes, monitor
                counterfeits, and get AI-powered supply chain insights.
              </p>

              <div
                className={`space-y-2 text-sm ${
                  selectedRole === "manufacturer"
                    ? "text-blue-50"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Generate verification codes
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Monitor verifications
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  AI-powered insights & alerts
                </div>
              </div>

              <div
                className={`mt-6 inline-block px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  selectedRole === "manufacturer"
                    ? "bg-white/20 text-white"
                    : "bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                }`}
              >
                {selectedRole === "manufacturer" ? "✓ Selected" : "Get Started"}
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-semibold text-genuine dark:text-green-400 hover:underline"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
