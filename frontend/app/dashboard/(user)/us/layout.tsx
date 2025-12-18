"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  History,
  User,
  Settings,
  LogOut,
  QrCode,
  Menu,
  X,
} from "lucide-react";

export default function UserShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { name: "Dashboard", href: "/dashboard/us", icon: LayoutDashboard },
    {
      name: "Verify Product",
      href: "/dashboard/us/verify",
      icon: QrCode,
      notification: true,
    }, // optional badge
    { name: "Scan History", href: "/dashboard/us/history", icon: History },
    { name: "Trusted Brands", href: "/dashboard/us/brands", icon: ShieldCheck },
    { name: "Profile", href: "/dashboard/us/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex w-72 border-r border-white/5 flex-col p-8 sticky top-0 h-screen bg-black">
        <div className="mb-12">
          <Link href="/" className="flex items-center space-x-2">
            <ShieldCheck className="h-8 w-8 text-green-500" />
            <span className="text-xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
              LUMORA
            </span>
          </Link>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">
            Consumer Shield
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                  isActive
                    ? "bg-green-500 text-black shadow-lg shadow-green-500/20"
                    : "text-gray-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={20} />
                  {link.name}
                </div>
                {link.notification && (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/5">
          <button className="flex items-center gap-4 px-6 py-4 text-red-500 font-black text-xs uppercase hover:bg-red-500/5 w-full rounded-2xl transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT & MOBILE NAV --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden p-6 flex justify-between items-center border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <Link href="/" className="flex items-center space-x-2">
            <ShieldCheck className="h-8 w-8 text-green-500" />
            <span className="text-xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
              LUMORA
            </span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Slide-over Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-6 flex flex-col gap-4">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                    isActive
                      ? "bg-green-500 text-black shadow-lg shadow-green-500/20"
                      : "text-gray-500 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-4">
                    <Icon size={20} />
                    {link.name}
                  </div>
                  {link.notification && (
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                </Link>
              );
            })}
            <button
              className="mt-auto flex items-center gap-4 px-6 py-4 text-red-500 font-black text-xs uppercase hover:bg-red-500/5 w-full rounded-2xl transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}

        <main className="flex-1 pb-32 lg:pb-8">{children}</main>

        {/* MOBILE BOTTOM NAV */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-2xl border-t border-white/10 px-6 py-4 flex justify-between items-center z-40">
          {links.slice(0, 4).map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 ${
                  isActive ? "text-green-500" : "text-gray-500"
                }`}
              >
                <Icon size={20} />
                <span className="text-[9px] font-black uppercase">
                  {link.name.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
