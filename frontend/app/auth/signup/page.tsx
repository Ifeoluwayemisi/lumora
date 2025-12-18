"use client";
import React, { useState } from "react";
import Link from "next/link";
import { User, Factory, ShieldCheck, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [role, setRole] = useState<"user" | "manufacturer" | null>(null);

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Initialize Account
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
            Select your access level to the protocol
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Consumer Option */}
          <button
            onClick={() => setRole("user")}
            className={`p-8 rounded-[2.5rem] border-2 transition-all text-left flex items-center gap-6 ${
              role === "user"
                ? "border-green-500 bg-green-500/5"
                : "border-white/5 bg-white/5 hover:border-white/20"
            }`}
          >
            <div
              className={`p-4 rounded-2xl ${
                role === "user"
                  ? "bg-green-500 text-black"
                  : "bg-black text-white"
              }`}
            >
              <User size={24} />
            </div>
            <div>
              <h3 className="font-black uppercase italic tracking-tighter">
                Consumer
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase">
                Verify meds & track history
              </p>
            </div>
          </button>

          {/* Manufacturer Option */}
          <button
            onClick={() => setRole("manufacturer")}
            className={`p-8 rounded-[2.5rem] border-2 transition-all text-left flex items-center gap-6 ${
              role === "manufacturer"
                ? "border-green-500 bg-green-500/5"
                : "border-white/5 bg-white/5 hover:border-white/20"
            }`}
          >
            <div
              className={`p-4 rounded-2xl ${
                role === "manufacturer"
                  ? "bg-green-500 text-black"
                  : "bg-black text-white"
              }`}
            >
              <Factory size={24} />
            </div>
            <div>
              <h3 className="font-black uppercase italic tracking-tighter">
                Manufacturer
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase">
                Generate codes & protect brand
              </p>
            </div>
          </button>
        </div>

        {role && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-green-500 font-bold text-xs"
            />
            <input
              type="password"
              placeholder="SECURE PASSWORD"
              className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-green-500 font-bold text-xs"
            />
            {role === "manufacturer" && (
              <input
                type="text"
                placeholder="COMPANY / PHARMA NAME"
                className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-green-500 font-bold text-xs"
              />
            )}
            <Link
              href={
                role === "user" ? "/dashboard/user" : "/dashboard/manufacturer"
              }
              className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-green-500 transition-all"
            >
              Create Account <ArrowRight size={16} />
            </Link>
          </div>
        )}

        <p className="text-center text-[10px] font-black text-gray-600 uppercase">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-white hover:text-green-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
