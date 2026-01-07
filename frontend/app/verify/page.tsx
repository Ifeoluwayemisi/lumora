"use client";
import React, { useState } from "react";
import {
  QrCode,
  Keyboard,
  ShieldCheck,
  MapPin,
  Activity,
  Search,
  AlertTriangle,
  CheckCircle2,
  History,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// Mock authentication check (replace with real auth state)
const isAuthenticated = false;

export default function VerificationHub() {
  const router = useRouter();
  const [method, setMethod] = useState<"manual" | "qr">("manual"); // Manual first
  const [viewState, setViewState] = useState<"idle" | "verifying" | "result">(
    "idle"
  );
  const [scanResult, setScanResult] = useState<
    "GENUINE" | "USED" | "INVALID" | null
  >(null);
  const [loginModal, setLoginModal] = useState(false);

  const triggerVerify = () => {
    setViewState("verifying");
    setTimeout(() => {
      setScanResult("USED"); // demo
      setViewState("result");
    }, 2000);
  };

  const handleMethodChange = (selected: "manual" | "qr") => {
    if (selected === "qr" && !isAuthenticated) {
      setLoginModal(true);
      return;
    }
    setMethod(selected);
  };
  
  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-12">
      <div className="max-w-xl mx-auto space-y-8">
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
                onClick={() => handleMethodChange("manual")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase transition ${
                  method === "manual"
                    ? "bg-green-500 text-black shadow-xl shadow-green-500/20"
                    : "text-gray-500"
                }`}
              >
                <Keyboard size={16} /> Manual Input
              </button>
              <button
                onClick={() => handleMethodChange("qr")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase transition ${
                  method === "qr"
                    ? "bg-green-500 text-black shadow-xl shadow-green-500/20"
                    : "text-gray-500"
                }`}
              >
                <QrCode size={16} /> QR Scanner
              </button>
            </div>

            {/* Manual Verification */}
            {method === "manual" && (
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
              </div>
            )}

            {/* QR Scanner */}
            {method === "qr" && isAuthenticated && (
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
          <div className="animate-in zoom-in duration-500 space-y-6">
            <ResultDisplay
              type={scanResult}
              onReset={() => setViewState("idle")}
            />
          </div>
        )}
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {loginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#0A0A0A] border border-white/10 p-8 md:p-12 rounded-[3rem] max-w-sm w-full space-y-6 text-center shadow-2xl relative">
              {/* Exit Button */}
              <button
                onClick={() => setLoginModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              >
                ✕
              </button>

              <h2 className="text-xl font-black uppercase italic">
                Login Required
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                You must be logged in to use the QR scanner. Please login or
                continue with Manual Verification.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setLoginModal(false);
                    router.push("/auth/login");
                  }}
                  className="w-full py-4 bg-green-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setLoginModal(false);
                    setMethod("manual");
                  }}
                  className="w-full py-4 text-gray-600 font-bold text-[10px] uppercase"
                >
                  Use Manual Verification
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ResultDisplay remains the same as your previous implementation
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
