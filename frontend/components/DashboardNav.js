"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/dashboard/user", icon: "🏠" },
    { name: "Verify", href: "/dashboard/user/verify", icon: "🔍" },
    { name: "History", href: "/dashboard/user/history", icon: "📜" },
    { name: "Favorites", href: "/dashboard/user/favorites", icon: "⭐" },
    {
      name: "Notifications",
      href: "/dashboard/user/notifications",
      icon: "🔔",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-t flex justify-around p-2 md:hidden">
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className={`flex flex-col items-center text-sm ${
            pathname === link.href
              ? "text-genuine font-bold"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <span>{link.icon}</span>
          <span>{link.name}</span>
        </Link>
      ))}
    </nav>
  );
}
