"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const router = useRouter();
  const token = getAuthToken();

  const handleVerify = () => {
    if (!code.trim()) return;
    router.push(`/verify/result?code=${code}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-gray-900 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Verify Product
      </h1>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Enter LUM code"
        className="w-full max-w-md p-4 border rounded-md dark:bg-gray-800 dark:text-white"
      />

      <button
        onClick={handleVerify}
        className="mt-4 w-full max-w-md bg-genuine text-white py-4 rounded-md font-semibold"
      >
        Verify
      </button>

      {!token && (
        <p className="mt-4 text-sm text-gray-500">
          QR verification requires login
        </p>
      )}
    </div>
  );
}
