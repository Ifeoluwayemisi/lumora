"use client";
import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  Award,
  MapPin,
  Star,
  ChevronRight,
  Pill,
} from "lucide-react";

const BRANDS = [
  {
    id: 1,
    name: "NatureCare Pharma",
    category: "General Meds",
    rating: 4.9,
    verified: true,
    products: 42,
    location: "Lagos, NG",
  },
  {
    id: 2,
    name: "Global Meds Ltd",
    category: "Antibiotics",
    rating: 4.7,
    verified: true,
    products: 18,
    location: "Kano, NG",
  },
  {
    id: 3,
    name: "Dangote Healthcare",
    category: "Supplements",
    rating: 4.8,
    verified: true,
    products: 124,
    location: "Ibadan, NG",
  },
  {
    id: 4,
    name: "Vitalis Labs",
    category: "Pediatrics",
    rating: 4.6,
    verified: true,
    products: 9,
    location: "Enugu, NG",
  },
];

export default function TrustedBrands() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-8 pb-10 animate-in fade-in duration-700">
      {/* Search & Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Trusted Brands
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
            Lumora Certified Manufacturers
          </p>
        </div>

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
            size={18}
          />
          <input
            type="text"
            placeholder="Search verified manufacturers..."
            className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-green-500 transition-all text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Featured Badge */}
      <div className="bg-gradient-to-br from-green-600/20 to-emerald-900/20 border border-green-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
        <Award className="absolute -right-4 -top-4 text-green-500/10 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        <div className="relative z-10 space-y-4">
          <span className="bg-green-500 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            Top Rated 2025
          </span>
          <h2 className="text-2xl font-black italic uppercase leading-tight">
            NatureCare <br /> Pharmaceuticals
          </h2>
          <p className="text-xs text-gray-400 font-medium">
            99.9% Authenticity Rating across 1.2M verified units this year.
          </p>
        </div>
      </div>

      {/* Brand List */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] px-2">
          Verified Directory
        </h3>

        {BRANDS.filter((b) =>
          b.name.toLowerCase().includes(search.toLowerCase())
        ).map((brand) => (
          <div
            key={brand.id}
            className="bg-white/5 border border-white/5 rounded-[2rem] p-5 flex items-center justify-between group hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black border border-white/10 rounded-2xl flex items-center justify-center text-green-500">
                <Pill size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">{brand.name}</h4>
                  <ShieldCheck size={14} className="text-blue-400" />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">
                    {brand.category}
                  </span>
                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                  <div className="flex items-center gap-1 text-[9px] text-amber-500 font-black">
                    <Star size={10} fill="currentColor" /> {brand.rating}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-white">
                  {brand.products} Items
                </p>
                <p className="text-[8px] font-bold text-gray-500 uppercase">
                  {brand.location}
                </p>
              </div>
              <div className="p-2 bg-white/5 rounded-xl group-hover:bg-white/10 transition">
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Disclaimer */}
      <div className="p-6 border border-dashed border-white/10 rounded-[2rem] text-center">
        <p className="text-[9px] text-gray-600 font-bold uppercase leading-relaxed italic">
          All brands listed here have undergone a multi-stage <br /> NAFDAC &
          Lumora cryptographic verification process.
        </p>
      </div>
    </div>
  );
}
