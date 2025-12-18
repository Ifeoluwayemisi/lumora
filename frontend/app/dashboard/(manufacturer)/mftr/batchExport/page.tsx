"use client";
import React, { useState } from "react";
import { Download, FileJson } from "lucide-react";

export default function BatchExport({ batchId }: { batchId: string }) {
  return (
    <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-3xl flex items-center justify-between">
      <div>
        <h4 className="text-sm font-black uppercase italic text-green-500">
          Batch Ready for Print
        </h4>
        <p className="text-[10px] text-gray-500 font-bold uppercase">
          10,000 Unique Cryptographic Labels Generated
        </p>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition">
          <Download size={14} /> Download PDF Labels
        </button>
        <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase">
          <FileJson size={14} /> CSV
        </button>
      </div>
    </div>
  );
}
