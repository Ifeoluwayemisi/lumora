"use client";
import {
  BarChart4,
  FileCheck,
  Package,
  Search,
  Map,
  PieChart,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";

const menu = [
  { name: "Dashboard", icon: BarChart4, path: "/dashboard/ad/" },
  {
    name: "Manufacturers",
    icon: FileCheck,
    path: "/dashboard/ad/manufacturers",
  },
  { name: "Products", icon: Package, path: "/dashboard/ad/products" },
  { name: "Verifications", icon: Search, path: "/dashboard/ad/verifications" },
  { name: "Hotspots", icon: Map, path: "/dashboard/ad/hotspot" },
  { name: "Analytics", icon: PieChart, path: "/dashboard/ad/analytics" },
  { name: "Settings", icon: Settings, path: "/dashboard/ad/settings" },
];

export default function AdminSidebar({ pendingCount = 0 }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = useCallback(() => setCollapsed((prev) => !prev), []);
  const handleLogout = useCallback(() => {
    // Add your logout logic here
    console.log("Logging out...");
  }, []);

  const isActive = (path) => pathname === path;

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-72"
      } bg-[#050505] border-r border-white/5 flex flex-col h-screen p-6 transition-all duration-300`}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-green-500" size={32} />
          {!collapsed && (
            <span className="text-xl font-black italic tracking-tighter">
              LUMORA
            </span>
          )}
        </div>
        <button
          onClick={handleToggle}
          aria-label="Toggle sidebar"
          aria-expanded={!collapsed}
          className="text-gray-500 hover:text-green-500 transition"
        >
          <ChevronLeft
            size={20}
            className={`transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menu.map((item) => {
          const active = isActive(item.path);
          const badge = item.name === "Manufacturers" ? pendingCount : null;

          return (
            <Link
              key={item.name}
              href={item.path}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${
                active
                  ? "bg-green-600/20 text-green-500 font-bold"
                  : "text-gray-500 hover:text-green-500 hover:bg-green-600/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={20}
                  className={`transition-colors group-hover:text-green-500 ${
                    active ? "text-green-500" : ""
                  }`}
                />
                {!collapsed && (
                  <span className="font-bold text-sm">{item.name}</span>
                )}
              </div>
              {!collapsed && badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Logout"
        className="flex items-center gap-3 px-4 py-4 text-red-500/60 hover:text-red-500 transition mt-auto font-bold text-sm"
      >
        <LogOut size={20} /> {!collapsed && "Logout"}
      </button>
    </aside>
  );
}
