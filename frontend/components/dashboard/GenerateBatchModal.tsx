// components/Dashboard/GenerateBatchModal.tsx
"use client";
import { useState } from "react";
import { X, Wand2, Download, CheckCircle } from "lucide-react";

export default function GenerateBatchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [batchData, setBatchData] = useState({ name: "", quantity: 100 });

  const handleGenerate = () => {
    // 🔗 BACKEND_NODEJS_CONNECTION:
    // This will eventually call your Node.js API to create codes and save them to MySQL.
    setStep("success");
  };

  const downloadCSV = () => {
    // Frontend logic to generate and download a CSV file of random codes
    const headers = "Product,BatchID,Code,URL\n";
    const rows = Array.from({ length: 10 })
      .map(
        (_, i) =>
          `${batchData.name},BTCH-${Math.random()
            .toString(36)
            .toUpperCase()
            .substring(2, 7)},LUM-${Math.random()
            .toString(36)
            .toUpperCase()
            .substring(2, 10)},https://lumora.ng/verify`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `lumora_batch_${batchData.name}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-500 hover:text-white"
        >
          <X size={24} />
        </button>

        {step === "form" ? (
          <div className="animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-bold mb-2">Generate New Batch</h2>
            <p className="text-gray-400 text-sm mb-6">
              Create unique authentication codes for your products.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500 text-white"
                  placeholder="e.g. Paracetamol 500mg"
                  onChange={(e) =>
                    setBatchData({ ...batchData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Quantity (Max 10,000)
                </label>
                <input
                  type="number"
                  className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-green-500 text-white"
                  placeholder="1000"
                  onChange={(e) =>
                    setBatchData({
                      ...batchData,
                      quantity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <button
                onClick={handleGenerate}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition mt-4"
              >
                <Wand2 size={20} /> Generate Secure Codes
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Batch Generated!</h2>
            <p className="text-gray-400 text-sm mb-8">
              {batchData.quantity} unique codes have been encrypted and prepared
              for your {batchData.name} batch.
            </p>

            <div className="space-y-3">
              <button
                onClick={downloadCSV}
                className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
              >
                <Download size={20} /> Download CSV (Codes)
              </button>
              <button className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition">
                Download QR Labels (PDF)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
