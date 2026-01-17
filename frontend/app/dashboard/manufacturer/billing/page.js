"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import api from "@/services/api";
import { toast } from "react-toastify";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiChevronDown } from "react-icons/fi";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    period: "month",
    description: "Perfect for startups",
    features: [
      "50 codes per day",
      "Basic analytics",
      "Email support",
      "Up to 5 products",
      "1 team member",
    ],
    limitations: [
      "No hotspot prediction",
      "No advanced AI insights",
      "Community support only",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 50000, // NGN per month
    period: "month",
    description: "For growing brands",
    features: [
      "Unlimited codes",
      "Advanced analytics",
      "Priority support",
      "Unlimited products",
      "Up to 10 team members",
      "Hotspot prediction",
      "Advanced AI insights",
      "Export reports (CSV, JSON, PDF)",
    ],
    highlighted: true,
  },
];

export default function BillingPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [paystackPublicKey, setPaystackPublicKey] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "Can I change plans anytime?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected immediately.",
    },
    {
      id: 2,
      question: "Is there a refund policy?",
      answer:
        "We offer a 7-day money-back guarantee if you're not satisfied with the Premium plan.",
    },
    {
      id: 3,
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard) and bank transfers via Paystack.",
    },
    {
      id: 4,
      question: "Do you offer enterprise plans?",
      answer: "Yes! Contact our sales team for custom enterprise solutions.",
    },
  ];

  useEffect(() => {
    fetchDashboard();
    loadPaymentConfig();
    loadPaystackScript();
  }, []);

  const loadPaymentConfig = async () => {
    try {
      console.log("[LOAD_CONFIG] Fetching payment config...");
      const response = await api.get("/manufacturer/billing/config");
      console.log("[LOAD_CONFIG] Response:", response.data);

      if (!response.data.success) {
        console.error(
          "[LOAD_CONFIG] Response not successful:",
          response.data.error,
        );
        toast.error(`Configuration error: ${response.data.error}`);
        return;
      }

      const publicKey = response.data.data?.publicKey;
      if (!publicKey) {
        console.error("[LOAD_CONFIG] No publicKey in response:", response.data);
        toast.error(
          "Payment configuration error: Missing public key. Check console.",
        );
        return;
      }

      console.log("[LOAD_CONFIG] Public key loaded successfully");
      setPaystackPublicKey(publicKey);
    } catch (err) {
      console.error("[LOAD_CONFIG] Error:", err);
      console.error(
        "[LOAD_CONFIG] Error details:",
        err.response?.data || err.message,
      );
      toast.error(
        `Failed to load payment config: ${
          err.response?.data?.error || err.message
        }`,
      );
    }
  };

  const loadPaystackScript = () => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    document.body.appendChild(script);
  };

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/manufacturer/dashboard");
      setDashboard(response.data);
      setLoading(false);
    } catch (err) {
      console.error("[FETCH_DASHBOARD] Error:", err);
      toast.error("Failed to load billing info");
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    if (planId === "basic") {
      toast.info("You are already on the Basic plan");
      return;
    }

    if (!paystackPublicKey) {
      toast.error("Payment configuration not loaded. Please refresh the page.");
      return;
    }

    setProcessing(true);
    try {
      // Step 1: Initiate payment with backend
      const initResponse = await api.post(
        "/manufacturer/billing/initiate-payment",
        {
          planId,
        },
      );

      const { authorization_url, reference } = initResponse.data.data;

      console.log("[UPGRADE] Payment initiated");
      console.log("[UPGRADE] User email:", user?.email);
      console.log("[UPGRADE] Paystack public key:", paystackPublicKey);

      // Step 2: Open Paystack popup
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: user?.email, // Use authenticated user email from context
        amount: PLANS.find((p) => p.id === planId).price * 100, // Convert to kobo
        ref: reference,
        currency: "NGN",
        onClose: () => {
          setProcessing(false);
          toast.info("Payment cancelled");
        },
        onSuccess: async (response) => {
          // Step 3: Verify payment with backend
          try {
            const verifyResponse = await api.post(
              "/manufacturer/billing/verify-payment",
              { reference },
            );

            toast.success("🎉 Plan upgraded successfully!");

            // Refresh dashboard to show updated plan
            await fetchDashboard();

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push("/dashboard/manufacturer");
            }, 2000);
          } catch (err) {
            console.error("[VERIFY] Error:", err);
            toast.error(
              "Payment verified but plan update failed. Please contact support.",
            );
          } finally {
            setProcessing(false);
          }
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error("[UPGRADE] Error:", err);
      toast.error(err.response?.data?.error || "Failed to initiate payment");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading billing...</p>
        </div>
      </div>
    );
  }

  const currentPlan = dashboard?.plan;

  return (
    <>
      <DashboardSidebar userRole="manufacturer" />
      <MobileBottomNav userRole="manufacturer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 pt-12 md:pt-16">
          <Link
            href="/dashboard/manufacturer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 font-medium mb-6"
          >
            <FiArrowLeft /> Back to Dashboard
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Plans & Billing
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upgrade your account to unlock premium features
            </p>
          </div>

          {/* Current Plan */}
          {currentPlan && (
            <div className="mb-12 p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                ✓ Current Plan
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                You are on the <strong>{currentPlan?.name || "Basic"}</strong>{" "}
                plan
              </p>
              {currentPlan?.type === "basic" && (
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                  Upgrade to Premium to unlock unlimited codes, advanced
                  analytics, and more.
                </p>
              )}
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-8 rounded-xl border-2 transition-all ${
                  plan.highlighted
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 ring-2 ring-blue-400 dark:ring-blue-600"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-xl text-sm font-semibold">
                    Recommended
                  </div>
                )}

                {/* Plan Name & Price */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {plan.description}
                </p>

                <div className="mb-6">
                  {plan.price === 0 ? (
                    <p className="text-4xl font-bold text-green-600">Free</p>
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">
                        ₦{plan.price.toLocaleString()}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        per {plan.period}
                      </p>
                    </>
                  )}
                </div>

                {/* CTA Button */}
                {currentPlan?.type === plan.id ? (
                  <button
                    disabled
                    className="w-full px-4 py-3 bg-gray-400 text-white rounded-lg font-semibold mb-6 cursor-not-allowed opacity-50"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={processing}
                    className={`w-full px-4 py-3 rounded-lg font-semibold mb-6 transition-colors ${
                      plan.highlighted
                        ? "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                    }`}
                  >
                    {processing
                      ? "Processing..."
                      : plan.price === 0
                        ? "Downgrade"
                        : "Upgrade"}
                  </button>
                )}

                {/* Features */}
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Included:
                  </p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm"
                      >
                        <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {plan.limitations && (
                    <>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Not included:
                      </p>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, idx) => (
                          <li
                            key={idx}
                            className="text-gray-500 dark:text-gray-400 text-sm"
                          >
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="p-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h3>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <button
                    onClick={() =>
                      setOpenFAQ(openFAQ === faq.id ? null : faq.id)
                    }
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white text-left">
                      {faq.question}
                    </h4>
                    <FiChevronDown
                      className={`w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 transition-transform ${
                        openFAQ === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFAQ === faq.id && (
                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
