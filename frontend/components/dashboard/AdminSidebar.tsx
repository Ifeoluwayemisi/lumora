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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar({ pendingCount = 0 }) {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", icon: BarChart4, path: "/dashboard/ad/" },
    {
      name: "Manufacturers",
      icon: FileCheck,
      path: "/dashboard/ad/manufacturers",
      badge: pendingCount,
    },
    { name: "Products", icon: Package, path: "/dashboard/ad/products" },
    {
      name: "Verifications",
      icon: Search,
      path: "/dashboard/ad/verifications",
    },
    { name: "Hotspots", icon: Map, path: "/dashboard/ad/hotspot" },
    { name: "Analytics", icon: PieChart, path: "/dashboard/ad/analytics" },
    { name: "Settings", icon: Settings, path: "/dashboard/ad/settings" },
  ];

  return (
    <aside className="w-72 bg-[#050505] border-r border-white/5 flex flex-col h-screen p-6">
      <div className="flex items-center gap-3 mb-10">
        <ShieldCheck className="text-green-500" size={32} />
        <span className="text-xl font-black italic tracking-tighter">
          LUMORA
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${
              pathname === item.path
                ? "bg-white/10 text-white"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span className="font-bold text-sm">{item.name}</span>
            </div>
            {item.badge > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <button className="flex items-center gap-3 px-4 py-4 text-red-500/60 hover:text-red-500 transition mt-auto font-bold text-sm">
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
}
