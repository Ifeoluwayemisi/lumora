"use client";

import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "next-themes";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Navbar Component
 *
 * Features:
 * - Responsive navigation with mobile menu toggle
 * - Theme switching (light/dark mode)
 * - Active section indicator with IntersectionObserver
 * - Authentication state display
 * - Smooth animations using Framer Motion
 */
export default function Navbar() {
  const { user, logout, isHydrated } = useContext(AuthContext);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("verify");
  const [mounted, setMounted] = useState(false);

  const navLinks = [
    { name: "How it Works", href: "#how" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  /**
   * IntersectionObserver to detect which section is currently in view
   * Updates activeSection state for styling active nav links
   */
  useEffect(() => {
    setMounted(true);

    const sections = navLinks
      .map((link) => document.querySelector(link.href))
      .filter(Boolean); // Filter out null values

    if (sections.length === 0) return; // Safeguard if sections don't exist

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => sections.forEach((sec) => observer.unobserve(sec));
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-white/80 dark:bg-gray-950/80 border-b">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - Brand Identity */}
        <Link
          href="/"
          className="font-heading text-xl font-bold text-genuine hover:text-green-300 transition-colors relative h-8 w-32 flex items-center"
        >
          Lumora
          {/* <Image
            src="/logo2.png"
            alt="Lumora Logo"
            fill
            className="object-contain"
            priority
          /> */}
        </Link>

        {/* Desktop Navigation Links - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.name}
                href={link.href}
                className={`
                  transition-colors duration-200 
                  ${
                    isActive
                      ? "text-green-800 font-semibold" // Deep green for active state
                      : "text-gray-700 dark:text-gray-300 hover:text-green-500" // Light green hover
                  }
                `}
              >
                {link.name}
              </a>
            );
          })}
        </div>

        {/* Right section: Theme toggle, Auth actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="text-sm border px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
            title="Toggle dark/light mode"
          >
            {resolvedTheme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Conditional rendering based on auth state - Only show when hydrated to prevent mismatch */}
          {mounted && isHydrated && user ? (
            <>
              <Link
                href="/dashboard/user"
                className="hidden md:inline text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-red-500 hover:text-red-700 transition-colors font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register/select-role"
                className="font-semibold text-gray-700 dark:text-gray-300 hover:text-green-500 transition-colors"
              >
                Register
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle Button - Only visible on mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-2xl p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu - Animated with Framer Motion */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-gray-950 border-t overflow-hidden"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`
                    block px-4 py-3 border-b transition-colors duration-200
                    ${
                      isActive
                        ? "text-green-800 font-semibold bg-gray-100 dark:bg-gray-900"
                        : "text-gray-700 dark:text-gray-300 hover:text-green-500"
                    }
                  `}
                >
                  {link.name}
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
