// components/Dashboard/Sidebar.tsx
"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  BarChart3,
  Settings,
  User,
  LogOut,
  ShieldCheck,
  Clock,
  CheckCircle,
} from "lucide-react";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, path: "/dashboard/manufacturer" },
  { name: "Products", icon: Package, path: "/dashboard/manufacturer/products" },
  { name: "Batches", icon: Layers, path: "/dashboard/manufacturer/batches" },
  {
    name: "Analytics",
    icon: BarChart3,
    path: "/dashboard/manufacturer/analytics",
  },
];

export default function Sidebar({
  status = "PENDING",
}: {
  status?: "PENDING" | "VERIFIED" | "REJECTED";
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col h-screen sticky top-0">
      {/* Logo + Status */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="text-green-500" size={32} />
          <span className="text-xl font-bold tracking-tighter text-white">
            LUMORA
          </span>
        </div>

        {/* Account Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
            status === "PENDING"
              ? "bg-amber-500/5 border-amber-500/20 text-amber-500"
              : status === "VERIFIED"
              ? "bg-green-500/5 border-green-500/20 text-green-500"
              : "bg-red-500/5 border-red-500/20 text-red-500"
          }`}
        >
          {status === "PENDING" ? (
            <Clock size={14} className="animate-pulse" />
          ) : (
            <CheckCircle size={14} />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {status} Account
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const disabled = status === "PENDING" && item.name === "Analytics"; // Example: lock certain items if pending

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? "bg-green-600 text-white shadow-lg shadow-green-900/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              } ${disabled ? "opacity-40 pointer-events-none" : ""}`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/dashboard/manufacturer/profile"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition"
        >
          <User size={20} /> Profile
        </Link>
        <Link
          href="/dashboard/manufacturer/settings"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition"
        >
          <Settings size={20} /> Settings
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}
