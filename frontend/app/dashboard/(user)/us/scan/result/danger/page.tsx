"use client";
import React from "react";
import {
  AlertOctagon,
  Skull,
  PhoneCall,
  ShieldAlert,
  Navigation,
} from "lucide-react";

export default function ScanDanger() {
  return (
    <div className="min-h-screen bg-red-950 text-white p-6 animate-in slide-in-from-bottom-10 duration-500">
      {/* Danger Header */}
      <div className="flex flex-col items-center text-center space-y-6 mt-12 mb-12">
        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(220,38,38,0.6)]">
          <Skull size={48} className="text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Warning: Fake
          </h1>
          <p className="text-red-200 text-sm font-medium px-4">
            This code does not exist in our secure ledger. Do not consume this
            medication.
          </p>
        </div>
      </div>

      {/* Incident Details */}
      <div className="bg-black/40 border border-red-500/30 rounded-[2.5rem] p-8 space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
          <ShieldAlert size={14} /> Critical Security Log
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-red-200/50">Anomaly Type</span>
            <span className="font-bold">Cryptographic Mismatch</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-red-200/50">Scanned At</span>
            <span className="font-bold italic">Current Location</span>
          </div>
        </div>

        <div className="p-4 bg-red-600/20 border border-red-500/20 rounded-2xl flex gap-4 items-start">
          <AlertOctagon className="text-red-500 shrink-0" size={20} />
          <p className="text-[11px] leading-relaxed text-red-100">
            The pharmacist may be unaware this is a counterfeit. Please report
            this incident to NAFDAC immediately using the button below.
          </p>
        </div>
      </div>

      {/* Emergency Actions */}
      <div className="mt-12 space-y-4">
        <button className="w-full py-6 bg-red-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-3">
          <PhoneCall size={18} /> Report to NAFDAC
        </button>
        <button className="w-full py-6 bg-white/10 border border-white/10 text-white rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3">
          <Navigation size={18} /> Flag Pharmacy Location
        </button>
      </div>
    </div>
  );
}
