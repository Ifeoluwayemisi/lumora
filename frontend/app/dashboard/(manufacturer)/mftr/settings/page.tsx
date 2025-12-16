"use client";
import React from "react";
import { Settings, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Dashboard/Sidebar"; // your sidebar component

export default function SettingsPage() {
  const accountStatus: "PENDING" | "VERIFIED" | "REJECTED" = "PENDING";

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <Sidebar status={accountStatus} />

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard/manufacturer"
          className="flex items-center gap-2 text-green-500 mb-6 hover:underline"
        >
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="relative group overflow-hidden bg-white/5 border border-white/10 rounded-[2.5rem] p-12 text-center">
          {/* Gradient hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Animated Settings Icon */}
          <Settings
            className="mx-auto mb-4 text-gray-600 animate-pulse-slow"
            size={64}
          />

          <h3 className="text-2xl font-bold text-white mb-2">
            Advanced Security Settings
          </h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            We are currently refining the 2FA and API integration modules. This
            feature will be available in the next release.
          </p>

          {/* Animated Coming Soon Badge */}
          <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse-slow">
            Coming Soon
          </div>
        </div>
      </main>
    </div>
  );
}
