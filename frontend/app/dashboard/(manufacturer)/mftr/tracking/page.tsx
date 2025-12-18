"use client";
import React from "react";
import {
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  BarChart,
} from "lucide-react";

export default function ProductTracking() {
  const trackingData = [
    {
      id: "BT-9921",
      name: "Paracetamol 500mg",
      status: "In-Transit",
      progress: 65,
      scans: 1202,
      flags: 2,
    },
    {
      id: "BT-4412",
      name: "Vitamin C Syrup",
      status: "Delivered",
      progress: 100,
      scans: 4500,
      flags: 0,
    },
    {
      id: "BT-1022",
      name: "Amoxicillin",
      status: "Production",
      progress: 15,
      scans: 0,
      flags: 0,
    },
  ];

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Supply Chain Tracking
        </h1>
        <p className="text-gray-500 text-sm font-medium">
          Monitor your batch distribution and market penetration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {trackingData.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.07] transition group"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-black rounded-2xl border border-white/5 text-green-500">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-[10px] font-mono text-gray-500 uppercase">
                    Batch ID: {item.id}
                  </p>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="flex-1 max-w-md w-full px-4">
                <div className="flex justify-between mb-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                  <span className={item.progress >= 0 ? "text-green-500" : ""}>
                    Produced
                  </span>
                  <span className={item.progress >= 50 ? "text-green-500" : ""}>
                    In-Market
                  </span>
                  <span
                    className={item.progress >= 100 ? "text-green-500" : ""}
                  >
                    Authenticated
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 shadow-[0_0_10px_#22c55e] transition-all duration-1000"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-8 text-center">
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                    Total Scans
                  </p>
                  <p className="text-lg font-black">{item.scans}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                    Threat Flags
                  </p>
                  <p
                    className={`text-lg font-black ${
                      item.flags > 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {item.flags}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
