/**
 * Root Layout Component
 *
 * This is the main layout wrapper for the entire application
 *
 * Structure:
 * - Providers: Context providers (Theme, Auth)
 * - Navbar: Fixed navigation header
 * - Main: Page content area with padding for navbar
 * - Footer: Application footer
 *
 * Metadata: SEO configuration for the application
 */
import "./globals.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Providers from "./providers";

// SEO Metadata for the application
export const metadata = {
  title: "LUMORA | Verify. Protect. Save Lives",
  description:
    "Fighting counterfeit products with real-time verification and AI insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Providers: Theme & Auth context */}
        <Providers>
          {/* Fixed navigation header */}
          <Navbar />

          {/* Main content area - pt-16 accounts for fixed navbar height */}
          <main className="min-h-screen pt-16">{children}</main>

          {/* Application footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
