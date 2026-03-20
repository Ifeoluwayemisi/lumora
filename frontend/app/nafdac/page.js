"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NAFDACRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new dashboard location
    router.push("/dashboard/nafdac");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          NAFDAC Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Redirecting you to the dashboard...
        </p>
      </div>
    </div>
  );
}
