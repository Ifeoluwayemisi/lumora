"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FiHome, FiAlertCircle, FiFileText, FiSettings, FiLogOut, FiMenu, FiX } from "react-icons/fi";

export default function NAFDACLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/nafdac", icon: FiHome },
    { label: "Cases", href: "/nafdac/cases", icon: FiFileText },
    { label: "Alerts", href: "/nafdac/alerts", icon: FiAlertCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 dark:bg-blue-950 text-white transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-2xl font-bold">NAFDAC</h1>
          <p className="text-sm text-blue-200">Regulatory Dashboard</p>
        </div>

        {/* Nav Items */}
        <nav className="p-4 space-y-2">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href}>
              <a
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  pathname === href
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-800"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {label}
              </a>
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-b border-blue-800 my-4" />

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 w-full rounded-lg text-blue-100 hover:bg-red-900 transition-colors"
          >
            <FiLogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between md:hidden">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">NAFDAC</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
