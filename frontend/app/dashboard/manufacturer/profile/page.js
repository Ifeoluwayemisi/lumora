"use client";
import { useEffect, useState, useContext } from "react";
import api from "@/services/api";
import { toast } from "react-toastify";
import { AuthContext } from "@/context/AuthContext";

/**
 * Manufacturer Profile Page
 *
 * Features:
 * - Edit company information
 * - Upload verification documents
 * - View document status
 * - Trust score and risk level display
 * - Account status badge
 */

const requiredDocuments = [
  {
    id: "cac",
    name: "CAC/Business Registration",
    description: "Certificate of Incorporation or Business Registration",
    required: true,
  },
  {
    id: "trademark",
    name: "Trademark Certificate",
    description: "Proof of trademark registration",
    required: true,
  },
  {
    id: "regulatory",
    name: "NAFDAC/FDA Approval",
    description: "Product regulatory approval certificate",
    required: true,
  },
  {
    id: "factory",
    name: "Factory License",
    description: "Manufacturing facility license",
    required: true,
  },
  {
    id: "website",
    name: "Official Website",
    description: "Website URL",
    required: true,
  },
  {
    id: "contract",
    name: "Distribution Contracts",
    description: "Authorized distributor agreements",
    required: false,
  },
  {
    id: "authorization",
    name: "Authorization Letters",
    description: "Letters from product owners",
    required: false,
  },
];

export default function ManufacturerProfilePage() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [manufacturer, setManufacturer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    website: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchManufacturer();
  }, []);

  const fetchManufacturer = async () => {
    setLoading(true);
    try {
      const response = await api.get("/manufacturer/dashboard");
      const { manufacturer } = response.data;
      setManufacturer(manufacturer);
      setFormData({
        name: manufacturer.name || "",
        email: manufacturer.email || "",
        phone: manufacturer.phone || "",
        country: manufacturer.country || "",
        website: manufacturer.website || "",
      });
    } catch (err) {
      console.error("[FETCH] Error:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.patch("/manufacturer/profile", formData);
      toast.success("Profile updated successfully!");
      await fetchManufacturer();
    } catch (err) {
      console.error("[UPDATE] Error:", err);
      const message =
        err.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 pt-12 md:pt-16 pb-20 md:pb-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-12 md:pt-16 pb-20 md:pb-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your company information and verification documents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2">
          {/* Company Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Company Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Official Website URL
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold transition-colors"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Verification Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Verification Documents
            </h2>

            <div className="space-y-4">
              {requiredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {doc.name}
                        </h3>
                        {doc.required && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {doc.description}
                      </p>
                      <button className="text-sm px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Upload File
                      </button>
                    </div>
                    <div className="text-3xl">📄</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                ℹ️ <strong>Note:</strong> All required documents must be uploaded and
                approved by our NAFDAC team before you can generate codes. This
                typically takes 1-3 business days.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Status Cards */}
        <div>
          {/* Account Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account Status
            </h3>

            <div className="space-y-4">
              {/* Verification Status */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Verification Status
                </p>
                <div className="flex items-center gap-2">
                  {manufacturer?.accountStatus === "verified" ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="font-semibold text-green-700 dark:text-green-400">
                        Verified
                      </span>
                    </>
                  ) : manufacturer?.accountStatus === "pending_verification" ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                      <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                        Pending Review
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="font-semibold text-red-700 dark:text-red-400">
                        Rejected
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Trust Score */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Trust Score
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        (manufacturer?.trustScore || 0) >= 80
                          ? "bg-green-500"
                          : (manufacturer?.trustScore || 0) >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${(manufacturer?.trustScore || 0)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {manufacturer?.trustScore || 0}%
                  </span>
                </div>
              </div>

              {/* Risk Level */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Risk Level
                </p>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    manufacturer?.riskLevel === "LOW"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : manufacturer?.riskLevel === "MEDIUM"
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  }`}
                >
                  {manufacturer?.riskLevel || "MEDIUM"}
                </div>
              </div>
            </div>
          </div>

          {/* Account Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
              Need Help?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
              If you have questions about verification or need assistance uploading
              documents, please contact our support team.
            </p>
            <a
              href="mailto:support@lumora.com"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
