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
  const [hoveredRole, setHoveredRole] = useState(null);

  const handleRoleSelect = (role) => {
    console.log("[ROLE SELECTION] User selected role:", role);
    setIsTransitioning(true);
    setSelectedRole(role);

    // Redirect to signup form with role query param
    setTimeout(() => {
      const redirectUrl = `/auth/register?role=${role}`;
      console.log("[ROLE SELECTION] Redirecting to:", redirectUrl);
      router.push(redirectUrl);
    }, 400);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 px-4 py-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-b from-purple-400/10 to-transparent rounded-full blur-3xl animate-float"></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .card-glow {
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
          transition: all 0.5s ease;
        }
        .card-glow.active {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
      `}</style>
      {/* Back Button */}
      <a
        href="/"
        className="fixed top-4 left-4 p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300 shadow-lg backdrop-blur-md z-50 hover:scale-110 transform"
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

      {/* Content Container */}
      <div className="flex items-center justify-center min-h-screen relative z-10">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg blur-xl opacity-75"></div>
                <div className="relative bg-slate-950 px-6 py-3 rounded-lg">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 font-bold text-lg">
                    LUMORA
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Join the Trust Network
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              Choose your role to protect and verify authenticity
            </p>

          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Consumer Card */}
            <button
              onClick={() => handleRoleSelect("consumer")}
              onMouseEnter={() => setHoveredRole("consumer")}
              onMouseLeave={() => setHoveredRole(null)}
              disabled={isTransitioning}
              className={`card-glow group relative overflow-hidden rounded-2xl transition-all duration-500 transform cursor-pointer ${
                selectedRole === "consumer" ? "active scale-100" : ""
              } ${
                hoveredRole === "consumer" && selectedRole !== "manufacturer"
                  ? "scale-105"
                  : ""
              } ${
                isTransitioning && selectedRole !== "consumer"
                  ? "opacity-40 scale-95"
                  : ""
              } ${
                isTransitioning && selectedRole === "consumer"
                  ? "scale-110"
                  : ""
              }`}
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 transition-all duration-500 ${
                  hoveredRole === "consumer" || selectedRole === "consumer"
                    ? "opacity-100"
                    : "opacity-80"
                }`}
              ></div>

              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl p-px bg-gradient-to-r from-white/50 via-white/25 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Glow effect on hover */}
              <div
                className={`absolute -inset-px rounded-2xl bg-gradient-to-r from-green-400/0 via-green-400/20 to-green-400/0 blur-lg opacity-0 transition-opacity duration-500 ${
                  hoveredRole === "consumer" || selectedRole === "consumer"
                    ? "opacity-100"
                    : ""
                }`}
              ></div>

              {/* Content */}
              <div className="relative z-10 p-10 text-left h-full flex flex-col">
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 group-hover:rotate-6">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  {/* Pulse effect */}
                  <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-white/20 animate-pulse"></div>
                </div>

                {/* Text Content */}
                <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
                  Verify Products
                </h2>

                <p className="text-green-100/90 text-base mb-8 flex-grow leading-relaxed">
                  Scan QR codes to verify product authenticity and protect
                  yourself from counterfeits with instant AI insights.
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {[
                    { icon: "✓", text: "Instant authenticity verification" },
                    { icon: "✓", text: "Detailed product information" },
                    { icon: "✓", text: "Report suspicious products" },
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 text-green-50/80 group-hover:text-green-50 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                        {feature.icon}
                      </div>
                      {feature.text}
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div
                  className={`inline-block px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    selectedRole === "consumer"
                      ? "bg-white text-green-600 shadow-xl"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {selectedRole === "consumer" ? "✓ Selected" : "Choose Role"}
                </div>
              </div>
            </button>

            {/* Manufacturer Card */}
            <button
              onClick={() => handleRoleSelect("manufacturer")}
              onMouseEnter={() => setHoveredRole("manufacturer")}
              onMouseLeave={() => setHoveredRole(null)}
              disabled={isTransitioning}
              className={`card-glow group relative overflow-hidden rounded-2xl transition-all duration-500 transform cursor-pointer ${
                selectedRole === "manufacturer" ? "active scale-100" : ""
              } ${
                hoveredRole === "manufacturer" && selectedRole !== "consumer"
                  ? "scale-105"
                  : ""
              } ${
                isTransitioning && selectedRole !== "manufacturer"
                  ? "opacity-40 scale-95"
                  : ""
              } ${
                isTransitioning && selectedRole === "manufacturer"
                  ? "scale-110"
                  : ""
              }`}
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 transition-all duration-500 ${
                  hoveredRole === "manufacturer" ||
                  selectedRole === "manufacturer"
                    ? "opacity-100"
                    : "opacity-80"
                }`}
              ></div>

              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl p-px bg-gradient-to-r from-white/50 via-white/25 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Glow effect on hover */}
              <div
                className={`absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 blur-lg opacity-0 transition-opacity duration-500 ${
                  hoveredRole === "manufacturer" ||
                  selectedRole === "manufacturer"
                    ? "opacity-100"
                    : ""
                }`}
              ></div>

              {/* Content */}
              <div className="relative z-10 p-10 text-left h-full flex flex-col">
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 group-hover:-rotate-6">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>

                  {/* Pulse effect */}
                  <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-white/20 animate-pulse"></div>
                </div>

                {/* Text Content */}
                <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
                  Manufacture & Protect
                </h2>

                <p className="text-blue-100/90 text-base mb-8 flex-grow leading-relaxed">
                  Generate verification codes, monitor counterfeits, and get
                  AI-powered insights into your supply chain.
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {[
                    { icon: "✓", text: "Create unique verification codes" },
                    { icon: "✓", text: "Monitor all verifications" },
                    { icon: "✓", text: "AI-powered fraud detection" },
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 text-blue-50/80 group-hover:text-blue-50 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                        {feature.icon}
                      </div>
                      {feature.text}
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div
                  className={`inline-block px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    selectedRole === "manufacturer"
                      ? "bg-white text-blue-600 shadow-xl"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {selectedRole === "manufacturer"
                    ? "✓ Selected"
                    : "Choose Role"}
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 hover:underline transition-all"
              >
                Sign in here
              </a>
            </p>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-6 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                  10K+
                </div>
                <div className="text-xs text-gray-400">Products Protected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                  50K+
                </div>
                <div className="text-xs text-gray-400">Verifications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                  99.9%
                </div>
                <div className="text-xs text-gray-400">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
