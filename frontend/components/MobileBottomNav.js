"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiCheck,
  FiClock,
  FiUser,
  FiHome,
  FiPackage,
  FiTrendingUp,
  FiBell,
} from "react-icons/fi";

export default function MobileBottomNav({ userRole }) {
  const pathname = usePathname();

  const getNavItems = () => {
    if (userRole === "manufacturer") {
      return [
        { href: "/dashboard/manufacturer", label: "Home", icon: FiHome },
        {
          href: "/dashboard/manufacturer/products",
          label: "Products",
          icon: FiPackage,
        },
        {
          href: "/dashboard/manufacturer/analytics",
          label: "Analytics",
          icon: FiTrendingUp,
        },
        {
          href: "/dashboard/manufacturer/notifications",
          label: "Alerts",
          icon: FiBell,
        },
        {
          href: "/dashboard/manufacturer/profile",
          label: "Profile",
          icon: FiUser,
        },
      ];
    }

    return [
      { href: "/verify", label: "Verify", icon: FiCheck },
      { href: "/dashboard/user", label: "History", icon: FiClock },
      { href: "/dashboard/user/profile", label: "Profile", icon: FiUser },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 gap-1 border-t-2 transition ${
                isActive
                  ? "border-genuine text-genuine"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="text-xl" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
