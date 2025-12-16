"use client";
import React from "react";
import {
  Camera,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

const mockReports = [
  {
    id: "REP-001",
    product: "Glow-Skin Vit C Serum",
    location: "Ikeja, Lagos",
    date: "2025-12-10",
    reason: "Packaging color looks faded",
    imageUrl: "/mock-fake-product.jpg",
    status: "UNDER_REVIEW",
  },
];

export default function UserReportsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Consumer Incident Reports
        </h1>
        <p className="text-gray-400">
          Review photos and feedback from users who flagged suspicious items.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockReports.map((report) => (
          <div
            key={report.id}
            className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row"
          >
            {/* Image Placeholder */}
            <div className="w-full md:w-48 bg-white/10 flex items-center justify-center relative group">
              <Camera
                size={32}
                className="text-gray-600 group-hover:text-green-500 transition"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-[10px] font-bold uppercase">
                  View Photo
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white">{report.product}</h3>
                  <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase font-bold tracking-widest border border-amber-500/20">
                    Flagged by User
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  #{report.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin size={14} /> {report.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} /> {report.date}
                </div>
              </div>

              <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                <p className="text-xs text-gray-300 italic italic">
                  "{report.reason}"
                </p>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-xl text-xs font-bold transition">
                  Mark as Verified Fake
                </button>
                <button className="p-2 border border-white/10 rounded-xl hover:bg-white/5">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
