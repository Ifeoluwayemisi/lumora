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
import { Download, Globe, ShieldAlert, ShieldCheck } from "lucide-react";

const nationalTrends = [
  { name: "Week 1", genuine: 8400, suspicious: 620 },
  { name: "Week 2", genuine: 7200, suspicious: 980 },
  { name: "Week 3", genuine: 9100, suspicious: 540 },
  { name: "Week 4", genuine: 8800, suspicious: 760 },
];

const regionalStats = [
  { region: "Lagos", scans: "4.2M", risk: "Low" },
  { region: "Kano", scans: "1.6M", risk: "Critical" },
  { region: "Abuja", scans: "2.1M", risk: "Low" },
  { region: "Onitsha", scans: "1.2M", risk: "High" },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">National Intelligence</h1>
          <p className="text-gray-400">
            System-wide verification activity and counterfeit surveillance.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition">
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Metric
          title="Total Scans"
          value="24.8M"
          icon={<Globe className="text-blue-400" size={18} />}
        />
        <Metric
          title="Verified Products"
          value="22.9M"
          icon={<ShieldCheck className="text-green-500" size={18} />}
        />
        <Metric
          title="Suspicious Flags"
          value="1.9M"
          icon={<ShieldAlert className="text-red-500" size={18} />}
        />
        <Metric
          title="Integrity Index"
          value="92%"
          icon={<ShieldCheck className="text-green-500" size={18} />}
        />
      </div>

      {/* Chart + Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* National Trend */}
        <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-[2rem] p-8">
          <h3 className="text-xl font-bold mb-6">
            National Verification Trends
          </h3>

          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={nationalTrends}>
                <defs>
                  <linearGradient id="genuine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="suspicious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff08"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
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
                  dataKey="genuine"
                  stroke="#22c55e"
                  fill="url(#genuine)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="suspicious"
                  stroke="#ef4444"
                  fill="url(#suspicious)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Summary */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <h3 className="text-lg font-bold mb-4">Regional Risk</h3>

          <div className="space-y-4">
            {regionalStats.map((r) => (
              <div
                key={r.region}
                className="p-4 bg-black/40 rounded-xl border border-white/5"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold">{r.region}</span>
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      r.risk === "Low" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {r.risk}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {r.scans} total scans
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Small Metric Card --- */
function Metric({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 flex items-center justify-between">
      <div>
        <p className="text-[11px] uppercase text-gray-500 font-bold">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className="p-3 bg-black/40 rounded-xl">{icon}</div>
    </div>
  );
}
