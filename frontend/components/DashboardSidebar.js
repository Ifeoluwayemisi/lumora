"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  FiHome,
  FiList,
  FiStar,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiPackage,
  FiBarChart2,
  FiUsers,
} from "react-icons/fi";

export default function DashboardSidebar({ userRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const getNavItems = () => {
    const baseItems = [
      { href: "/dashboard/user", label: "Dashboard", icon: FiHome },
      { href: "/dashboard/user/history", label: "History", icon: FiList },
      {
        href: "/dashboard/user/favorites",
        label: "Favorites",
        icon: FiStar,
      },
      {
        href: "/dashboard/user/notifications",
        label: "Notifications",
        icon: FiBell,
      },
      { href: "/dashboard/user/profile", label: "Profile", icon: FiUser },
      { href: "/dashboard/user/settings", label: "Settings", icon: FiSettings },
    ];
    const manufacturerItems = [
      { href: "/dashboard/manufacturer", label: "Dashboard", icon: FiHome },
      {
        href: "/dashboard/manufacturer/products",
        label: "Products (Owns)",
        icon: FiPackage,
      },
      {
        href: "/dashboard/manufacturer/batches",
        label: "Batches",
        icon: FiBarChart2,
      },
      {
        href: "/dashboard/manufacturer/history",
        label: "Verification History",
        icon: FiList,
      },
      {
        href: "/dashboard/manufacturer/profile",
        label: "Profile",
        icon: FiUsers,
      },
    ];
    const adminItems = [
      { href: "/dashboard/admin", label: "Dashboard", icon: FiHome },
      { href: "/dashboard/admin/users", label: "Users", icon: FiUsers },
      {
        href: "/dashboard/admin/analytics",
        label: "Analytics",
        icon: FiBarChart2,
      },
      {
        href: "/dashboard/admin/settings",
        label: "Settings",
        icon: FiSettings,
      },
    ];

    if (userRole === "manufacturer") return manufacturerItems;
    if (userRole === "admin" || userRole === "nafdac") return adminItems;
    return baseItems;
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  // smarter active check: highlight if current path starts with item.href
  const isActive = (href) => pathname.startsWith(href);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-900 md:hidden border border-gray-200 dark:border-gray-800"
      >
        {isOpen ? (
          <FiX className="text-2xl" />
        ) : (
          <FiMenu className="text-2xl" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-40 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-genuine flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-xl">
              Lumora
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                  ${
                    isActive(item.href)
                      ? "bg-genuine text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                <Icon className="text-xl" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            <FiLogOut className="text-xl" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center h-16 md:hidden z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center text-sm transition ${
                isActive(item.href)
                  ? "text-genuine"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <Icon className="text-xl" />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
