"use client";
import React, { useState } from "react";
import { History, Search, ChevronRight, ShieldAlert, Star } from "lucide-react";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const scanHistory = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      brand: "NatureCare",
      status: "Genuine",
      date: "2h ago",
      saved: true,
    },
    {
      id: 2,
      name: "Amoxicillin",
      brand: "Global Meds",
      status: "Invalid",
      date: "1d ago",
      saved: false,
    },
    {
      id: 3,
      name: "Vitamin C",
      brand: "Dangote",
      status: "Genuine",
      date: "3d ago",
      saved: true,
    },
  ];

  const filteredHistory = scanHistory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeTab === "all" || item.saved)
  );

  return (
    <div className="p-6 lg:p-12 animate-in fade-in duration-700">
      {/* 🔹 HEADER ZONE — calmer spacing */}
      <div className="space-y-12 mb-14">
        {/* Alert */}
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex items-center gap-4 animate-pulse">
          <ShieldAlert className="text-red-500 shrink-0" size={24} />
          <div className="flex-1">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
              Security Alert
            </p>
            <p className="text-xs text-red-200/80 font-medium">
              Batch #BT-9921 has been flagged for recall in your area.
            </p>
          </div>
          <button className="text-[10px] font-black uppercase text-white bg-red-600 px-3 py-1 rounded-lg">
            View
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-1">
              Total Scans
            </p>
            <p className="text-3xl font-black italic tracking-tighter">24</p>
          </div>
          <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-1">
              Authentic
            </p>
            <p className="text-3xl font-black italic tracking-tighter text-green-500">
              22
            </p>
          </div>
          <div className="hidden md:block bg-white/5 border border-white/5 p-6 rounded-[2rem]">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-1">
              Saved Drugs
            </p>
            <p className="text-3xl font-black italic tracking-tighter text-blue-500">
              08
            </p>
          </div>
        </div>
      </div>

      {/* 🔹 CONTENT ZONE */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition ${
                activeTab === "all" ? "bg-white text-black" : "text-gray-500"
              }`}
            >
              Recent Scans
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition ${
                activeTab === "saved" ? "bg-white text-black" : "text-gray-500"
              }`}
            >
              Saved / Favorites
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
              size={14}
            />
            <input
              type="text"
              placeholder="Filter history..."
              className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2 rounded-xl text-xs outline-none focus:border-green-500"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 🔹 LIST — simpler padding */}
        <div className="space-y-3">
          {filteredHistory.map((scan) => (
            <div
              key={scan.id}
              className="bg-white/5 border border-white/5 px-5 py-4 rounded-2xl flex items-center justify-between group hover:bg-white/[0.08] transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    scan.status === "Genuine"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  <History size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold">{scan.name}</h4>
                    {scan.saved && (
                      <Star size={10} className="fill-blue-500 text-blue-500" />
                    )}
                  </div>
                  <p className="text-[10px] font-black text-gray-500 uppercase">
                    {scan.brand} • {scan.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${
                    scan.status === "Genuine"
                      ? "border-green-500/20 text-green-500"
                      : "border-red-500/20 text-red-500"
                  }`}
                >
                  {scan.status}
                </span>
                <ChevronRight
                  size={18}
                  className="text-gray-700 group-hover:text-white transition"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
