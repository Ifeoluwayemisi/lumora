"use client";
import React, { useState } from "react";
import { Zap, ShieldCheck, Download, Loader2, PackagePlus } from "lucide-react";

export default function NewBatchGenerator() {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Secure Batch Engine
        </h1>
        <p className="text-gray-500 text-sm">
          Generate encrypted unique identifiers for your production line.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Side */}
        <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-2">
              Select Product
            </label>
            <select className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500 text-sm font-bold appearance-none">
              <option>Paracetamol 500mg (NatureCare)</option>
              <option>Amoxicillin 250mg (Global Meds)</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-2">
              Batch Quantity
            </label>
            <input
              type="number"
              placeholder="e.g. 10000"
              className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500 text-sm font-bold"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-2">
              Expiry Date
            </label>
            <input
              type="date"
              className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500 text-sm font-bold text-gray-400"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-6 bg-green-500 text-black rounded-[2rem] font-black uppercase italic tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
            {loading ? "Encrypting Codes..." : "Generate Secure Batch"}
          </button>
        </div>

        {/* Results/Status Side */}
        <div className="flex flex-col justify-center items-center text-center space-y-6">
          {!generated ? (
            <div className="space-y-4 opacity-40">
              <div className="w-32 h-32 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mx-auto">
                <PackagePlus size={40} className="text-gray-500" />
              </div>
              <p className="text-xs font-bold uppercase text-gray-600">
                Enter batch details to begin <br /> encryption sequence
              </p>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 p-10 rounded-[3rem] w-full animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                <ShieldCheck size={40} className="text-black" />
              </div>
              <h3 className="text-2xl font-black italic uppercase mb-2 text-green-500">
                Encryption Success
              </h3>
              <p className="text-xs text-gray-400 mb-8">
                10,000 Unique Identifiers have been hashed and assigned to Batch
                #BT-9921-X.
              </p>
              <div className="space-y-3">
                <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition">
                  <Download size={14} /> Download CSV for Printing
                </button>
                <button className="w-full py-4 text-gray-500 text-[10px] font-black uppercase hover:text-white transition">
                  View Batch Analytics
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
