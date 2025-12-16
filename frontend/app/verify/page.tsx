"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";

import MethodToggle from "../../components/verify/MethodToggle";
import ManualVerifyForm from "../../components/verify/ManualVerifyForm";
import QrScanner from "../../components/verify/QrScanner";
import VerificationResult from "../../components/verify/VerificationResult";
import { VerificationResult as ResultType } from "../../libs/type";

export default function VerifyPage() {
  const [method, setMethod] = useState<"manual" | "qr">("manual");
  const [productCode, setProductCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);

  const verifyCode = async (code: string) => {
    setLoading(true);

    // 🔗 BACKEND_NODEJS_CONNECTION
    // Replace this with your actual API call
    setTimeout(() => {
      setLoading(false);
      setResult({
        status: "GENUINE",
        name: "Glow-Skin Serum",
        manufacturer: "NatureCare Ltd",
        expiry: "2026-12-30",
      });
    }, 1500);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(productCode);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="pt-32 px-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Verify Product</h1>
        <p className="text-gray-400 mb-8">
          Choose a method to check your product's authenticity.
        </p>

        {/* Method Toggle */}
        <MethodToggle method={method} setMethod={setMethod} />

        {/* Verification Area */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
          {method === "manual" ? (
            <ManualVerifyForm
              productCode={productCode}
              setProductCode={setProductCode}
              loading={loading}
              onVerify={handleVerify}
            />
          ) : (
            <QrScanner
              onScan={(code: string) => {
                setProductCode(code);
                verifyCode(code);
              }}
            />
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <VerificationResult result={result} reset={() => setResult(null)} />
          </div>
        )}
      </main>
    </div>
  );
}
