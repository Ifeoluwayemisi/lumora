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

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useNavRouter();
  const { adminUser, logout, hasRole } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);

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
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white shadow-md hover:bg-gray-50"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-lg transition-transform duration-300 z-30 lg:z-0 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-gray-200">
          <Link
            href="/admin/dashboard"
            className="font-bold text-xl text-blue-600"
          >
            LUMORA
            <span className="text-xs block text-gray-500">Admin</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FiUser className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {adminUser?.firstName} {adminUser?.lastName}
              </p>
              <p className="text-xs text-gray-500">{adminUser?.role}</p>
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
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
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
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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
