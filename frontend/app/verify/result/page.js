"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/services/api";

export default function VerificationResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await api.post("/verify/manual", { codeValue: code });

        // Map status to URL-friendly format
        let statusRoute = "";
        const status = data.data.status;

        if (status === "Genuine") {
          statusRoute = "genuine";
        } else if (status === "Code Already Used") {
          statusRoute = "code-used";
        } else if (status === "Invalid Code") {
          statusRoute = "invalid";
        } else if (status === "Unregistered Product") {
          statusRoute = "unregistered";
        } else if (status === "Suspicious Pattern Detected") {
          statusRoute = "suspicious";
        } else {
          statusRoute = "unknown";
        }

        // Redirect to dynamic route
        router.push(`/verify/states/${statusRoute}?code=${code}`);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (code) fetchResult();
  }, [code, router]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <p className="text-center dark:text-white">Loading verification...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/verify")}
            className="px-4 py-2 bg-genuine text-white rounded hover:bg-green-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return null;
}
