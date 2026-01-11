"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";

export default function VerifyResultRouter() {
  const params = useSearchParams();
  const router = useRouter();
  const code = params.get("code");
  const token = getAuthToken();

  useEffect(() => {
    if (!code) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          codeValue: code,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      });

      const data = await res.json();

      router.replace(`/verify/${data.state}?ref=${data.referenceId}`);
    });
  }, []);

  return <p className="text-center mt-20">Verifying…</p>;
}
