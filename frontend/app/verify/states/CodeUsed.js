"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ExpiryBadge from "@/components/ExpiryBadge";
import RiskScoreBadge from "@/components/RiskScoreBadge";
import AIInsights from "@/components/AIInsights";

export default function CodeUsed() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/verification/result?code=${code}`);
        const data = await res.json();
        setResult(data);

        logScan(data);
      } catch (err) {
        console.error("Failed to fetch code info:", err);
      } finally {
        setLoading(false);
      }
    };

    const logScan = async (data) => {
      let location = null;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            location = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
            sendLog(location, data);
          },
          () => sendLog(location, data)
        );
      } else {
        sendLog(location, data);
      }
    };

    const sendLog = async (location, data) => {
      try {
        await fetch("/verification/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            status: data?.status || "used",
            riskScore: data?.riskScore,
            timestamp: new Date().toISOString(),
            location,
          }),
        });
      } catch (err) {
        console.error("Failed to log scan:", err);
      }
    };

    if (code) fetchData();
  }, [code]);

  if (loading)
    return (
      <p className="text-center dark:text-white mt-6">
        Loading product assessment...
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-orange-500 dark:text-orange-400 mb-4">
        ⚠️ Code Already Used
      </h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        The scanned code <span className="font-mono">{code}</span> has already
        been used. Please be cautious.
      </p>

      {result?.product && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <p>
            <strong>Product Name:</strong> {result.product.name}
          </p>
          <p>
            <strong>Manufacturer:</strong> {result.product.manufacturer}
          </p>
          <p>
            <strong>Batch:</strong> {result.product.batch}
          </p>
          <ExpiryBadge expiryDate={result.product.expiryDate} />
        </div>
      )}

      {result?.riskScore && <RiskScoreBadge score={result.riskScore} visual />}
      {result?.aiInsights && <AIInsights insights={result.aiInsights} />}

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-md bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Back to Verify
        </button>
        <button
          onClick={() => (window.location.href = "/support")}
          className="px-6 py-3 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition"
        >
          Report a Problem
        </button>
      </div>
    </div>
  );
}
