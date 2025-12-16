"use client";
import React from "react";
import {
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Users,
  Package,
  Search,
  Activity,
  Zap,
} from "lucide-react";
import StatCard from "../../../../components/dashboard/StatCard"; // Reusing the stats logic
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="p-8 space-y-8 bg-[#050505] min-h-screen text-white">
      {/* Top Critical Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Manufacturers" value="124" icon={Users} />
        <StatCard
          title="Pending Review"
          value="18"
          icon={AlertCircle}
          trend="Action Req"
          color="amber"
        />
        <StatCard
          title="Verified Brands"
          value="106"
          icon={ShieldCheck}
          color="green"
        />
        <StatCard title="Total Products" value="8.4k" icon={Package} />
        <StatCard title="Total Scans" value="1.2M" icon={Activity} />
        <StatCard
          title="Fraud Alerts"
          value="402"
          icon={Zap}
          trend="+12%"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Manufacturer Approval Queue (High Priority) */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ShieldCheck className="text-amber-500" size={20} /> Pending
              Approvals
            </h3>
            <button className="text-xs text-green-500 font-bold hover:underline">
              View All Queue
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase tracking-widest text-gray-500 bg-white/[0.01]">
                <tr>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">NAFDAC</th>
                  <th className="px-6 py-4 text-center">AI Trust Score</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  {
                    name: "Global Meds",
                    id: "N-8821",
                    score: 94,
                    status: "CLEAN",
                  },
                  {
                    name: "PharmaPlus",
                    id: "N-1022",
                    score: 32,
                    status: "SUSPICIOUS",
                  },
                ].map((m, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 font-bold text-sm">{m.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      {m.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`text-xs font-bold ${
                            m.score < 50 ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {m.score}%
                        </span>
                        <div className="w-16 h-1 bg-white/10 rounded-full mt-1">
                          <div
                            className={`h-full rounded-full ${
                              m.score < 50 ? "bg-red-500" : "bg-green-500"
                            }`}
                            style={{ width: `${m.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/ad/manufacturers/${m.id}`}
                        className="bg-green-600/20 text-green-500 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition text-xs font-bold"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts (The "Pulse") */}
        <div className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-6 space-y-6">
          <h3 className="font-bold text-red-500 flex items-center gap-2">
            <Zap size={20} /> Critical Anomalies
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-[10px] font-black text-red-500 uppercase">
                High Velocity Reuse
              </p>
              <p className="text-sm text-white mt-1">
                Single code scanned 42 times in 5 mins (Lagos Island).
              </p>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <p className="text-[10px] font-black text-amber-500 uppercase">
                Rejected Entry
              </p>
              <p className="text-sm text-white mt-1">
                PharmaPlus failed AI check 3 times.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Verification Feed & 4️⃣ Mini Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
          <h3 className="font-bold mb-6">Real-time Global Feed</h3>
          {/* Live Feed Rows */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 bg-black/40 border border-white/5 rounded-2xl"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tighter">
                      LUM-9921-X
                    </p>
                    <p className="text-[9px] text-gray-500">
                      Paracetamol • Dangote Pharma
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-gray-600 text-right">
                  Just now
                  <br />
                  Abuja, FCT
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Hotspot Map Preview */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
          <h3 className="font-bold mb-2">Regional Fraud Density</h3>
          <p className="text-xs text-gray-500 mb-6">
            Aggregated clusters of failed scans.
          </p>
          <div className="h-48 bg-[url('/map-dark.png')] bg-center bg-cover opacity-30 group-hover:opacity-50 transition-all duration-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 bg-red-600/20 rounded-full animate-ping" />
          </div>
          <button className="w-full mt-4 bg-white/5 py-3 rounded-xl text-xs font-bold transition hover:bg-red-500/10">
            Open Intelligence Map →
          </button>
        </div>
      </div>
    </div>
  );
}
