"use client";
import React, { useState, useMemo } from "react";
import { Download, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Batch {
  id: string;
  name: string;
  qty: number;
  date: string;
  isRecalled: boolean;
}

// Mock data – replace with API later
const initialBatches: Batch[] = [
  {
    id: "LUM-B1-902",
    name: "Glow Serum",
    qty: 5000,
    date: "Oct 10",
    isRecalled: false,
  },
  {
    id: "LUM-B1-884",
    name: "Healing Balm",
    qty: 1200,
    date: "Oct 08",
    isRecalled: true,
  },
  {
    id: "LUM-B1-762",
    name: "Active Soap",
    qty: 3000,
    date: "Sept 25",
    isRecalled: false,
  },
  {
    id: "LUM-B1-701",
    name: "Vitamin C Serum",
    qty: 2500,
    date: "Sept 18",
    isRecalled: false,
  },
  {
    id: "LUM-B1-690",
    name: "Healing Balm",
    qty: 1800,
    date: "Sept 10",
    isRecalled: true,
  },
  {
    id: "LUM-B1-682",
    name: "Glow Serum",
    qty: 1200,
    date: "Sept 05",
    isRecalled: true,
  },
  {
    id: "LUM-B1-675",
    name: "Active Soap",
    qty: 4000,
    date: "Aug 28",
    isRecalled: false,
  },
  {
    id: "LUM-B1-660",
    name: "Vitamin C Serum",
    qty: 3200,
    date: "Aug 20",
    isRecalled: false,
  },
  {
    id: "LUM-B1-650",
    name: "Glow Serum",
    qty: 2100,
    date: "Aug 10",
    isRecalled: true,
  },
];

const rowsPerPage = 7;

const downloadCSV = (name: string, id: string) => {
  console.log(`Downloading CSV for ${name} (${id})`);
};

export default function BatchViewAllPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔥 Optimistic recall
  const handleRecall = (batchId: string) => {
    setBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId ? { ...batch, isRecalled: true } : batch
      )
    );

    // backend later:
    // fetch(`/api/batches/${batchId}/recall`, { method: "POST" });
  };

  const totalPages = Math.ceil(batches.length / rowsPerPage);

  const paginatedBatches = useMemo(
    () =>
      batches.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [batches, currentPage]
  );

  return (
    <div className="p-6 space-y-6 bg-[#050505] min-h-screen text-white">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-green-500 hover:text-green-400 mb-4"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold tracking-tight mb-4">All Batches</h1>

      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Batch ID</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4 text-center">Codes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {paginatedBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-mono text-sm text-green-500">
                    {batch.id}
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium">{batch.name}</div>
                    <div className="text-xs text-gray-500">
                      Created {batch.date}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="bg-white/5 px-3 py-1 rounded-lg text-xs font-bold">
                      {batch.qty.toLocaleString()}
                    </span>
                  </td>

                  {/* 🔥 STATUS */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          batch.isRecalled
                            ? "bg-red-500 animate-pulse"
                            : "bg-green-500"
                        }`}
                      />
                      <span className="text-xs font-bold uppercase tracking-tighter">
                        {batch.isRecalled ? "Recalled" : "Active"}
                      </span>
                    </div>
                  </td>

                  {/* 🔥 ACTION */}
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => downloadCSV(batch.name, batch.id)}
                      className="p-2 bg-white/5 hover:bg-green-600 rounded-xl text-gray-400 hover:text-white transition"
                    >
                      <Download size={16} />
                    </button>

                    <button
                      onClick={() => handleRecall(batch.id)}
                      disabled={batch.isRecalled}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${
                        batch.isRecalled
                          ? "bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
                          : "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      {batch.isRecalled ? "Batch Locked" : "Recall Batch"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center gap-4 p-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 rounded-lg bg-white/10 disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-400">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 rounded-lg bg-white/10 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
