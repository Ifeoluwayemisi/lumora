"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import {
  FiHome,
  FiList,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiActivity,
  FiFileText,
  FiShoppingBag,
  FiBarChart2,
} from "react-icons/fi";
import { useState } from "react";
import { useRouter as useNavRouter } from "next/navigation";

export default function AdminSidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const router = useNavRouter();
  const { adminUser, logout, hasRole } = useAdmin();

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  // Menu items based on role
  const getMenuItems = () => {
    const baseItems = [
      { href: "/admin/dashboard", label: "Dashboard", icon: FiHome },
      { href: "/admin/reports", label: "Reports", icon: FiBell },
      { href: "/admin/cases", label: "Cases", icon: FiFileText },
    ];

    // Moderators and Super Admins can review manufacturers
    if (hasRole("MODERATOR") || hasRole("SUPER_ADMIN")) {
      baseItems.push({
        href: "/admin/manufacturers",
        label: "Manufacturers",
        icon: FiShoppingBag,
      });
    }

    // Super Admins can view audit logs and manage users
    if (hasRole("SUPER_ADMIN")) {
      baseItems.push(
        {
          href: "/admin/audit-logs",
          label: "Audit Logs",
          icon: FiActivity,
        },
        {
          href: "/admin/users",
          label: "User Management",
          icon: FiList,
        },
      );
    }

    // Moderators and Super Admins can monitor AI
    if (hasRole("MODERATOR") || hasRole("SUPER_ADMIN")) {
      baseItems.push({
        href: "/admin/oversight",
        label: "AI Oversight",
        icon: FiBarChart2,
      });
    }

    // All authenticated users can access profile and settings
    baseItems.push(
      { href: "/admin/profile", label: "Profile", icon: FiUser },
      { href: "/admin/settings", label: "Settings", icon: FiSettings },
    );

    return baseItems;
  };

  const menuItems = getMenuItems();
  const isActive = (href) => pathname === href;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-20"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 z-30 lg:z-0 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
          <Link
            href="/admin/dashboard"
            className="font-bold text-xl text-blue-600 dark:text-blue-400 text-center"
          >
            LUMORA
            <span className="text-xs block text-gray-500 dark:text-gray-400">Admin</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiUser className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {adminUser?.firstName} {adminUser?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{adminUser?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <FiLogOut size={20} />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
