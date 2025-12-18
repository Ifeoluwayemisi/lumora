"use client";
import React, { useState } from "react";
import { Shield, HardDrive, Check, X } from "lucide-react";

export default function AdminSettings() {
  // ======= STATE =======
  const [counterfeitThreshold, setCounterfeitThreshold] = useState(5);
  const [autoReject, setAutoReject] = useState(true);
  const [systemKey, setSystemKey] = useState(
    "********************************"
  );
  const [saveStatus, setSaveStatus] = useState<null | "success" | "error">(
    null
  );

  // ======= HANDLERS =======
  const handleSave = () => {
    // Here you'd send data to API
    try {
      // Simulate API call
      console.log({
        counterfeitThreshold,
        autoReject,
        systemKey,
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000); // Reset after 3s
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const toggleAutoReject = () => setAutoReject(!autoReject);

  // ======= RENDER =======
  return (
    <div className="p-8 max-w-4xl space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black italic uppercase">
          System Configuration
        </h1>
        <p className="text-gray-500 text-sm">
          Technical parameters and system-wide security policies.
        </p>
      </div>

      <div className="space-y-6">
        {/* Security Thresholds */}
        <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="text-green-500" />
            <h3 className="font-bold text-lg">Security Thresholds</h3>
          </div>

          <div className="space-y-6">
            {/* Counterfeit Alert Sensitivity */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold">
                  Counterfeit Alert Sensitivity
                </p>
                <p className="text-[10px] text-gray-500 italic">
                  Threshold of duplicate scans before locking a batch.
                </p>
              </div>
              <input
                type="number"
                min={1}
                value={counterfeitThreshold}
                onChange={(e) =>
                  setCounterfeitThreshold(Number(e.target.value))
                }
                className="bg-black border border-white/10 w-20 p-2 rounded-lg text-center font-bold"
              />
            </div>

            <div className="h-[1px] bg-white/5" />

            {/* Auto-Rejection Toggle */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold">Manufacturer Auto-Rejection</p>
                <p className="text-[10px] text-gray-500 italic">
                  Automatically reject brands with AI trust scores below 30%.
                </p>
              </div>
              <div
                onClick={toggleAutoReject}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition ${
                  autoReject ? "bg-green-600" : "bg-gray-500/30"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    autoReject ? "right-1" : "left-1"
                  }`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* API Connectivity */}
        <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <HardDrive className="text-blue-500" />
            <h3 className="font-bold text-lg">API Connectivity</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl font-mono text-[10px] text-gray-400 flex-1 truncate">
              LUMORA_SYSTEM_KEY: {systemKey}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(systemKey)}
              className="px-3 py-1 bg-green-600 rounded-xl text-white text-xs font-bold hover:bg-green-500 transition"
            >
              Copy
            </button>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 rounded-xl font-bold text-white hover:bg-green-500 transition"
          >
            Save Settings
          </button>
          {saveStatus === "success" && (
            <span className="text-green-400 font-bold flex items-center gap-1">
              <Check size={16} /> Saved successfully
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-red-400 font-bold flex items-center gap-1">
              <X size={16} /> Save failed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
