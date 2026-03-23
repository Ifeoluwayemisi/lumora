"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Last updated: March 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Lumora ("we", "us", "our" or "Company") operates the Lumora
              service. This page informs you of our policies regarding the
              collection, use, and disclosure of personal data when you use our
              Service and the choices you have associated with that data.
            </p>
          </section>

          {/* Information Collection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Information Collection and Use
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We collect several different types of information for various
              purposes to provide and improve our Service to you.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Types of Data Collected:
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                  •
                </span>
                <span>
                  <strong>Personal Data:</strong> Name, email address, phone
                  number, company information, and identification documents
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                  •
                </span>
                <span>
                  <strong>Product Data:</strong> Product information, batch
                  numbers, QR codes, and verification status
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                  •
                </span>
                <span>
                  <strong>Usage Data:</strong> IP address, browser type, pages
                  visited, time spent, and referrer information
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                  •
                </span>
                <span>
                  <strong>Device Data:</strong> Device type, operating system,
                  and device settings
                </span>
              </li>
            </ul>
          </section>

          {/* Use of Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Use of Data
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Lumora uses the collected data for various purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>To provide, maintain, and improve our Service</li>
              <li>To verify product authenticity and detect counterfeits</li>
              <li>To notify you about changes to our Service</li>
              <li>
                To allow you to participate in interactive features of our
                Service
              </li>
              <li>To provide customer care and support</li>
              <li>
                To gather analysis or valuable information so that we can
                improve our Service
              </li>
              <li>To monitor the usage of our Service</li>
              <li>
                To detect, prevent, and address technical and security issues
              </li>
              <li>
                To comply with legal obligations and regulatory requirements
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The security of your data is important to us but remember that no
              method of transmission over the Internet or method of electronic
              storage is 100% secure. While we strive to use commercially
              acceptable means to protect your personal data, we cannot
              guarantee its absolute security. We implement industry-standard
              security measures including encryption, secure data storage, and
              regular security audits.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Disclosure of Data
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We may disclose your information in the following situations:
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                  •
                </span>
                <span>
                  <strong>With NAFDAC:</strong> Product verification data to
                  regulatory authorities
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                  •
                </span>
                <span>
                  <strong>With Service Providers:</strong> Third parties who
                  assist us in operating our website and Service
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                  •
                </span>
                <span>
                  <strong>By Law:</strong> Where required by law or legal
                  process
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                  •
                </span>
                <span>
                  <strong>To Protect Rights:</strong> To enforce our agreements
                  and protect the rights and safety of our users
                </span>
              </li>
            </ul>
          </section>

          {/* Retention of Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Retention of Data
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Lumora will retain your Personal Data only for as long as
              necessary for the purposes set out in this Privacy Policy. We will
              retain and use your Personal Data to the extent necessary to
              comply with our legal obligations.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Your Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>The right to access your data</li>
              <li>The right to correct inaccurate data</li>
              <li>The right to request deletion of your data</li>
              <li>The right to restrict processing of your data</li>
              <li>The right to data portability</li>
              <li>The right to opt-out of marketing communications</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We use cookies and similar tracking technologies to track activity
              on our Service and hold certain information. You can instruct your
              browser to refuse all cookies or to indicate when a cookie is
              being sent. However, if you do not accept cookies, you may not be
              able to use some portions of our Service.
            </p>
          </section>

          {/* Third Party Links */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Third-Party Links
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our Service may contain links to other websites that are not
              operated by us. This Privacy Policy applies only to our Service,
              and we are not responsible for the privacy practices of
              third-party websites. We encourage you to review the Privacy
              Policy of any third-party service before providing your
              information.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our Service does not address anyone under the age of 18. We do not
              knowingly collect personally identifiable information from
              children under 18. If we become aware that we have collected
              personal data from a child under 18 without verification of
              parental consent, we take steps to remove such information and
              terminate the child's account.
            </p>
          </section>

          {/* Policy Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "effective date" at the top of this Privacy
              Policy. You are advised to review this Privacy Policy periodically
              for any changes.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:privacy@lumora.com"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  privacy@lumora.com
                </a>
              </p>
              <p>
                <strong>Address:</strong> Lumora Compliance Office, Nigeria
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
