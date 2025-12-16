"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Upload,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    nafdacNo: "",
    companyAddress: "",
    certificateUrl: "",
  });

  const handleComplete = async () => {
    // 🔗 BACKEND_NODEJS_CONNECTION
    // 1. POST request to /api/manufacturer/complete-profile
    // 2. Set 'hasCompletedOnboarding' to true in MySQL
    // 3. Redirect to Dashboard
    router.push("/dashboard/manufacturer");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-24 rounded-full transition-all ${
                step >= i ? "bg-green-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl shadow-2xl">
          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Legal Identity</h1>
                <p className="text-gray-400">
                  This name must match your registration certificate. It can
                  only be set once.
                </p>
              </header>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Official Business Name
                  </label>
                  <div className="relative">
                    <Building2
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                      size={20}
                    />
                    <input
                      type="text"
                      className="w-full bg-black/50 border border-white/10 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-green-500 transition"
                      placeholder="e.g. Dangote Pharmaceuticals"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                    NAFDAC / Reg Number
                  </label>
                  <div className="relative">
                    <FileText
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                      size={20}
                    />
                    <input
                      type="text"
                      className="w-full bg-black/50 border border-white/10 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-green-500 transition"
                      placeholder="e.g. B4-0021"
                      onChange={(e) =>
                        setFormData({ ...formData, nafdacNo: e.target.value })
                      }
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.businessName || !formData.nafdacNo}
                  className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition disabled:opacity-30"
                >
                  Continue to Verification <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4">
              <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">License Upload</h1>
                <p className="text-gray-400">
                  Upload your NAFDAC certificate for AI-powered authenticity
                  analysis.
                </p>
              </header>

              <div className="space-y-6">
                <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-12 text-center hover:border-green-500/50 transition relative group">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={() => {
                      setIsAnalyzing(true);
                      setTimeout(() => setIsAnalyzing(false), 3000);
                    }}
                  />
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                    <Upload className="text-gray-400" size={28} />
                  </div>
                  <p className="font-medium">Drop your certificate here</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">
                    PDF or High-Res Image (Max 10MB)
                  </p>
                </div>

                {isAnalyzing && (
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-green-500 font-bold uppercase tracking-widest">
                      AI AI Running Forgery Detection...
                    </p>
                  </div>
                )}

                <div className="p-4 bg-white/5 rounded-2xl flex gap-3 items-start">
                  <ShieldCheck className="text-green-500 shrink-0" size={20} />
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    By finishing, you confirm that{" "}
                    <strong>{formData.businessName}</strong> is the legal owner
                    of the provided NAFDAC Number. Forgery is a punishable
                    offense.
                  </p>
                </div>

                <button
                  onClick={handleComplete}
                  className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-bold transition shadow-lg shadow-green-900/20"
                >
                  Finish & Enter Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-widest">
          Secured by Lumora Regulatory Intelligence
        </p>
      </div>
    </div>
  );
}
