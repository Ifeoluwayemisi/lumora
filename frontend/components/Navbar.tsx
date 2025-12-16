"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ShieldCheck className="h-8 w-8 text-green-500" />
            <span className="text-xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
              LUMORA
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#how-it-works"
              className="text-gray-300 hover:text-white transition"
            >
              How it Works
            </Link>
            <Link
              href="/contact"
              className="text-gray-300 hover:text-white transition"
            >
              Contact
            </Link>
            <Link
              href="/auth/login"
              className="text-gray-300 hover:text-white transition"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-full font-medium shadow-[0_0_15px_rgba(34,197,94,0.3)] transition"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/90 border-b border-white/10 p-4 space-y-4 text-center">
          <Link href="/contact" className="block text-gray-300">
            Contact
          </Link>
          <Link href="/auth/login" className="block text-gray-300">
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="block bg-green-600 text-white py-2 rounded-lg"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
