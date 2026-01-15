"use client";
import { useState, useContext, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-toastify";
import api from "@/services/api";

/**
 * Registration Page Component (Step 2 of Signup Flow)
 *
 * Features:
 * - Two-step signup: Intent picker → Account creation
 * - Role-specific form fields (Consumer vs Manufacturer)
 * - Password strength validation and indicator
 * - Phone number field for contact
 * - Company details for manufacturers
 * - Country selection for manufacturers
 * - Terms & conditions checkbox
 * - Secure token management via AuthContext
 * - Accessibility support (aria-labels, aria-describedby)
 * - Responsive design with dark mode
 * - Real-time password matching validation
 * - Toast notifications for feedback
 *
 * Redirects to:
 * - /dashboard/manufacturer (manufacturer role)
 * - /dashboard/user (user/consumer role)
 */
function RegisterContent() {
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const queryRole = searchParams.get("role") || "consumer";
  
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: queryRole === "manufacturer" ? "manufacturer" : "consumer",
    companyName: "",
    country: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isManufacturer = form.role === "manufacturer";

  /**
   * Calculate password strength
   * Returns: 0 (weak), 1 (fair), 2 (good), 3 (strong)
   */
  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++;
    if (/\\d/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return Math.min(strength, 3);
  };

  const passwordStrength = getPasswordStrength(form.password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /**
   * Handle form submission and registration
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (form.password !== form.confirmPassword) {
      const msg = "Passwords do not match";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (form.password.length < 8) {
      const msg = "Password must be at least 8 characters long";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!form.agreeToTerms) {
      const msg = "You must agree to the terms and conditions";
      setError(msg);
      toast.error(msg);
      return;
    }

    // Manufacturer-specific validation
    if (isManufacturer) {
      if (!form.companyName || form.companyName.trim().length === 0) {
        const msg = "Company name is required";
        setError(msg);
        toast.error(msg);
        return;
      }
      if (!form.country || form.country.trim().length === 0) {
        const msg = "Country is required";
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role: form.role,
      };

      // Add manufacturer-specific fields
      if (isManufacturer) {
        payload.companyName = form.companyName;
        payload.country = form.country;
      }

      const response = await api.post("/auth/signup", payload);

      toast.success(
        isManufacturer
          ? "Account created! Please upload verification documents to start generating codes."
          : "Account created successfully! Please log in to continue..."
      );

      // Redirect based on role
      if (isManufacturer) {
        // For manufacturers, redirect to verification upload page
        router.push(`/auth/login?email=${encodeURIComponent(form.email)}`);
      } else {
        // For consumers, redirect to login
        router.push(`/auth/login?email=${encodeURIComponent(form.email)}`);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "An error occurred. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-900 px-4 py-16">
      {/* Back Button - Goes to role selection */}
      <a
        href="/auth/register/select-role"
        className="fixed top-4 left-4 p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors shadow-sm"
        aria-label="Back to role selection"
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
          <div className={`px-8 py-8 text-center bg-gradient-to-r ${
            isManufacturer
              ? "from-blue-600 to-blue-700"
              : "from-genuine to-green-600"
          }`}>
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-white text-opacity-90 text-sm mt-1">
              {isManufacturer
                ? "Join as a manufacturer and protect your brand"
                : "Join Lumora and help fight counterfeits"}
            </p>
          </div>

          {/* Form Container */}
          <div className="p-8 max-h-[85vh] overflow-y-auto">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                  ⚠️ {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Full Name Input */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-genuine focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Full name"
                />
              </div>

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

              {/* Phone Input */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Phone Number {isManufacturer ? "" : "(Optional)"}
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="+234 (0) 123 456 7890"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading}
                  required={isManufacturer}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-genuine focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Phone number"
                />
              </div>

              {/* Manufacturer-Specific Fields */}
              {isManufacturer && (
                <>
                  {/* Company Name */}
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Company Name *
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      name="companyName"
                      placeholder="Your Company Ltd."
                      value={form.companyName}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      aria-label="Company name"
                    />
                  </div>

                  {/* Country Selection */}
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Country *
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      aria-label="Country"
                    >
                      <option value="">Select your country</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Egypt">Egypt</option>
                      <option value="Ethiopia">Ethiopia</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-300">
                      ℹ️ After signing up, you'll need to upload verification documents (CAC, Trademark, Regulatory approval, etc.) for NAFDAC review before generating codes.
                    </p>
                  </div>
                </>
              )}


              {/* Password Input with Strength Indicator */}
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
                  minLength={8}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-genuine focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Password"
                  aria-describedby="password-strength"
                />
                {form.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Strength:
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          passwordStrength === 0
                            ? "text-red-600"
                            : passwordStrength === 1
                            ? "text-yellow-600"
                            : passwordStrength === 2
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      >
                        {strengthLabels[passwordStrength]}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColors[passwordStrength]} transition-all duration-300`}
                        style={{
                          width: `${((passwordStrength + 1) / 4) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p
                      className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                      id="password-strength"
                    >
                      Mix letters, numbers & symbols for strength
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-genuine focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Confirm password"
                />
                {form.confirmPassword &&
                  form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      ✗ Passwords do not match
                    </p>
                  )}
                {form.confirmPassword &&
                  form.password === form.confirmPassword && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Passwords match
                    </p>
                  )}
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  name="agreeToTerms"
                  checked={form.agreeToTerms}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-genuine focus:ring-2 focus:ring-genuine disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Agree to terms and conditions"
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-genuine hover:underline font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-genuine hover:underline font-medium"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full py-3 px-4 bg-genuine text-white font-semibold rounded-lg hover:bg-green-600 active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-busy={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="text-genuine hover:text-green-600 font-medium transition-colors"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-genuine"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
