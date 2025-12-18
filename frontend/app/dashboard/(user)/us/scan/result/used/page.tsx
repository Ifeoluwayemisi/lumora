"use client";
import React, { useState } from "react";
import { AlertCircle, MapPin, History, ShieldAlert, X } from "lucide-react";

export default function ScanUsed() {
  const [showConsent, setShowConsent] = useState(true);

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      {/* Warning Icon */}
      <div className="mt-12 mb-8 relative">
        <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.3)]">
          <History size={48} className="text-black" />
        </div>
        <div className="absolute -top-2 -right-2 bg-red-600 p-2 rounded-full border-4 border-black">
          <ShieldAlert size={16} />
        </div>
      </div>

      <div className="text-center space-y-4 mb-10">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-amber-500">Already Scanned</h1>
        <p className="text-gray-400 text-sm px-6">
          This genuine code has been verified <span className="text-white font-bold">14 times</span> already. This may indicate a counterfeit reuse of packaging.
        </p>
      </div>

      {/* Product Summary */}
      <div className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-4">
         <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-500 uppercase">Product</span>
            <span className="text-xs font-bold uppercase text-white">Vitamin C Syrup</span>
         </div>
         <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-500 uppercase">First Scanned</span>
            <span className="text-xs font-bold text-white">Oct 12, 2025</span>
         </div>
      </div>

      {/* Privacy Consent Popup (Overlay) */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-[3rem] p-10 space-y-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-start">
               <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                  <MapPin size={24} />
               </div>
               <button onClick={() => setShowConsent(false)} className="text-gray-500"><X size={20}/></button>
            </div>
            <div className="space-y-2">
               <h3 className="text-xl font-bold uppercase italic tracking-tighter">Help us track fakes?</h3>
               <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  We've detected a "Reused Code" anomaly. Allowing us to log your location helps authorities find where this counterfeit batch is being sold.
               </p>
            </div>
            <div className="flex flex-col gap-3">
               <button className="w-full py-4 bg-amber-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20">
                  Allow Location Logging
               </button>
               <button onClick={() => setShowConsent(false)} className="w-full py-4 text-gray-600 font-bold text-xs uppercase">
                  No, I'll stay private
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}