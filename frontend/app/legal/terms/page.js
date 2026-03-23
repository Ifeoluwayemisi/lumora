"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function TermsPage() {
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
            Terms & Conditions
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
              1. Agreement to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing and using Lumora ("Service"), you accept and agree to
              be bound by the terms and provision of this agreement. If you do
              not agree to abide by the above, please do not use this service.
              Lumora reserves the right to update and change the Terms &
              Conditions from time to time without notice.
            </p>
          </section>

          {/* Use License */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Use License
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the
              materials (information or software) on Lumora for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Modifying or copying the materials</li>
              <li>
                Using the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                Attempting to decompile or reverse engineer any software
                contained on the Service
              </li>
              <li>
                Removing any copyright or other proprietary notations from the
                materials
              </li>
              <li>
                Transferring the materials to another person or "mirroring" the
                materials on any other server
              </li>
              <li>Violating any applicable laws or regulations</li>
              <li>
                Accessing or searching the Service by any means other than our
                publicly supported interfaces
              </li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Disclaimer
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The materials on Lumora are provided "as is". Lumora makes no
              warranties, expressed or implied, and hereby disclaims and negates
              all other warranties including, without limitation, implied
              warranties or conditions of merchantability, fitness for a
              particular purpose, or non-infringement of intellectual property
              or other violation of rights.
            </p>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Limitations
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              In no event shall Lumora or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on Lumora, even if Lumora or an
              authorized representative has been notified orally or in writing
              of the possibility of such damage.
            </p>
          </section>

          {/* Accuracy of Materials */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Accuracy of Materials
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The materials appearing on Lumora could include technical,
              typographical, or photographic errors. Lumora does not warrant
              that any of the materials on the Service are accurate, complete,
              or current. Lumora may make changes to the materials contained on
              the Service at any time without notice.
            </p>
          </section>

          {/* Materials and Content */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Materials and Content
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By submitting materials to Lumora (including but not limited to
              product information, verification documents, and product codes),
              you grant Lumora a worldwide, non-exclusive, royalty-free license
              to use, reproduce, modify, and distribute such materials. You
              represent and warrant that you own or have the necessary right to
              the materials you submit.
            </p>
          </section>

          {/* Links */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Links
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Lumora has not reviewed all of the sites linked to its website and
              is not responsible for the contents of any such linked site. The
              inclusion of any link does not imply endorsement by Lumora of the
              site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Modifications
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Lumora may revise these terms of service for the Service at any
              time without notice. By using this Service, you are agreeing to be
              bound by the then current version of these terms of service.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Governing Law
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These terms and conditions are governed by and construed in
              accordance with the laws of the jurisdiction in which Lumora
              operates, and you irrevocably submit to the exclusive jurisdiction
              of the courts in that location.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Questions?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions about our Terms & Conditions, please
              contact us at{" "}
              <a
                href="mailto:legal@lumora.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                legal@lumora.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
