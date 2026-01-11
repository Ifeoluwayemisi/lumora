"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Layout Content Component
 *
 * Client component to conditionally show/hide navbar and footer
 * Auth pages (/auth/*) don't show navbar/footer for cleaner UX
 */
export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <>
      {/* Fixed navigation header - hidden on auth pages */}
      {!isAuthPage && <Navbar />}

      {/* Main content area - pt-16 accounts for fixed navbar height (only when navbar shown) */}
      <main className={isAuthPage ? "min-h-screen" : "min-h-screen pt-16"}>
        {children}
      </main>

      {/* Application footer - hidden on auth pages */}
      {!isAuthPage && <Footer />}
    </>
  );
}
