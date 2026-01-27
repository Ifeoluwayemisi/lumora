"use client";
import { useState } from "react";

export default function AIProductGuide({
  guide,
  defaultExpanded = false,
  tone = "neutral",
  riskLevel = "LOW", // AUTO: LOW, MEDIUM, HIGH, VERY_HIGH
}) {
  // Auto-expand for high-risk scenarios (safety-first)
  const shouldAutoExpand =
    defaultExpanded || riskLevel === "HIGH" || riskLevel === "VERY_HIGH";
  const [expanded, setExpanded] = useState(shouldAutoExpand);
  if (!guide) return null;

  const toneClasses = {
    neutral:
      "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800",
    danger:
      "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
    caution:
      "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800",
  };

  return (
    <div
      className={`${toneClasses[tone] || toneClasses.neutral} p-4 rounded-lg mb-6`}
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          📋 Safety Guide
          {(riskLevel === "HIGH" || riskLevel === "VERY_HIGH") && (
            <span className="ml-2 text-xs font-bold text-red-600 dark:text-red-400">
              ⚠️ IMPORTANT
            </span>
          )}
        </h3>
        <button
          aria-expanded={expanded}
          className={`text-lg font-bold transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          ▼
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 text-sm text-gray-900 dark:text-gray-200">
          {guide.usageInstructions && guide.usageInstructions.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">How to Use:</p>
              <ul className="ml-4 space-y-1 list-disc">
                {guide.usageInstructions.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          )}

          {guide.safetyWarnings && guide.safetyWarnings.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">⚠️ Safety Warnings:</p>
              <ul className="ml-4 space-y-1 list-disc">
                {guide.safetyWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {guide.storageHandling && guide.storageHandling.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">Storage & Handling:</p>
              <ul className="ml-4 space-y-1 list-disc">
                {guide.storageHandling.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
