/**
 * Footer Component
 *
 * Displays company information, navigation links, and legal information
 * Responsive layout: 4 columns on desktop, stacked on mobile
 *
 * Sections:
 * - Company branding and mission
 * - Call-to-action for user involvement
 * - Company information links
 * - Legal documentation links
 */
export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-6 text-sm">
        {/* Lumora branding section */}
        <div>
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Lumora
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Fighting counterfeit products with technology, data, and people.
          </p>
        </div>

        {/* Get Involved - CTA section */}
        <div>
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Get Involved
          </h4>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>
              <a href="#" className="hover:text-genuine transition-colors">
                Support the fight
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-genuine transition-colors">
                Partner with us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-genuine transition-colors">
                Suggestions
              </a>
            </li>
          </ul>
        </div>

        {/* Company Info section */}
        <div>
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Company
          </h4>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>
              <a href="#" className="hover:text-genuine transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-genuine transition-colors">
                How it Works
              </a>
            </li>
          </ul>
        </div>

        {/* Legal section */}
        <div>
          <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Legal
          </h4>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>
              <a href="#" className="hover:text-genuine transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-genuine transition-colors">
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright section */}
      <div className="border-t px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Lumora. All rights reserved.</p>
        <div className="flex justify-center mt-4 gap-4">
          <a href="#" className="hover:text-genuine">
            Twitter
          </a>
          <a href="#" className="hover:text-genuine">
            LinkedIn
          </a>
          <a href="#" className="hover:text-genuine">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
