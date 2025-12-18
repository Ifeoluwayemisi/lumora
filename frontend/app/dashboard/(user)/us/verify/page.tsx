"use client";
import React, { useState } from "react";
import {
  QrCode,
  Keyboard,
  ShieldCheck,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle2,
  History,
  Info,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function VerificationHub() {
  const [method, setMethod] = useState<"qr" | "manual">("manual"); // manual first
  const [viewState, setViewState] = useState<"idle" | "verifying" | "result">(
    "idle"
  );
  const [scanResult, setScanResult] = useState<
    "GENUINE" | "USED" | "INVALID" | null
  >(null);
  const [consentModal, setConsentModal] = useState(false);

  const triggerVerify = () => {
    setViewState("verifying");
    setTimeout(() => {
      setScanResult("USED");
      setViewState("result");
      if ("USED" === "USED") setConsentModal(true);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-12">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            Digital Forensic
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Unit Verification Protocol
          </p>
        </div>

        {viewState === "idle" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Method Selector */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => setMethod("manual")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase transition ${
                  method === "manual"
                    ? "bg-green-500 text-black shadow-xl shadow-green-500/20"
                    : "text-gray-500"
                }`}
              >
                <Keyboard size={16} /> Manual Input
              </button>
              <button
                onClick={() => setMethod("qr")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase transition ${
                  method === "qr"
                    ? "bg-green-500 text-black shadow-xl shadow-green-500/20"
                    : "text-gray-500"
                }`}
              >
                <QrCode size={16} /> QR Scanner
              </button>
            </div>

            {/* Manual Input */}
            {method === "manual" ? (
              <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-4">
                <input
                  maxLength={12}
                  className="w-full bg-black border border-white/10 p-6 rounded-2xl text-center text-3xl font-mono font-bold tracking-[0.2em] focus:border-green-500 outline-none transition-all uppercase"
                  placeholder="XXXX-XXXX-XXXX"
                />
                <button
                  onClick={triggerVerify}
                  className="w-full py-6 bg-green-500 text-black rounded-2xl font-black uppercase italic tracking-widest hover:bg-green-400 transition"
                >
                  Verify Unit
                </button>
                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex gap-4 items-start mt-4">
                  <Info className="text-gray-500 shrink-0" size={18} />
                  <p className="text-[10px] leading-relaxed text-gray-500 uppercase font-bold tracking-wider">
                    Codes are case-sensitive. If the code is scratched or
                    unreadable, please contact the manufacturer directly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative aspect-square rounded-[3rem] border-2 border-white/10 bg-white/5 flex flex-col items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 border-[40px] border-black/60 z-10" />
                <div className="w-full h-0.5 bg-green-400 shadow-[0_0_15px_#4ade80] absolute top-0 animate-[scan_3s_ease-in-out_infinite]" />
                <QrCode
                  size={80}
                  className="text-white/10 group-hover:text-green-500/20 transition-colors"
                />
                <button
                  onClick={triggerVerify}
                  className="absolute bottom-12 z-20 px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition"
                >
                  Initialize Camera
                </button>
              </div>
            )}
          </div>
        )}

        {viewState === "verifying" && (
          <div className="py-20 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="w-20 h-20 border-t-2 border-green-500 rounded-full animate-spin" />
            <div>
              <h3 className="text-xl font-black uppercase italic text-green-500">
                Consulting Ledger...
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                Running Cryptographic Hash Check
              </p>
            </div>
          </div>
        )}

        {viewState === "result" && scanResult && (
          <ResultDisplay
            type={scanResult}
            onReset={() => setViewState("idle")}
          />
        )}
      </div>

      {/* Consent Popup with Exit */}
      <AnimatePresence>
        {consentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#0A0A0A] border border-white/10 p-8 md:p-12 rounded-[3rem] max-w-sm w-full space-y-6 text-center shadow-2xl relative">
              <button
                onClick={() => setConsentModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                <MapPin size={28} />
              </div>
              <h2 className="text-xl font-black uppercase italic">
                Anomaly Detected
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                This code has been scanned in multiple locations. Do you consent
                to sharing your GPS data to help us track this counterfeit
                cluster?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setConsentModal(false)}
                  className="w-full py-4 bg-amber-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Share Location Data
                </button>
                <button
                  onClick={() => setConsentModal(false)}
                  className="w-full py-4 text-gray-600 font-bold text-[10px] uppercase"
                >
                  Deny & View Result
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Result Component
function ResultDisplay({ type, onReset }: any) {
  const isGenuine = type === "GENUINE";
  const isUsed = type === "USED";

  return (
    <div className="space-y-6">
      <div
        className={`p-8 rounded-[3rem] border ${
          isGenuine
            ? "bg-green-500/10 border-green-500/20"
            : isUsed
            ? "bg-amber-500/10 border-amber-500/20"
            : "bg-red-500/10 border-red-500/20"
        } text-center space-y-6`}
      >
        <div className="flex flex-col items-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
              isGenuine
                ? "border-green-500 text-green-500"
                : isUsed
                ? "border-amber-500 text-amber-500"
                : "border-red-500 text-red-500"
            }`}
          >
            {isGenuine ? (
              <CheckCircle2 size={40} />
            ) : isUsed ? (
              <History size={40} />
            ) : (
              <AlertTriangle size={40} />
            )}
          </div>
          <h2
            className={`mt-6 text-3xl font-black italic uppercase tracking-tighter ${
              isGenuine
                ? "text-green-500"
                : isUsed
                ? "text-amber-500"
                : "text-red-500"
            }`}
          >
            {type === "GENUINE"
              ? "Verified Safe"
              : type === "USED"
              ? "Reused Code"
              : "Counterfeit"}
          </h2>
        </div>
        <button
          onClick={onReset}
          className="w-full py-4 text-[10px] font-black uppercase text-gray-500 border border-white/10 rounded-2xl hover:text-white transition"
        >
          New Verification
        </button>
      </div>
    </div>
  );
}
