"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  FileText,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Download,
} from "lucide-react";
import AIDeepDive from "@/components/dashboard/AIDeepDive";

export default function ManufacturerApprovalDetail({
  params,
}: {
  params: { id: string };
}) {
  // TODO: BACKEND_NODEJS_CONNECTION (mock for now)
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">(
    "PENDING"
  );

  const manufacturer = {
    id: params.id,
    name: "NatureCare Pharma",
    submittedBy: "Dr. Adeyemi",
    submittedAt: "Dec 16, 2025",
    document: "nafdac_cert_9921_naturecare.pdf",
  };

  const handleDecision = (decision: "APPROVED" | "REJECTED") => {
    setStatus(decision);

    // TODO: BACKEND CALL GOES HERE
    // await fetch(`/api/admin/manufacturers/${params.id}`, {
    //   method: "PATCH",
    //   body: JSON.stringify({ status: decision }),
    // });
  };

  return (
    <div className="p-8 space-y-10 bg-[#050505] min-h-screen text-white animate-in slide-in-from-right duration-500">
      {/* 🔙 Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <Link
            href="/dashboard/ad/manufacturers"
            className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition text-xs font-bold uppercase tracking-widest mb-2"
          >
            <ChevronLeft size={14} /> Back to Queue
          </Link>

          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            {manufacturer.name}{" "}
            <span className="text-gray-600 font-normal">
              / {manufacturer.id}
            </span>
          </h1>

          <p className="text-gray-500 text-sm">
            NAFDAC License Review • Submitted by {manufacturer.submittedBy} •{" "}
            {manufacturer.submittedAt}
          </p>
        </div>

        {/*Actions */}
        <div className="flex gap-4">
          <button
            disabled={status !== "PENDING"}
            onClick={() => handleDecision("REJECTED")}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black text-xs uppercase hover:bg-red-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <XCircle size={16} /> Reject
          </button>

          <button
            disabled={status !== "PENDING"}
            onClick={() => handleDecision("APPROVED")}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase shadow-[0_0_25px_rgba(34,197,94,0.3)] hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all"
          >
            <CheckCircle size={16} /> Approve Brand
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Document Evidence */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              Document Evidence
            </h3>
            <button className="text-[10px] flex items-center gap-1 font-bold text-green-500 hover:underline">
              <Download size={12} /> Full Resolution
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-4 aspect-[4/5] flex items-center justify-center relative overflow-hidden group border-dashed border-2">
            <div className="text-center space-y-4">
              <FileText
                size={80}
                className="text-white/10 mx-auto group-hover:text-green-500/20 transition-colors duration-500"
              />
              <p className="text-[10px] font-mono text-gray-600 uppercase">
                {manufacturer.document}
              </p>
            </div>

            {/* Scanner Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[3rem]">
              <div className="w-full h-[2px] bg-green-500/40 shadow-[0_0_15px_#22c55e] absolute top-0 animate-[scan_4s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>

        {/* 🤖 AI & Registry Intelligence */}
        <div className="space-y-10">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-2 mb-4">
              AI Assessment Report
            </h3>
            <AIDeepDive reportId={params.id} />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6">
            <h3 className="font-bold flex items-center gap-2 italic">
              <ShieldAlert className="text-amber-500" size={18} />
              Registry Cross-Check
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "NAFDAC Database", status: "MATCH FOUND", ok: true },
                { label: "CAC Registry", status: "VERIFIED", ok: true },
                { label: "Tax Clearance", status: "EXPIRED", ok: false },
                { label: "Physical Address", status: "MATCHED", ok: true },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-black/40 p-4 rounded-2xl border border-white/5"
                >
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                    {item.label}
                  </p>
                  <p
                    className={`text-xs font-bold ${
                      item.ok ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {item.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
