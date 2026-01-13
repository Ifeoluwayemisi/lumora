"use client";

import { useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import api from "@/services/api";
import Genuine from "../Genuine";
import CodeUsed from "../CodeUsed";
import Invalid from "../Invalid";
import Suspicious from "../Suspicious";
import Unregistered from "../Unregistered";

export default function StatePage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const code = searchParams.get("code");

  // Extract status from pathname
  const pathSegments = pathname.split("/");
  const statusFromPath = pathSegments[pathSegments.length - 1] || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await api.post("/verify/manual", { codeValue: code });
        setResult(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (code) fetchResult();
  }, [code]);

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

  // Map status to component based on result verificationState
  const resultStatus = result?.verificationState || "";

  try {
    if (resultStatus.includes("GENUINE")) {
      return <Genuine code={code} product={result.product} />;
    } else if (resultStatus.includes("CODE_ALREADY_USED")) {
      return <CodeUsed code={code} />;
    } else if (
      resultStatus.includes("INVALID") ||
      resultStatus.includes("EXPIRED") ||
      resultStatus.includes("UNREGISTERED")
    ) {
      return <Invalid code={code} />;
    } else if (resultStatus.includes("SUSPICIOUS")) {
      return <Suspicious code={code} product={result.product} />;
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
