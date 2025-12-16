"use client";
import React, { useMemo, useState } from "react";
import { Search, CheckCircle, XCircle, Eye, ShieldAlert } from "lucide-react";
import Link from "next/link";

type Status = "PENDING" | "VERIFIED" | "REJECTED";

// 🔗 BACKEND_NODEJS_CONNECTION (mock for now)
const mockQueue = [
  {
    id: "M-902",
    name: "NatureCare Pharma",
    nafdac: "B4-9921",
    score: 94,
    status: "PENDING" as Status,
    date: "2025-12-16",
    audit: [] as string[],
  },
  {
    id: "M-905",
    name: "Global Meds Ltd",
    nafdac: "A1-0023",
    score: 32,
    status: "PENDING" as Status,
    date: "2025-12-15",
    audit: [],
  },
  {
    id: "M-881",
    name: "Dangote Pharma",
    nafdac: "C2-8812",
    score: 98,
    status: "VERIFIED" as Status,
    date: "2025-12-10",
    audit: ["Approved by Admin on 2025-12-10"],
  },
];

export default function ManufacturerQueue() {
  const [filter, setFilter] = useState<Status>("PENDING");
  const [search, setSearch] = useState("");
  const [queue, setQueue] = useState(mockQueue);

  // 🔐 Confirmation modal state
  const [confirm, setConfirm] = useState<{
    id: string;
    action: Status;
  } | null>(null);

  // 🔍 Filter + Search
  const filteredQueue = useMemo(() => {
    return queue.filter((m) => {
      const q = search.toLowerCase();
      return (
        m.status === filter &&
        (m.name.toLowerCase().includes(q) ||
          m.nafdac.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q))
      );
    });
  }, [queue, filter, search]);

  // 🧠 AI Recommendation
  const getAISuggestion = (score: number) => {
    if (score >= 80) return "APPROVE";
    if (score < 50) return "REJECT";
    return "REVIEW";
  };

  // ✅ Finalize Action
  const confirmAction = () => {
    if (!confirm) return;

    const admin = "Super Admin";
    const timestamp = new Date().toLocaleString();

    setQueue((prev) =>
      prev.map((m) =>
        m.id === confirm.id
          ? {
              ...m,
              status: confirm.action,
              audit: [
                ...m.audit,
                `${confirm.action} by ${admin} @ ${timestamp}`,
              ],
            }
          : m
      )
    );

    // 🔄 Instantly sync view
    setFilter(confirm.action);
    setConfirm(null);

    // 🔗 BACKEND PATCH GOES HERE
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Manufacturer Queue
          </h1>
          <p className="text-gray-500">
            Verify brand identities and analyze license integrity.
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {(["PENDING", "VERIFIED", "REJECTED"] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${
                filter === s
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          size={18}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Company, NAFDAC, or ID..."
          className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-green-500 transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase tracking-widest text-gray-500 bg-white/[0.02]">
            <tr>
              <th className="px-8 py-6">Manufacturer</th>
              <th className="px-8 py-6">Reg Number</th>
              <th className="px-8 py-6">AI Trust Score</th>
              <th className="px-8 py-6">AI Suggestion</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 text-sm">
            {filteredQueue.map((m) => {
              const suggestion = getAISuggestion(m.score);

              return (
                <tr key={m.id} className="group hover:bg-white/[0.01]">
                  <td className="px-8 py-6">
                    <div className="font-bold group-hover:text-green-500">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-gray-500">ID: {m.id}</div>
                  </td>

                  <td className="px-8 py-6 font-mono text-gray-400">
                    {m.nafdac}
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            m.score < 50 ? "bg-red-500" : "bg-green-500"
                          }`}
                          style={{ width: `${m.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-black">{m.score}%</span>
                    </div>
                  </td>

                  <td className="px-8 py-6 text-xs font-black">
                    {suggestion === "APPROVE" && (
                      <span className="text-green-500">APPROVE</span>
                    )}
                    {suggestion === "REJECT" && (
                      <span className="text-red-500">REJECT</span>
                    )}
                    {suggestion === "REVIEW" && (
                      <span className="text-amber-500">REVIEW</span>
                    )}
                  </td>

                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <Link
                        href={`/dashboard/ad/manufacturers/${m.id}`}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"
                      >
                        <Eye size={18} />
                      </Link>

                      <button
                        onClick={() =>
                          setConfirm({ id: m.id, action: "VERIFIED" })
                        }
                        className="p-2 bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white rounded-lg"
                      >
                        <CheckCircle size={18} />
                      </button>

                      <button
                        onClick={() =>
                          setConfirm({ id: m.id, action: "REJECTED" })
                        }
                        className="p-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredQueue.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <ShieldAlert className="mx-auto text-gray-700" size={48} />
            <p className="text-gray-500 italic">No manufacturers found.</p>
          </div>
        )}
      </div>

      {/* 🔐 Confirmation Modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0b0b0b] border border-white/10 rounded-3xl p-8 w-full max-w-md space-y-6">
            <h3 className="text-xl font-black">Confirm {confirm.action}</h3>
            <p className="text-sm text-gray-400">
              This action will be logged and cannot be undone.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirm(null)}
                className="px-6 py-3 bg-white/5 rounded-xl text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-6 py-3 rounded-xl font-bold ${
                  confirm.action === "VERIFIED"
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
