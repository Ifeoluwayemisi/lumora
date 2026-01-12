"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ExpiryBadge from "@/components/ExpiryBadge";
import RiskScoreBadge from "@/components/RiskScoreBadge";
import AIInsights from "@/components/AIInsights";

export default function UnregisteredProduct() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch product info & risk/AI insights
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/verification/result?code=${code}`);
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (code) fetchData();
  }, [code]);

  // Log scan details (timestamp + location)
  useEffect(() => {
    const logScan = async () => {
      let location = null;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            location = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
            sendLog(location);
          },
          (err) => {
            console.warn("Geolocation error:", err);
            sendLog(location);
          }
        );
      } else sendLog(location);

      async function sendLog(location) {
        try {
          await fetch("/api/scan/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code,
              timestamp: new Date().toISOString(),
              location,
              status: "unregistered",
            }),
          });
        } catch (err) {
          console.error("Failed to log scan:", err);
        }
      }
    };
    if (code) logScan();
  }, [code]);

  if (loading)
    return (
      <div className="flex flex-col items-center p-4 pt-12 w-full max-w-3xl">
        <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-4"></div>
        <div className="w-full h-6 bg-gray-200 dark:bg-gray-600 rounded-md animate-pulse mb-2"></div>
        <div className="w-full h-6 bg-gray-200 dark:bg-gray-600 rounded-md animate-pulse mb-2"></div>
        <div className="w-full h-6 bg-gray-200 dark:bg-gray-600 rounded-md animate-pulse mb-2"></div>
        <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mt-4"></div>
      </div>
    );

  return (
    <div className="flex flex-col items-center p-4 pt-12">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-8 py-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🟡 Unregistered Product
          </h1>
          <p className="text-yellow-100 text-sm">
            The scanned code <span className="font-mono">{code}</span> is not
            registered with Lumora.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {result?.product && (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
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

          {/* Risk Score */}
          {result?.riskScore && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-md">
              <h2 className="font-semibold mb-2">Risk Score</h2>
              <RiskScoreBadge score={result.riskScore} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Higher score → higher risk
              </p>
            </div>
          )}

          {/* AI Insights */}
          {result?.aiInsights && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-800 rounded-md">
              <h2 className="font-semibold mb-2">AI Insights</h2>
              <AIInsights insights={result.aiInsights} />
            </div>
          )}

          {/* Hotspot Prediction */}
          {result?.hotspotPrediction && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Predicted hotspot for this product: {result.hotspotPrediction}
            </p>
          )}

          {/* Buttons + CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 rounded-md bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            >
              Back to Verify
            </button>
            <button
              onClick={() => (window.location.href = "/support")}
              className="px-6 py-3 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition"
            >
              Report a Problem
            </button>
            <button
              onClick={() => alert("Feature coming soon!")}
              className="px-6 py-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              Save Scan
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Tip: Keep this product info to share with support or track
            suspicious items.
          </p>
        </div>
      </div>
    </div>
  );
}
