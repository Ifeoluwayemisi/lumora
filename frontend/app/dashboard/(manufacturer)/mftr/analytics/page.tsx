"use client";
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, MapPin, Globe, Download } from "lucide-react";
import Sidebar from "@/components/Dashboard/Sidebar"; // import your sidebar

const scanHistory = [
  {
    time: "10:45 AM",
    location: "Oshodi Market, Lagos",
    status: "REUSED",
    product: "Glow Serum",
  },
  {
    time: "10:42 AM",
    location: "Onitsha Main Market",
    status: "GENUINE",
    product: "Healing Balm",
  },
  {
    time: "10:30 AM",
    location: "Wuse II, Abuja",
    status: "GENUINE",
    product: "Glow Serum",
  },
  {
    time: "10:15 AM",
    location: "Kano Central",
    status: "INVALID",
    product: "Unknown",
  },
];

export default function ManufacturerAnalytics() {
  const accountStatus: "PENDING" | "VERIFIED" | "REJECTED" = "VERIFIED";

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <Sidebar status={accountStatus} />

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Security Intelligence</h1>
            <p className="text-gray-400">
              Deep-dive into product verification patterns and fraud attempts.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition">
            <Download size={18} /> Export Data (JSON/CSV)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Live Scan Feed */}
          <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Globe className="text-blue-400" size={20} /> Live Scans
            </h3>
            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {scanHistory.map((scan, i) => (
                <div
                  key={i}
                  className="p-3 bg-black/40 rounded-xl border border-white/5 hover:border-white/20 transition"
                >
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-500 font-mono uppercase">
                      {scan.time}
                    </span>
                    <span
                      className={
                        scan.status === "GENUINE"
                          ? "text-green-500"
                          : "text-red-500 font-bold"
                      }
                    >
                      {scan.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold truncate">{scan.product}</p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={10} /> {scan.location}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Trends Chart */}
          <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Regional Risk Trends</h3>
              <div className="flex gap-2 text-[10px] uppercase font-bold text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" /> Genuine
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" /> Suspicious
                </span>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { name: "Week 1", g: 4000, s: 240 },
                    { name: "Week 2", g: 3000, s: 139 },
                    { name: "Week 3", g: 2000, s: 980 },
                    { name: "Week 4", g: 2780, s: 390 },
                  ]}
                >
                  <defs>
                    <linearGradient id="colorG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorS" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff05"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#666"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#000",
                      border: "1px solid #333",
                      borderRadius: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="g"
                    stroke="#22c55e"
                    fill="url(#colorG)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="s"
                    stroke="#ef4444"
                    fill="url(#colorS)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
