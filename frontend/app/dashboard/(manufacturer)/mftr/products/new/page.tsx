"use client";
import React, { useState } from "react";
import {
  Plus,
  UploadCloud,
  Info,
  CheckCircle2,
  Beaker,
  FileText,
  Camera,
} from "lucide-react";

export default function ProductOnboarding() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header & Progress */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Register New Product
          </h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mt-1">
            Digital Identity Creation • Phase {step} of 3
          </p>
        </div>

        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                step >= i
                  ? "bg-green-500 shadow-[0_0_10px_#22c55e]"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: The Form Interface */}
        <div className="lg:col-span-2 space-y-8 bg-white/5 border border-white/10 p-10 rounded-[3rem]">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 text-green-500 mb-2">
                <Info size={18} />
                <h3 className="font-black uppercase tracking-widest text-xs">
                  Basic Product Info
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Panadol"
                    className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500 text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-2">
                    Generic Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paracetamol"
                    className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500 text-sm font-bold text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 px-2">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe dosage and intended use..."
                  className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500 text-sm font-bold"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 text-blue-500 mb-2">
                <Beaker size={18} />
                <h3 className="font-black uppercase tracking-widest text-xs">
                  Scientific Specifications
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-2">
                    NAFDAC Reg No.
                  </label>
                  <input
                    type="text"
                    placeholder="01-XXXX"
                    className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500 text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-2">
                    Dosage Form
                  </label>
                  <select className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500 text-sm font-bold">
                    <option>Tablet</option>
                    <option>Syrup</option>
                    <option>Injection</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 text-amber-500 mb-2">
                <Camera size={18} />
                <h3 className="font-black uppercase tracking-widest text-xs">
                  Visual Verification Assets
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3 hover:border-green-500/50 transition cursor-pointer group">
                  <div className="p-4 bg-white/5 rounded-full group-hover:bg-green-500 transition">
                    <UploadCloud size={24} className="group-hover:text-black" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-gray-500">
                    Product Image (Front)
                  </p>
                </div>
                <div className="border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3 hover:border-green-500/50 transition cursor-pointer group">
                  <div className="p-4 bg-white/5 rounded-full group-hover:bg-green-500 transition">
                    <FileText size={24} className="group-hover:text-black" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-gray-500">
                    Lab Analysis Report
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-8 flex justify-between border-t border-white/5">
            <button
              disabled={step === 1}
              onClick={() => setStep((s) => s - 1)}
              className="px-8 py-4 text-xs font-black uppercase text-gray-500 hover:text-white transition disabled:opacity-0"
            >
              Back
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-500 transition"
              >
                Next Step
              </button>
            ) : (
              <button className="px-10 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:bg-green-500 transition">
                Submit for Admin Review
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Preview Card */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-2">
            Consumer View Preview
          </h3>
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-6 sticky top-8">
            <div className="aspect-square bg-white/5 rounded-3xl flex items-center justify-center border border-white/5">
              <Camera size={40} className="text-white/10" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-4 w-1/2 bg-white/5 rounded-md animate-pulse" />
            </div>
            <div className="pt-6 border-t border-white/5 flex justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-gray-500 uppercase">
                  Status
                </span>
                <span className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1">
                  <CheckCircle2 size={10} /> Pending
                </span>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-black text-gray-500 uppercase">
                  Origin
                </span>
                <span className="text-[10px] font-black text-white uppercase block">
                  Nigeria
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
