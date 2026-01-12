import ExpiryBadge from "@/components/ExpiryBadge";
import { useState, useEffect } from "react";

export default function Genuine({ code, product }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Log scan details to backend
  useEffect(() => {
    const logScan = async () => {
      let location = null;

      // Get geolocation if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            sendLog(location);
          },
          (error) => {
            console.warn("Geolocation error:", error);
            sendLog(location); // send even if location unavailable
          }
        );
      } else {
        sendLog(location); // send without location
      }
    };

    const sendLog = async (location) => {
      try {
        await fetch("/verification/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            timestamp: new Date().toISOString(),
            location,
            status: "genuine",
          }),
        });
      } catch (err) {
        console.error("Failed to log scan:", err);
      }
    };

    logScan();
  }, [code]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">
        ✅ Genuine Product
      </h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        The scanned code <span className="font-mono">{code}</span> is registered
        and has not been used before. Safe to use.
      </p>

      {product && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <p>
            <strong>Product Name:</strong> {product.name}
          </p>
          <p>
            <strong>Manufacturer:</strong> {product.manufacturer}
          </p>
          <p>
            <strong>Batch:</strong> {product.batch}
          </p>
          <ExpiryBadge expiryDate={product.expiryDate} />
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-md bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Back to Verify
        </button>
        <button
          onClick={handleCopy}
          className="px-6 py-3 rounded-md bg-green-500 text-white hover:bg-green-600 transition"
        >
          {copied ? "Copied!" : "Copy Code"}
        </button>
        <button
          onClick={() => alert("Feature coming soon!")}
          className="px-6 py-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          Save Product
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Tip: Keep this product information for your records or share it with
        friends to verify authenticity.
      </p>
    </div>
  );
}
