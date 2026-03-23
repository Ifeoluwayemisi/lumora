"use client";

import Link from "next/link";
import { FiArrowLeft, FiFileText, FiShield } from "react-icons/fi";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Legal Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Read our terms, privacy policy, and other important legal
            information
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Terms & Conditions Card */}
          <Link href="/legal/terms">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 dark:border-gray-700 cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <FiFileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Terms & Conditions
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Read our terms of service and user agreement. Understand
                    your rights and responsibilities when using Lumora.
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mt-4 flex items-center gap-1">
                    Read more →
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Privacy Policy Card */}
          <Link href="/legal/privacy">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 dark:border-gray-700 cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <FiShield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    Privacy Policy
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Learn how we collect, use, and protect your personal data.
                    Understand your privacy rights and our data practices.
                  </p>
                  <p className="text-green-600 dark:text-green-400 font-semibold text-sm mt-4 flex items-center gap-1">
                    Read more →
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 border border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need Help?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            If you have any questions about our legal documents, policies, or
            how we handle your data, please don't hesitate to reach out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:legal@lumora.com"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-center"
            >
              Contact Legal Team
            </a>
            <a
              href="mailto:privacy@lumora.com"
              className="px-6 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
            >
              Privacy Concerns
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
