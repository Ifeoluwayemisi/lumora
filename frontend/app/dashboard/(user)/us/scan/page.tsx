"use client";
import React, { useState } from "react";
import {
  Camera,
  ShieldCheck,
  XOctagon,
  Smartphone,
  History,
} from "lucide-react";

export default function UserScanner() {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-between">
      {/* Header */}
      <div className="w-full flex justify-between items-center py-4">
        <h1 className="text-2xl font-black italic tracking-tighter">LUMORA</h1>
        <div className="p-2 bg-white/10 rounded-full">
          <History size={20} />
        </div>
      </div>

      {/* Camera Viewfinder */}
      <div className="relative w-full aspect-square max-w-sm border-2 border-white/10 rounded-[3rem] overflow-hidden bg-white/5 flex items-center justify-center">
        {/* The Animated Scanning Line */}
        <div className="absolute inset-0 z-10">
          <div className="w-full h-1 bg-green-500 shadow-[0_0_20px_#22c55e] absolute top-0 animate-[scan_3s_linear_infinite]" />
        </div>

        <Camera size={48} className="text-white/20" />

        {/* Corners for the viewfinder */}
        <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-xl" />
        <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-xl" />
        <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-xl" />
        <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-xl" />
      </div>

      {/* Instructions & CTA */}
      <div className="w-full space-y-8 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">Ready to Verify</h2>
          <p className="text-gray-500 text-sm">
            Align the Lumora Code on the drug package within the frame.
          </p>
        </div>

        <button
          className="w-full py-6 bg-green-500 text-black rounded-3xl font-black uppercase tracking-widest text-sm shadow-[0_20px_50px_rgba(34,197,94,0.3)] active:scale-95 transition-all"
          onClick={() => setIsScanning(true)}
        >
          Initiate Hashing...
        </button>

        <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
          Powered by Lumora Cryptographic Ledger
        </p>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 10%;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 90%;
            opacity: 0;
          }
        }
      `}</style> 
    </div>
  );
}