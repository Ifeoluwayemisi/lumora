"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/", section: "hero" },
  { name: "How it Works", href: "/how-it-works", section: "how-it-works" },
  { name: "Contact", href: "/contact", section: "contact" },
  { name: "Login", href: "/auth/login" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Active route highlight
  useEffect(() => {
    const index = navLinks.findIndex((l) => l.href === pathname);
    setActiveIndex(index >= 0 ? index : null);
  }, [pathname]);

  // Scroll section highlight (landing page)
  useEffect(() => {
    if (pathname !== "/") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = navLinks.findIndex(
              (l) => l.section === entry.target.id
            );
            if (index !== -1) setActiveIndex(index);
          }
        });
      },
      { threshold: 0.6 }
    );

    navLinks.forEach((link) => {
      if (!link.section) return;
      const el = document.getElementById(link.section);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="text-green-500" />
          <span className="font-black tracking-tight">LUMORA</span>
        </Link>

        {/* Desktop Nav */}
        <div
          ref={navRef}
          className="relative hidden md:flex items-center gap-10"
        >
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                activeIndex === i
                  ? "text-green-500"
                  : "text-gray-300 hover:text-green-200"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Sliding Indicator */}
          {activeIndex !== null && (
            <span
              className="absolute -bottom-4 h-[2px] bg-green-500 transition-all duration-300"
              style={{
                width: (navRef.current?.children[activeIndex] as HTMLElement)
                  ?.clientWidth,
                left:
                  (navRef.current?.children[activeIndex] as HTMLElement)
                    ?.offsetLeft ?? 0,
              }}
            />
          )}

          <Link
            href="/auth/signup"
            className="ml-6 bg-green-600 hover:bg-green-500 text-black px-5 py-2 rounded-full font-bold transition"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden text-gray-300"
        >
          <Menu />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-black z-50 transform transition-transform duration-300 md:hidden
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
          <span className="font-black tracking-tight">MENU</span>
          <button onClick={() => setIsOpen(false)}>
            <X className="text-gray-300" />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="px-6 py-8 space-y-2">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-4 rounded-xl font-bold transition ${
                activeIndex === i
                  ? "bg-green-500/10 text-green-500 border-l-4 border-green-500"
                  : "text-gray-300 hover:bg-white/5 hover:text-green-200"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <Link
            href="/auth/signup"
            className="block mt-6 bg-green-600 hover:bg-green-500 text-black py-4 rounded-xl text-center font-black transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
