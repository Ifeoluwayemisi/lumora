"use client";
import React from "react";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Building2,
  ChevronRight,
  Share2,
} from "lucide-react";
import Link from "next/link";

export default function ScanSuccess() {
  return (
    <div className="min-h-screen bg-black text-white p-6 animate-in zoom-in duration-500">
      {/* Success Badge */}
      <div className="flex flex-col items-center text-center space-y-4 mb-10 mt-8">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.4)]">
          <ShieldCheck size={48} className="text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-green-500">
            Authentic Product
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            Verified by Lumora Protocol
          </p>
        </div>
      </div>

      {/* Product Card */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
        <div className="aspect-video bg-white/5 relative">
          <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-black uppercase italic text-4xl opacity-20">
            NatureCare
          </div>
          {/* In real app: <img src={product.image} /> */}
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Paracetamol 500mg</h2>
              <p className="text-xs text-gray-500 font-medium italic">
                Analgesic / Antipyretic
              </p>
            </div>
            <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black border border-green-500/20">
              NAFDAC: 01-9921
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-1">
                <Building2 size={10} /> Manufacturer
              </span>
              <p className="text-xs font-bold text-white">NatureCare Pharma</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-1">
                <Calendar size={10} /> Expiry Date
              </span>
              <p className="text-xs font-bold text-white uppercase">Dec 2027</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Actions */}
      <div className="mt-8 space-y-4">
        <button className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
          <Share2 size={16} /> Share Verification Report
        </button>
        <Link
          href="/scan"
          className="w-full py-5 bg-white/5 border border-white/10 text-gray-400 rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"
        >
          Scan Another Item
        </Link>
      </div>
    </div>
  );
}
