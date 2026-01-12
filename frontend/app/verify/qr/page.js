"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

export default function QRVerifyPage() {
  const [scanResult, setScanResult] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleScan = async (data) => {
    if (!data) return;
    setScanResult(data);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verification/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: data }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Verification failed");

      // Redirect to dynamic result page
      router.push(`/verify/result?code=${data}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError("QR Scan failed. Try again.");
  };

  return (
    <div className="flex flex-col items-center p-4 pt-6 md:pt-12">
      <h1 className="text-2xl font-bold dark:text-white mb-4">Scan QR Code</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Point your camera at the Lumora QR code to verify instantly.
      </p>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
        <QrReader
          onResult={(result, error) => {
            if (!!result) handleScan(result?.text);
            if (!!error) handleError(error);
          }}
          constraints={{ facingMode: "environment" }}
          className="rounded-md"
        />
      </div>

      {loading && <p className="mt-4 dark:text-white">Verifying...</p>}
    </div>
  );
}
