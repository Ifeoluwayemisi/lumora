"use client";
import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  ShieldCheck,
  AlertTriangle,
  Skull,
  MapPin,
  ChevronDown,
} from "lucide-react";

// Mock Data
const verificationLogs = Array.from({ length: 120 }, (_, i) => {
  const statuses = ["GENUINE", "REUSED", "INVALID"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const times = [
    `${Math.floor(Math.random() * 60)} mins ago`,
    `${Math.floor(Math.random() * 24)} hours ago`,
    `${Math.floor(Math.random() * 30)} days ago`,
  ];
  return {
    id: `LOG-${8800 + i}`,
    code: `LUM-${100 + i}-X`,
    product: ["Paracetamol", "Amoxicillin", "Vitamin C"][i % 3],
    manufacturer: ["NatureCare", "Global Meds", "Dangote Pharma"][i % 3],
    location: ["Lagos", "Abuja", "Kano", "Ibadan"][i % 4] + ", NG",
    status,
    time: times[i % 3],
  };
});

const statusStyles = {
  GENUINE: "bg-green-500/10 text-green-500 border-green-500/20",
  REUSED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  INVALID: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusIcons = {
  GENUINE: <ShieldCheck size={14} />,
  REUSED: <AlertTriangle size={14} />,
  INVALID: <Skull size={14} />,
};

export default function VerificationLogs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [statusOpen, setStatusOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  const rowsPerPage = 10;

  const timeOptions = ["Last 24 Hours", "Last 7 Days", "Last 30 Days", "All"];
  const statusOptions = ["ALL", "GENUINE", "REUSED", "INVALID"];

  // Filter & Search Logic
  const filteredLogs = useMemo(() => {
    return verificationLogs.filter((log) => {
      const matchesSearch =
        log.code.toLowerCase().includes(search.toLowerCase()) ||
        log.product.toLowerCase().includes(search.toLowerCase()) ||
        log.manufacturer.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || log.status === statusFilter;

      const matchesTime =
        timeFilter === "All" ||
        log.time.includes(timeFilter.replace("Last ", ""));

      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [search, statusFilter, timeFilter]);

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const currentLogs = filteredLogs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header & Export */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Verification Logs
          </h1>
          <p className="text-gray-500 text-sm">
            Monitoring every product interaction across the network.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Code, Product, or Manufacturer..."
            className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-green-500 transition text-sm"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="bg-white/5 border border-white/10 px-4 py-4 rounded-2xl w-full flex justify-between items-center text-gray-400 hover:border-green-500 transition text-xs font-bold uppercase"
          >
            Status: {statusFilter}
            <ChevronDown size={16} />
          </button>
          {statusOpen && (
            <div className="absolute mt-1 bg-[#050505] border border-white/10 w-full rounded-2xl z-50">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setStatusOpen(false);
                    setPage(1);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition text-xs font-bold uppercase"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time Dropdown */}
        <div className="relative">
          <button
            onClick={() => setTimeOpen(!timeOpen)}
            className="bg-white/5 border border-white/10 px-4 py-4 rounded-2xl w-full flex justify-between items-center text-gray-400 hover:border-green-500 transition text-xs font-bold uppercase"
          >
            {timeFilter}
            <ChevronDown size={16} />
          </button>
          {timeOpen && (
            <div className="absolute mt-1 bg-[#050505] border border-white/10 w-full rounded-2xl z-50">
              {timeOptions.map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    setTimeFilter(time);
                    setTimeOpen(false);
                    setPage(1);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition text-xs font-bold uppercase"
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-[2.5rem]">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 bg-white/[0.02] border-b border-white/5">
              <th className="px-8 py-6 text-center">Status</th>
              <th className="px-8 py-6">Unique Code</th>
              <th className="px-8 py-6">Product Item</th>
              <th className="px-8 py-6">Manufacturer</th>
              <th className="px-8 py-6">Location</th>
              <th className="px-8 py-6">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {currentLogs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-white/[0.01] transition-colors group"
              >
                <td className="px-8 py-6">
                  <div
                    className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-full border text-[9px] font-black tracking-widest ${
                      statusStyles[log.status]
                    }`}
                  >
                    {statusIcons[log.status]}
                    {log.status}
                  </div>
                </td>
                <td className="px-8 py-6 font-mono text-sm text-white">
                  {log.code}
                </td>
                <td className="px-8 py-6 text-sm text-gray-300 font-bold">
                  {log.product}
                </td>
                <td className="px-8 py-6 text-sm text-gray-500">
                  {log.manufacturer}
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin size={12} className="text-red-500/50" />{" "}
                    {log.location}
                  </div>
                </td>
                <td className="px-8 py-6 text-xs text-gray-600 font-mono italic">
                  {log.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <p>
            Showing {(page - 1) * rowsPerPage + 1} -{" "}
            {Math.min(page * rowsPerPage, filteredLogs.length)} of{" "}
            {filteredLogs.length} Verifications
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`transition ${
                page === 1
                  ? "text-gray-500 cursor-not-allowed"
                  : "hover:text-white"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`transition ${
                page === totalPages
                  ? "text-gray-500 cursor-not-allowed"
                  : "hover:text-white"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
