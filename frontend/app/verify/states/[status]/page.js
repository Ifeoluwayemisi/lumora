"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import api from "@/services/api";
import Genuine from "../Genuine";
import CodeUsed from "../CodeUsed";
import Invalid from "../Invalid";
import Suspicious from "../Suspicious";
import Unregistered from "../Unregistered";

function StatePageContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const isReverify = searchParams.get("reverify") === "true";
  const hasFetchedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      // Prevent multiple fetches
      if (hasFetchedRef.current) {
        return;
      }
      hasFetchedRef.current = true;

      try {
        // First try to get the verification result from localStorage
        const storedResult = localStorage.getItem("verificationResult");

        if (storedResult) {
          const parsedResult = JSON.parse(storedResult);
          setResult(parsedResult);
          // Clear the stored result after retrieving it
          localStorage.removeItem("verificationResult");
          setLoading(false);
          return;
        }

        // If localStorage is empty but this is a re-verify, fetch from backend
        if (isReverify && code) {
          const response = await api.post("/verify/manual", {
            codeValue: code,
          });

          if (response.data) {
            setResult(response.data);
            setLoading(false);
            return;
          }
        }

        // If no localStorage and no code, show error
        if (!code) {
          setError("No verification result found. Please verify a code first.");
          setLoading(false);
          return;
        }

        // If localStorage is empty and not a re-verify, show expired message
        setError("Verification result expired. Please verify the code again.");
        setLoading(false);
      } catch (err) {
        console.error("Error retrieving verification result:", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load verification result"
        );
        toast.error("Failed to load verification result");
        setLoading(false);
      }
    };

    fetchResult();
  }, [code, isReverify]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <p className="text-center dark:text-white">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <p className="text-center dark:text-white">No verification result</p>
      </div>
    );
  }

  // Map status to component based on result verification.state
  const resultStatus = result?.verification?.state || "";

  try {
    if (resultStatus.includes("GENUINE")) {
      return (
        <Genuine
          code={code}
          product={result.product}
          batch={result.batch}
          verification={result.verification}
          codeInfo={result.code}
        />
      );
    } else if (resultStatus.includes("CODE_ALREADY_USED")) {
      return (
        <CodeUsed
          code={code}
          product={result.product}
          batch={result.batch}
          codeInfo={result.code}
        />
      );
    } else if (
      resultStatus.includes("INVALID") ||
      resultStatus.includes("EXPIRED") ||
      resultStatus.includes("UNREGISTERED")
    ) {
      return (
        <Invalid
          code={code}
          product={result.product}
          verification={result.verification}
        />
      );
    } else if (resultStatus.includes("SUSPICIOUS")) {
      return (
        <Suspicious
          code={code}
          product={result.product}
          verification={result.verification}
        />
      );
    } else {
      return (
        <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
          <p className="text-center dark:text-white">
            Verification status: {resultStatus}
          </p>
        </div>
      );
    }
  } catch (err) {
    console.error("Error rendering component:", err);
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <p className="text-center text-red-500">Error rendering result</p>
      </div>
    );
  }
}

export default function StatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading verification status...</p>
          </div>
        </div>
      }
    >
      <StatePageContent />
    </Suspense>
  );
}
