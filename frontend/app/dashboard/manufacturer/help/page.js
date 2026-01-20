"use client";
import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Link from "next/link";
import {
  FiArrowLeft,
  FiSearch,
  FiChevronDown,
  FiMessageSquare,
  FiBook,
  FiHelpCircle,
} from "react-icons/fi";

/**
 * Help & Support Center
 *
 * Features:
 * - FAQ section
 * - Documentation links
 * - Video tutorials
 * - Contact support form
 * - Common issues & solutions
 */

const FAQData = [
  {
    category: "Getting Started",
    items: [
      {
        question: "How do I generate product codes?",
        answer:
          "Navigate to Products → Create Batch. Upload your product details and select the number of codes you need. The system will generate unique QR codes and CSV export files automatically. Each code is linked to your product and batch for tracking.",
      },
      {
        question: "What is my daily code generation quota?",
        answer:
          "Your quota depends on your subscription plan. Basic plan: 50 codes/day, Premium: Unlimited. Check your dashboard for current usage. You can upgrade your plan from Settings → Billing.",
      },
      {
        question: "How do I download generated codes?",
        answer:
          "In Batch Details, click the PDF button to download a printable PDF with QR codes (3x4 grid on A4), or CSV for data exports. The PDF is optimized for sticker printing.",
      },
    ],
  },
  {
    category: "QR Codes & Verification",
    items: [
      {
        question: "Can customers scan the QR codes?",
        answer:
          "Yes! Your customers can scan the QR codes with any smartphone camera or QR code reader. They'll be directed to verify the product authenticity through the verification page.",
      },
      {
        question: "What happens when a code is scanned?",
        answer:
          "When scanned, the system records the verification event with timestamp and location (if enabled). You'll see this in History. The system checks if the code is genuine and flagged for counterfeits.",
      },
      {
        question: "How do I flag a code as counterfeit?",
        answer:
          "Go to Code Management, find the code, click Flag button. Provide the reason (e.g., 'Found counterfeit product'). The code is marked as FLAGGED and you can track all suspicious codes in History.",
      },
    ],
  },
  {
    category: "Analytics & Reporting",
    items: [
      {
        question: "What data can I export?",
        answer:
          "You can export: Revenue reports, Verification events, Product analytics, Hotspot data (geographic regions with high verification activity). All exports are available as CSV for spreadsheet analysis.",
      },
      {
        question: "How do I access verification hotspots?",
        answer:
          "Go to Analytics → Hotspots. You'll see a map showing where your codes are most frequently verified. This helps identify popular markets and potential distribution issues.",
      },
      {
        question: "Can I view real-time analytics?",
        answer:
          "Yes! The dashboard updates in real-time as codes are verified. You can see live scan counts, geographic distribution, and flagged codes as they happen.",
      },
    ],
  },
  {
    category: "Team & Collaboration",
    items: [
      {
        question: "How do I add team members?",
        answer:
          "Go to Team → Send Invite. Enter their email and select their role (Viewer, Editor, Admin). They'll receive an email invitation. Viewer can only view data, Editor can manage codes, Admin has full access.",
      },
      {
        question: "Can I change a team member's role?",
        answer:
          "Yes, in Team section, click on the member and select 'Change Role'. You can upgrade or downgrade their permissions at any time.",
      },
      {
        question: "How do I remove a team member?",
        answer:
          "In Team section, click the delete icon next to their name. They'll lose access immediately. Their actions remain in the audit log for compliance.",
      },
    ],
  },
  {
    category: "Billing & Plans",
    items: [
      {
        question: "What's included in the Premium plan?",
        answer:
          "Premium includes: Unlimited code generation, Advanced analytics with hotspots, Priority support, Unlimited team members, Custom branding, Webhook integration, and API access.",
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer:
          "Yes, you can cancel from Billing → Manage Subscription. Your access continues until the end of your billing period. No refunds for unused days in current period.",
      },
      {
        question: "Is there a free trial?",
        answer:
          "Yes! The Basic plan is free forever. It includes 50 codes per day, basic analytics, and email support. Upgrade to Premium anytime.",
      },
    ],
  },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(0);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const filteredFAQ = FAQData.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <>
      <DashboardSidebar userRole="manufacturer" />
      <MobileBottomNav userRole="manufacturer" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 pt-12 md:pt-16">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/manufacturer"
              className="text-green-600 hover:text-green-700 font-medium mb-4 inline-flex items-center gap-2"
            >
              <FiArrowLeft /> Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Help & Support
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find answers to common questions and get support
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <a
              href="https://docs.lumora.app"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <FiBook className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Documentation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Read full documentation
              </p>
            </a>

            <a
              href="https://youtube.com/@lumora"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <FiMessageSquare className="w-8 h-8 text-red-600 dark:text-red-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Video Tutorials
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Learn with video guides
              </p>
            </a>

            <a
              href="mailto:support@lumora.app"
              className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <FiHelpCircle className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Contact Support
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email support@lumora.app
              </p>
            </a>
          </div>

          {/* Search FAQ */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-4">
            {filteredFAQ.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  No results found for "{searchTerm}". Try different search
                  terms.
                </p>
              </div>
            ) : (
              filteredFAQ.map((category, catIndex) => (
                <div
                  key={catIndex}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === catIndex ? -1 : catIndex,
                      )
                    }
                    className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.category}
                    </h2>
                    <FiChevronDown
                      className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                        expandedCategory === catIndex ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expandedCategory === catIndex && (
                    <div className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="px-6 py-4">
                          <button
                            onClick={() =>
                              setExpandedQuestion(
                                expandedQuestion === `${catIndex}-${itemIndex}`
                                  ? null
                                  : `${catIndex}-${itemIndex}`,
                              )
                            }
                            className="w-full flex justify-between items-start text-left hover:opacity-75 transition-opacity"
                          >
                            <p className="font-medium text-gray-900 dark:text-white pr-4">
                              {item.question}
                            </p>
                            <FiChevronDown
                              className={`w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 transition-transform ${
                                expandedQuestion === `${catIndex}-${itemIndex}`
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>

                          {expandedQuestion === `${catIndex}-${itemIndex}` && (
                            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                              {item.answer}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Support Card */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Still need help?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our support team is available 24/7 to help you with any questions
              or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:support@lumora.app"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-center"
              >
                Email Support
              </a>
              <a
                href="https://discord.gg/lumora"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center"
              >
                Join Discord Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
