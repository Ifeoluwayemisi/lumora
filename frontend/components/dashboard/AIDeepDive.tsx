"use client";
import { ShieldAlert, Zap, Cpu, Database, FileSearch } from "lucide-react";

export default function AIDeepDive({ reportId = "AN-9921", riskLevel = "HIGH", }) { 
  const analysisLayers = [
    {
      engine: "Visual Integrity",
      icon: Cpu,
      status: "FAILED",
      detail:
        "Detected pixel manipulation around the NAFDAC logo area (ELA Analysis).",
      score: 22,
    },
    {
      engine: "Metadata & XIF",
      icon: FileSearch,
      status: "CLEAN",
      detail:
        "Document was created using a standard scanner; no suspicious software tags.",
      score: 98,
    },
    {
      engine: "Registry Sync",
      icon: Database,
      status: "WARNING",
      detail:
        "Manufacturer name matches, but Registration Number is assigned to a different SKU.",
      score: 45,
    },
  ];

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-8 space-y-8 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-600/20 p-2 rounded-lg text-red-500">
            <ShieldAlert size={20} />
          </div>
          <h2 className="text-xl font-bold italic tracking-tighter uppercase">
            Forensic Report: {reportId}
          </h2>
        </div>
        <div className="px-4 py-1 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse">
          {riskLevel} RISK DETECTED
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analysisLayers.map((layer, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/[0.07] transition group"
          >
            <layer.icon
              className={`mb-4 ${
                layer.status === "FAILED"
                  ? "text-red-500"
                  : layer.status === "WARNING"
                  ? "text-amber-500"
                  : "text-green-500"
              }`}
              size={24}
            />
            <h4 className="font-bold text-sm mb-1">{layer.engine}</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed mb-4">
              {layer.detail}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Confidence
              </span>
              <span
                className={`text-xs font-black ${
                  layer.score < 50 ? "text-red-500" : "text-green-500"
                }`}
              >
                {layer.score}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 🔗 BACKEND_NODEJS_CONNECTION: 
          This logic would be powered by a Python service (FastAPI) or Node.js 
          connecting to an AI Vision API. The Admin's "Approve" button here would 
          write to the `audit_logs` table stating: "Admin ID #1 manually overrode AI Warning". */}

      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-4">
        <Zap className="text-amber-500 shrink-0" size={20} />
        <p className="text-[11px] text-amber-200/70 italic">
          AI Suggestion: Reject application. Significant mismatch in Registry
          Sync engine suggests identity theft.
        </p>
      </div>
    </div>
  );
}