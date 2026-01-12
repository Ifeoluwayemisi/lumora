"use client";
import { useState } from "react";
import QRCode from "qrcode.react";

export default function GenerateBatch({ dailyLimit, codesToday }) {
  const [batchSize, setBatchSize] = useState(1);
  const [generated, setGenerated] = useState([]);

  const generateCodes = async () => {
    const res = await fetch("/api/manufacturer/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: batchSize }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.message || "Error generating codes");
    else setGenerated(data.codes);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow space-y-4 border dark:border-gray-600">
      <h2 className="text-xl font-semibold mb-2">Generate Codes</h2>
      <p>
        Daily limit: {dailyLimit} | Generated today: {codesToday}
      </p>

      <input
        type="number"
        min={1}
        max={dailyLimit - codesToday}
        value={batchSize}
        onChange={(e) => setBatchSize(Number(e.target.value))}
        className="border p-2 rounded w-20"
      />

      <button
        onClick={generateCodes}
        className="px-4 py-2 bg-genuine text-white rounded hover:bg-green-600 transition"
      >
        Generate
      </button>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {generated.map((code) => (
          <div
            key={code}
            className="p-2 bg-gray-50 dark:bg-gray-700 rounded flex flex-col items-center"
          >
            <p className="font-semibold">{code}</p>
            <QRCode value={code} size={64} />
          </div>
        ))}
      </div>
    </div>
  );
}
