"use client";
import React, { useState } from "react";
import {
  ShieldCheck,
  History,
  AlertOctagon,
  MapPin,
  X,
  Share2,
  Info,
} from "lucide-react";

export default function VerificationResult({
  type,
  onReset,
}: {
  type: "GENUINE" | "USED" | "INVALID";
  onReset: () => void;
}) {
  const [showConsent, setShowConsent] = useState(type === "USED");

  const configs = {
    GENUINE: {
      color: "text-green-500",
      bg: "bg-green-500/10",
      icon: ShieldCheck,
      title: "Authentic Product",
      desc: "This medication is verified and safe for consumption.",
    },
    USED: {
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      icon: History,
      title: "Reused Code",
      desc: "This code is valid but has been scanned 14 times. Possible counterfeit packaging.",
    },
    INVALID: {
      color: "text-red-500",
      bg: "bg-red-500/10",
      icon: AlertOctagon,
      title: "Invalid Code",
      desc: "This code does not exist in our database. Do not use this product.",
    },
  };

  const current = configs[type];

  return (
    <div className="space-y-6 animate-in zoom-in duration-500 relative">
      <div
        className={`p-10 rounded-[3rem] border border-white/10 ${current.bg} text-center space-y-6`}
      >
        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${current.color} border border-current`}
        >
          <current.icon size={40} />
        </div>
        <div>
          <h2
            className={`text-3xl font-black italic uppercase ${current.color}`}
          >
            {current.title}
          </h2>
          <p className="text-gray-400 text-sm mt-2">{current.desc}</p>
        </div>

        {type === "GENUINE" && (
          <div className="bg-black/40 p-6 rounded-3xl text-left border border-white/5 space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase">
              <span className="text-gray-500">Brand:</span> NatureCare
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase">
              <span className="text-gray-500">Exp:</span> Dec 2027
            </div>
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest"
        >
          Perform New Scan
        </button>
      </div>

      {/* CONSENT MODAL FOR USED STATE */}
      {showConsent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-[#111] border border-white/10 p-10 rounded-[3rem] max-w-sm w-full space-y-6 text-center">
            <MapPin className="text-amber-500 mx-auto" size={48} />
            <h3 className="text-xl font-black uppercase italic">
              Anomalous Activity
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              This code has been scanned in multiple locations. Allow location
              logging to help authorities track this counterfeit batch?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowConsent(false)}
                className="py-4 bg-amber-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Grant Tracking Access
              </button>
              <button
                onClick={() => setShowConsent(false)}
                className="text-gray-500 text-[10px] font-bold uppercase"
              >
                No, Stay Private
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
