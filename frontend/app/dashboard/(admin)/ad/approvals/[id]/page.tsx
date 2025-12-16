"use client";

import AIDeepDive from "@/components/dashboard/AIDeepDive";
import { FileText, ChevronLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ManufacturerReviewPage() {
  return (
    <div className="p-8 space-y-10 bg-[#050505] min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/dashboard/admin/approvals"
            className="text-gray-500 hover:text-white flex items-center gap-2 transition mb-2"
          >
            <ChevronLeft size={18} /> Back to Queue
          </Link>
          <h1 className="text-3xl font-black italic tracking-tight">
            PHARMAPLUS LTD • VERIFICATION
          </h1>
          <p className="text-gray-500 text-sm">
            Submitted Dec 15, 2025 • Ikeja, Lagos
          </p>
        </div>

        <div className="flex gap-4">
          <button className="px-6 py-3 border border-red-500/40 text-red-500 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition">
            Reject
          </button>
          <button className="px-6 py-3 bg-green-600 rounded-2xl font-bold hover:scale-105 transition">
            Approve Manufacturer
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* LEFT — Document Preview */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Submitted Certificate
          </h3>

          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-4 h-[600px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-6 left-6 bg-black/80 backdrop-blur px-4 py-2 rounded-full border border-red-500/40 flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase">
              <ShieldAlert size={14} /> AI Overlay Active
            </div>

            <FileText size={100} className="text-white/10" />

            <p className="absolute bottom-8 text-xs text-gray-500">
              nafdac_cert_2025_091.pdf
            </p>
          </div>
        </div>

        {/* RIGHT — AI + OCR */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            System Intelligence Analysis
          </h3>

          {/* 🔥 Your AI Component */}
          <AIDeepDive reportId="AN-9921" riskLevel="HIGH" />

          {/* OCR Box */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
            <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase">
              OCR Text Extraction
            </h4>
            <div className="font-mono text-[10px] text-green-500/80 bg-black/40 p-4 rounded-xl leading-relaxed border border-green-500/10">
              COMPANY: PHARMAPLUS NIGERIA LTD <br />
              REG_NO: B4-99201 <br />
              ISSUE_DATE: 12-JAN-2023 <br />
              STATUS: NO MATCH FOUND
            </div>
            <p className="mt-3 text-[10px] text-gray-500 italic">
              Cross-checked against NAFDAC Central Registry
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
