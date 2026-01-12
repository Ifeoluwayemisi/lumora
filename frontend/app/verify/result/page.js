"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerificationResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/verification/result?code=${code}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Verification failed");

        // Determine which state page to navigate to
        let stateRoute = "";
        switch (data.status) {
          case "Genuine":
            stateRoute = "/verify/state/Genuine";
            break;
          case "Code Already Used":
            stateRoute = "/verify/state/CodeAlreadyUsed";
            break;
          case "Invalid Code":
            stateRoute = "/verify/state/InvalidCode";
            break;
          case "Unregistered Product":
            stateRoute = "/verify/state/UnregisteredProduct";
            break;
          case "Suspicious Pattern Detected":
            stateRoute = "/verify/state/SuspiciousPattern";
            break;
          default:
            stateRoute = "/verify/state/Unknown";
        }

        // Pass backend AI data via query or state if needed
        router.push(`${stateRoute}?code=${code}`);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (code) fetchResult();
  }, [code]);

  if (loading)
    return <p className="text-center mt-6 dark:text-white">Loading...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;
  return null;
}
