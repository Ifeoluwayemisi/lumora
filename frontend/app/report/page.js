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
    // New fields for better data capture
    reporterName: "",
    reporterPhone: "",
    batchNumber: "",
    healthImpact: "no",
    healthSymptoms: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locationStatus, setLocationStatus] = useState("requesting"); // requesting, captured, failed
  const [locationName, setLocationName] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Reverse geocode coordinates to get location name
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      );
      const data = await response.json();
      if (data.address) {
        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "Unknown";
        const state = data.address.state || "";
        const country = data.address.country || "";
        const displayLocation = [city, state, country]
          .filter(Boolean)
          .join(", ");
        return displayLocation;
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
    return null;
  };

  // Capture location when page loads
  useEffect(() => {
    const captureLocation = async () => {
      console.log("📍 Capturing reporter location...");
      try {
        const location = await getLocationPermission();
        console.log("📍 Location response:", location);

        if (location && location.latitude && location.longitude) {
          console.log("✅ Reporter location captured:", location);

          // Get location name from coordinates
          const locName = await reverseGeocode(
            location.latitude,
            location.longitude,
          );

          setFormData((prev) => ({
            ...prev,
            latitude: location.latitude,
            longitude: location.longitude,
            location: locName || "Current Location",
          }));

          if (locName) {
            setLocationName(locName);
            setLocationStatus("captured");
            toast.success(`📍 Location recorded: ${locName}`);
          } else {
            setLocationStatus("captured");
            toast.success("📍 Location recorded (coordinates captured)");
          }
        } else {
          console.warn(
            "⚠️  Reporter location not available - user may have denied permission",
          );
          setLocationStatus("failed");
          toast.info(
            "📍 Location permission denied or not available. You can still submit your report.",
          );
        }
      } catch (error) {
        console.error("❌ Location capture error:", error);
        setLocationStatus("failed");
        toast.info(
          "📍 Unable to capture location, but your report will still be processed.",
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

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }

      setProductImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      toast.success("Image selected successfully");
    }
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
      // Use FormData if image is present, otherwise use JSON
      if (productImage) {
        const uploadFormData = new FormData();
        uploadFormData.append("codeValue", formData.codeValue);
        uploadFormData.append("productName", formData.productName || "");
        uploadFormData.append("reportType", formData.reportType);
        uploadFormData.append("description", formData.description);
        uploadFormData.append("location", formData.location || "");
        uploadFormData.append("purchaseDate", formData.purchaseDate || "");
        uploadFormData.append(
          "purchaseLocation",
          formData.purchaseLocation || "",
        );
        uploadFormData.append("contact", formData.contact || "");
        uploadFormData.append("latitude", formData.latitude || "");
        uploadFormData.append("longitude", formData.longitude || "");
        uploadFormData.append("reporterName", formData.reporterName || "");
        uploadFormData.append("reporterPhone", formData.reporterPhone || "");
        uploadFormData.append("batchNumber", formData.batchNumber || "");
        uploadFormData.append("healthImpact", formData.healthImpact);
        uploadFormData.append("healthSymptoms", formData.healthSymptoms || "");
        uploadFormData.append("image", productImage);

        await api.post("/reports/submit", uploadFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("/reports/submit", {
          codeValue: formData.codeValue,
          productName: formData.productName || null,
          reportType: formData.reportType,
          description: formData.description,
          location: formData.location || null,
          purchaseDate: formData.purchaseDate || null,
          purchaseLocation: formData.purchaseLocation || null,
          contact: formData.contact || null,
          latitude: formData.latitude,
          longitude: formData.longitude,
          reporterName: formData.reporterName || null,
          reporterPhone: formData.reporterPhone || null,
          batchNumber: formData.batchNumber || null,
          healthImpact: formData.healthImpact,
          healthSymptoms: formData.healthSymptoms || null,
        });
      }

      setSubmitted(true);
      toast.success("Report submitted successfully. Thank you!");

      setTimeout(() => {
        router.push("/verify");
      }, 2000);
    } catch (err) {
      console.error("Error submitting report:", err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to submit report. Please try again.";
      toast.error(errorMsg);
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

          {/* Location Status */}
          <div className="mt-6">
            {locationStatus === "requesting" && (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Requesting your location...
              </div>
            )}
            {locationStatus === "captured" && (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
                <span>✓</span>
                Location captured:{" "}
                <span className="font-semibold">
                  {locationName || "Current Location"}
                </span>
              </div>
            )}
            {locationStatus === "failed" && (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
                <span>⚠️</span>
                Location not available
              </div>
            )}
          </div>
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

          {/* Batch/Lot Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Batch/Lot Number (Optional)
            </label>
            <input
              type="text"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              placeholder="If visible on the packaging (e.g., B123456, LOT789)"
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

          {/* Product Photo */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Product Photo (Optional)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
              />
              {productImage && (
                <button
                  type="button"
                  onClick={() => {
                    setProductImage(null);
                    setImagePreview(null);
                  }}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            {imagePreview && (
              <div className="mt-4 relative">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="max-w-sm max-h-48 rounded-lg border border-gray-300 dark:border-gray-700"
                />
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Upload a clear photo of the product packaging (max 5MB)
            </p>
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

          {/* Reporter Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Your Name (Optional)
            </label>
            <input
              type="text"
              name="reporterName"
              value={formData.reporterName}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
            />
          </div>

          {/* Reporter Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Your Phone Number (Optional)
            </label>
            <input
              type="tel"
              name="reporterPhone"
              value={formData.reporterPhone}
              onChange={handleChange}
              placeholder="For follow-up contact"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
            />
          </div>

          {/* Health Impact */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Did this product cause any health issues?
            </label>
            <select
              name="healthImpact"
              value={formData.healthImpact}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
            >
              <option value="no">No</option>
              <option value="yes">Yes, I experienced adverse effects</option>
              <option value="others">Yes, others reported issues</option>
            </select>
          </div>

          {/* Health Symptoms - conditional */}
          {formData.healthImpact !== "no" && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Please describe any symptoms or health issues:
              </label>
              <textarea
                name="healthSymptoms"
                value={formData.healthSymptoms}
                onChange={handleChange}
                placeholder="What symptoms or health effects did you or others experience?"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 resize-none"
              />
            </div>
          )}

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
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading report form...
            </p>
          </div>
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
