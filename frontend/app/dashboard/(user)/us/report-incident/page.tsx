"use client";
import React, { useState } from "react";
import { Camera } from "lucide-react";

export default function ReportIncident() {
  return (
    <div className="p-8 max-w-xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-black italic uppercase text-red-500">
          Report Counterfeit
        </h2>
        <p className="text-gray-500 text-xs font-bold uppercase">
          Help NAFDAC track illegal drug distribution.
        </p>
      </div>

      <div className="space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-red-500/20">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
            Pharmacy Name
          </label>
          <input
            className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-red-500"
            placeholder="e.g. St. Jude's Pharmacy"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
            Location/Street
          </label>
          <input
            className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-red-500"
            placeholder="e.g. Ikeja, Lagos"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
            Upload Photo of Box (Optional)
          </label>
          <div className="w-full h-32 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-gray-600">
            <Camera size={24} />
          </div>
        </div>
        <button className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-500/20">
          Submit Forensic Report
        </button>
      </div>
    </div>
  );
}
