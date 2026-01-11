"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import api from "@/services/api";
import { FiCheck, FiZap, FiMapPin } from "react-icons/fi";

/**
 * Landing Page Component
 *
 * Features:
 * - Product code verification (manual entry)
 * - Confetti animation on successful verification
 * - How-it-works section with visual steps
 * - Trust statistics
 * - Call-to-action for user registration
 * - Responsive design with dark mode support
 *
 * Note: Manual verification requires sending code to backend
 * Authenticated users get access to QR scanning and dashboard
 */
export default function LandingPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { width, height } = useWindowSize();

  // Form state
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  /**
   * Handle product code verification
   * Sends code to backend for validation
   * Shows confetti animation and redirects on success
   */
  const handleVerify = async () => {
    // Validate input
    if (!code.trim()) {
      toast.error("Please enter a product code.");
      return;
    }

    try {
      setLoading(true);

      // TODO: Use api.js interceptor instead of fetch for consistency
      // This would automatically include auth token and handle errors
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/verify/manual`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: code.trim().toUpperCase() }),
        }
      );

      const data = await res.json();

      // Check for HTTP errors
      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      // Show success feedback
      setVerified(true);
      toast.success("Product verified successfully!");

      // Wait for confetti animation to finish before redirect
      setTimeout(() => {
        router.push(`/verify/result?code=${code.trim()}`);
      }, 1500);
    } catch (err) {
      console.error("Verification error:", err);
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Enter key press for verification
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleVerify();
    }
  };

  return (
    <div className="relative bg-gray-50 dark:bg-gray-950 min-h-screen overflow-x-hidden">
      {/* Success Confetti Animation */}
      {verified && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://media.istockphoto.com/id/2163506577/photo/work-safety-and-compliance-concept-businessman-holding-magnifying-glass-with-icons-work.webp?a=1&b=1&s=612x612&w=0&k=20&c=vgtpBPSkDf4PMUhLbmk_P38rY2YYChy95NMeYD6Xoio=')`,
          }}
        ></div>

        {/* Overlay - Ensures text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 dark:from-gray-950/80 dark:via-gray-950/75 dark:to-gray-950/80"></div>

        {/* Mesh gradient accent layer */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background: `
              radial-gradient(at 20% 50%, rgba(40, 167, 69, 0.1) 0px, transparent 50%),
              radial-gradient(at 80% 80%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
              radial-gradient(at 90% 10%, rgba(20, 184, 166, 0.06) 0px, transparent 50%)
            `,
          }}
        ></div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center z-10">
          {/* Main Heading - Animated entrance */}
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-heading font-bold mb-4 text-gray-900 dark:text-gray-100"
          >
            Verify Medicines. Save Lives.
          </motion.h1>

          {/* Subheading - Describes value proposition */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl"
          >
            Lumora protects Nigerians from counterfeit drugs with instant
            verification, AI risk scoring, and geo-analysis.
          </motion.p>

          {/* Verification Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-4"
          >
            {/* Code Input Field */}
            <input
              type="text"
              placeholder="Enter product code..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={loading || verified}
              className="px-4 py-3 rounded-md border w-full sm:w-64 text-gray-900 dark:text-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-genuine disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Product code input"
            />

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading || verified}
              className="px-6 py-3 rounded-md bg-genuine text-white font-semibold hover:bg-green-600 active:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading ? "Verifying..." : verified ? "Verified!" : "Verify"}
            </button>
          </motion.div>

          {/* Registration CTA - Only show to non-authenticated users */}
          {!user && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-2 text-gray-600 dark:text-gray-400 text-sm"
            >
              Only manual verification available for unregistered users.{" "}
              <a
                href="/auth/register"
                className="underline hover:text-genuine transition-colors font-semibold"
              >
                Register
              </a>{" "}
              for dashboard, history & QR scanning.
            </motion.p>
          )}

          {/* Trust Statistics Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-10 flex flex-col sm:flex-row gap-6 justify-center text-center"
          >
            {/* Stat: Drugs Verified */}
            <div>
              <h3 className="text-2xl font-bold text-genuine">5,000+</h3>
              <p className="text-gray-600 dark:text-gray-300">Drugs Verified</p>
            </div>

            {/* Stat: Trusted Pharmacies */}
            <div>
              <h3 className="text-2xl font-bold text-genuine">1,200+</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Trusted Pharmacies
              </p>
            </div>

            {/* Stat: Security */}
            <div>
              <h3 className="text-2xl font-bold text-genuine">100%</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Secure & Reliable
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how"
        className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-12 text-center"
      >
        {/* Feature cards with animation */}
        {[
          {
            icon: <FiCheck className="h-16 w-16 text-genuine" />,
            title: "Scan or Enter Code",
            desc: "Instantly verify any medicine by scanning its QR code or entering the product code.",
          },
          {
            icon: <FiZap className="h-16 w-16 text-genuine" />,
            title: "AI Risk Scoring",
            desc: "Our AI engine analyzes the product and flags potential counterfeit risks.",
          },
          {
            icon: <FiMapPin className="h-16 w-16 text-genuine" />,
            title: "Geo Analysis",
            desc: "See where your medicine was manufactured and distributed for safer decisions.",
          },
        ].map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: idx * 0.2 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow"
          >
            {/* Step Icon */}
            <div className="mx-auto mb-4 flex justify-center">{step.icon}</div>

            {/* Step Title */}
            <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
              {step.title}
            </h4>

            {/* Step Description */}
            <p className="text-gray-600 dark:text-gray-300">{step.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* About Section */}
      <section
        id="about"
        className="w-full py-20 px-6 sm:px-12 bg-gray-50 dark:bg-gray-900"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              About Lumora
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Lumora is a blockchain-based pharmaceutical verification platform
              dedicated to combating counterfeit medicines and protecting public
              health. We empower patients, pharmacies, and regulators with
              transparency and trust.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Our Mission",
                desc: "To eliminate counterfeit pharmaceuticals through innovative verification technology and create a safer global healthcare ecosystem.",
              },
              {
                title: "Our Vision",
                desc: "A world where every medicine can be verified, every patient is protected, and every pharmacy is trusted.",
              },
              {
                title: "Our Commitment",
                desc: "We partner with manufacturers, regulators, and healthcare providers to build a transparent supply chain.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="w-full py-20 px-6 sm:px-12 bg-gray-50 dark:bg-gray-900"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Contact us for
              partnerships, support, or inquiries.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info + Direct Channels */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Support Email
                </h3>
                <a
                  href="mailto:support@lumora.health"
                  className="text-lg text-genuine hover:text-opacity-80 transition-colors font-medium"
                >
                  support@lumora.health
                </a>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Partnerships & Sponsorships
                </h3>
                <a
                  href="mailto:partners@lumora.health"
                  className="text-lg text-genuine hover:text-opacity-80 transition-colors font-medium"
                >
                  partners@lumora.health
                </a>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Location
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  🇳🇬 Nigeria | Serving Africa & Beyond
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <form className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-genuine transition-all"
                  aria-label="Name"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-genuine transition-all"
                  aria-label="Email"
                />
                <textarea
                  placeholder="Message (tell us how we can help)"
                  rows="5"
                  className="p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-genuine transition-all resize-none"
                  aria-label="Message"
                ></textarea>
                <button
                  type="submit"
                  className="px-6 py-3 bg-genuine text-white rounded-md font-semibold hover:bg-green-600 active:bg-green-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
