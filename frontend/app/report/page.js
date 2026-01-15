"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import api from "@/services/api";
import { getLocationPermission } from "@/utils/geolocation";

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";
  const product = searchParams.get("product") || "";
  const type = searchParams.get("type") || "counterfeit";

  const [formData, setFormData] = useState({
    codeValue: code,
    productName: product,
    reportType: type === "unregistered" ? "counterfeit" : type,
    description: "",
    location: "",
    purchaseDate: "",
    purchaseLocation: "",
    contact: "",
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Capture location when page loads
  useEffect(() => {
    const captureLocation = async () => {
      console.log("📍 Capturing reporter location...");
      const location = await getLocationPermission();
      if (location.latitude && location.longitude) {
        console.log("✅ Reporter location captured:", location);
        setFormData((prev) => ({
          ...prev,
          latitude: location.latitude,
          longitude: location.longitude,
        }));
        toast.success("📍 Your location has been recorded for this report");
      } else {
        console.warn("⚠️  Reporter location not available");
        toast.info(
          "Location not available, but your report will still be processed"
        );
      }
    };

    captureLocation();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.codeValue.trim()) {
      toast.error("Product code is required");
      return;
    }

    if (!formData.reportType) {
      toast.error("Please select a report type");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    setLoading(true);

    try {
      await api.post("/reports/submit", {
        codeValue: formData.codeValue,
        productName: formData.productName || null,
        reportType: formData.reportType,
        description: formData.description,
        location: formData.location || null,
        purchaseDate: formData.purchaseDate || null,
        purchaseLocation: formData.purchaseLocation || null,
        contact: formData.contact || null,
        latitude: formData.latitude, // Reporter's location
        longitude: formData.longitude, // Reporter's location
      });

      setSubmitted(true);
      toast.success("Report submitted successfully. Thank you!");

      setTimeout(() => {
        router.push("/verify");
      }, 2000);
    } catch (err) {
      console.error("Error submitting report:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            Report Submitted
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you for helping us fight counterfeiting. Our team will review
            your report and take appropriate action.
          </p>
          <button
            onClick={() => router.push("/verify")}
            className="w-full px-4 py-3 bg-genuine text-white rounded-lg font-medium hover:bg-green-600 transition"
          >
            Back to Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-8">
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors shadow-sm"
        aria-label="Back"
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
      </button>

      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <span className="text-4xl">🚩</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Report Suspicious Product
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Help us identify and prevent counterfeiting. Your information is
            valuable to us.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code Value */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Product Code *
            </label>
            <input
              type="text"
              name="codeValue"
              value={formData.codeValue}
              onChange={handleChange}
              placeholder="Enter the product code"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
              required
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Product Name (Optional)
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="What product is this?"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
            />
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Report Type *
            </label>
            <select
              name="reportType"
              value={formData.reportType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
              required
            >
              <option value="counterfeit">Suspected Counterfeit</option>
              <option value="fake_packaging">Fake/Altered Packaging</option>
              <option value="invalid_code">Invalid or Fake Code</option>
              <option value="quality_issue">Quality Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please describe what makes you suspect this product is counterfeit or problematic..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 resize-none"
              required
            />
          </div>

          {/* Purchase Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Where did you buy this? (Optional)
            </label>
            <input
              type="text"
              name="purchaseLocation"
              value={formData.purchaseLocation}
              onChange={handleChange}
              placeholder="Shop name, online store, location, etc."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              When did you buy this? (Optional)
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Your Contact (Email or Phone) (Optional)
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="So we can follow up with you if needed"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ℹ️ <strong>Your report helps us:</strong> Identify counterfeit
              products, protect consumers, and take action against fraudulent
              sellers.
            </p>
          </div>

          {/* Submit Button */}
          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "🚩 Submit Report"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading report form...</p>
          </div>
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
