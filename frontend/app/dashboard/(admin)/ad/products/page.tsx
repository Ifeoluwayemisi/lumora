"use client";
import React from "react";
import { Package, Search, ChevronRight } from "lucide-react";

export default function AdminProducts() {
  const products = [
    {
      id: "P-01",
      name: "Paracetamol 500mg",
      mfr: "NatureCare",
      category: "Analgesic",
      batches: 12,
    },
    {
      id: "P-02",
      name: "Amoxicillin 250mg",
      mfr: "Global Meds",
      category: "Antibiotic",
      batches: 5,
    },
    {
      id: "P-03",
      name: "Vitamin C Syrup",
      mfr: "Dangote Pharma",
      category: "Supplement",
      batches: 22,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black italic uppercase">
          Product Registry
        </h1>
        <div className="bg-white/5 border border-white/10 p-2 rounded-xl">
          <Search size={18} className="text-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:border-green-500/50 transition group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-green-500 transition">
                <Package
                  className="text-white group-hover:text-black"
                  size={24}
                />
              </div>
              <span className="text-[10px] font-mono text-gray-500">
                {p.id}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">{p.name}</h3>
            <p className="text-xs text-gray-500 mb-6 font-medium italic">
              By {p.mfr}
            </p>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-6 border-t border-white/5">
              <span className="text-gray-500">{p.category}</span>
              <span className="text-white">{p.batches} Batches Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
