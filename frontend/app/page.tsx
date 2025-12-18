"use client";
import Navbar from "@/components/Navbar";
import {
  ArrowRight,
  Zap,
  MapPin,
  Search,
  ShieldCheck,
  Activity,
  Globe,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="bg-[#050505] text-white min-h-screen selection:bg-green-500 selection:text-black">
      <Navbar />

      {/* 🟢 HERO SECTION */}
      <section className="relative pt-36 md:pt-40 pb-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 md:gap-3 px-3 py-1 md:px-4 md:py-2 border border-white/10 rounded-full bg-white/5 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-gray-300">
              Live: Cryptographic Ledger Active
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter uppercase italic leading-snug md:leading-[0.9]">
            The End of <br />
            <span className="text-green-500">Counterfeit</span> Medicine.
          </h1>

          <p className="text-gray-400 max-w-xl mx-auto text-xs sm:text-sm md:text-base font-medium leading-relaxed">
            Lumora deploys bank-grade cryptographic verification to ensure every
            tablet, bottle, and box in Nigeria is authentic.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4">
            <a
              href="/verify"
              className="bg-white text-black px-6 sm:px-10 py-3 sm:py-5 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-green-500 transition-all flex items-center justify-center gap-2 sm:gap-3 group"
            >
              Start Verification{" "}
              <Search
                size={16}
                className="group-hover:rotate-12 transition-transform"
              />
            </a>
            <a
              href="/auth/signup"
              className="border border-white/10 bg-white/5 backdrop-blur-sm px-6 sm:px-10 py-3 sm:py-5 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-white/10 transition-all"
            >
              Manufacturer Portal
            </a>
          </div>
        </div>
      </section>

      {/* 🏛️ QUICK SCAN TERMINAL */}
      <section className="max-w-4xl mx-auto px-6 -mt-8 sm:-mt-12 relative z-20">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-2xl shadow-green-500/5">
          <div className="flex items-center gap-2 mb-4 md:mb-6 ml-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            <span className="text-[8px] sm:text-[10px] font-mono text-gray-600 ml-3 sm:ml-4">
              VERIFICATION_TERMINAL_V2.0
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="INPUT BATCH OR PRODUCT HASH..."
                className="w-full bg-black border border-white/5 p-4 sm:p-6 rounded-2xl font-mono text-green-500 text-sm sm:text-lg focus:border-green-500/50 outline-none transition-all placeholder:text-gray-800"
              />
            </div>
            <button className="bg-green-500 text-black px-8 sm:px-12 py-3 sm:py-6 rounded-2xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-xs hover:bg-white transition-all">
              Verify
            </button>
          </div>
        </div>
      </section>

      {/* 📊 REAL-TIME COUNTER SECTION */}
      <section className="py-16 md:py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          {[
            {
              label: "Secured Units",
              value: "2.4M+",
              icon: Lock,
              color: "text-white",
            },
            {
              label: "Verification Latency",
              value: "0.8s",
              icon: Activity,
              color: "text-green-500",
            },
            {
              label: "Fraud Intercepted",
              value: "14.2K",
              icon: ShieldCheck,
              color: "text-red-500",
            },
            {
              label: "Active Pharmacies",
              value: "890",
              icon: MapPin,
              color: "text-white",
            },
          ].map((stat, i) => (
            <div key={i} className="space-y-2 md:space-y-4">
              <stat.icon size={20} className={stat.color} />
              <div>
                <h3
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tighter ${stat.color}`}
                >
                  {stat.value}
                </h3>
                <p className="text-[8px] sm:text-[10px] font-black uppercase text-gray-600 tracking-widest mt-1">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🛡️ FEATURES GRID */}
      <section className="py-16 md:py-32 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard
            icon={<Zap className="text-green-500" />}
            title="Instant Audit"
            desc="One scan triggers a multi-node check against the manufacturer's original signature."
          />
          <FeatureCard
            icon={<Globe className="text-blue-500" />}
            title="Geospatial Alerts"
            desc="Identify fake drug distribution clusters in real-time to protect local communities."
          />
          <FeatureCard
            icon={<ShieldCheck className="text-purple-500" />}
            title="Chain of Custody"
            desc="Every product has a digital birth certificate, tracking it from factory floor to pharmacy shelf."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 sm:p-10 rounded-2xl md:rounded-[3rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-xl md:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-white/10 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter mb-2 sm:mb-4">
        {title}
      </h3>
      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}
