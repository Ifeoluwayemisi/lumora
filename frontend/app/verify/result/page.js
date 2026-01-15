"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerificationResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      router.push("/verify");
      return;
    }

    // Map backend verificationState values to URL-friendly format
    // The verification happens in the parent page (/verify or /verify/qr)
    // This page just redirects to the appropriate state page
    // The state page will fetch the actual verification data

    // For now, redirect to a generic state page that will handle the verification
    // The code is in query param, so the state page can use it
    router.push(`/verify/states/result?code=${encodeURIComponent(code)}`);
  }, [code, router]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <p className="text-center dark:text-white">Verifying...</p>
      </div>
    );

  return null;
}

export default function VerificationResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
          <p className="text-center dark:text-white">Loading verification result...</p>
        </div>
      }
    >
      <VerificationResultContent />
    </Suspense>
  );
}
