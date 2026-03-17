"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * SIMPLIFIED OAuth Callback
 * - Direct execution, no Suspense
 * - Stores debug info in localStorage
 * - No toast notifications (simplest possible)
 */
export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      // Parse URL immediately
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const userJson = params.get("user");
      const error = params.get("error");
      const message = params.get("message");

      // Store debug info for inspection at /auth/debug
      localStorage.setItem(
        "oauth_callback_debug",
        JSON.stringify({
          timestamp: new Date().toISOString(),
          url: window.location.href,
          hasToken: !!token,
          hasUser: !!userJson,
          error,
          message,
          tokenLength: token?.length || 0,
          userLength: userJson?.length || 0,
        }),
      );

      // Handle error
      if (error || message) {
        localStorage.setItem("oauth_error", message || error);
        router.replace("/auth/login");
        return;
      }

      // Validate required data
      if (!token || !userJson) {
        localStorage.setItem(
          "oauth_error",
          `Missing data: token=${!!token}, user=${!!userJson}`,
        );
        router.replace("/auth/login");
        return;
      }

      // Parse user
      const user = JSON.parse(userJson);

      // Store auth data directly to localStorage (immediate, no async state)
      localStorage.setItem("lumora_user", JSON.stringify(user));
      localStorage.setItem("lumora_token", token);

      // Redirect based on role
      const role = user.role || "CONSUMER";
      const dashboardMap = {
        MANUFACTURER: "/dashboard/manufacturer",
        ADMIN: "/dashboard/admin",
        CONSUMER: "/dashboard/user",
        NAFDAC: "/dashboard/admin",
      };

      const destination = dashboardMap[role] || "/dashboard/user";
      localStorage.setItem("oauth_success", destination);

      // Use small delay to ensure storage is written before navigation
      setTimeout(() => {
        router.replace(destination);
      }, 100);
    } catch (err) {
      localStorage.setItem("oauth_error", `Exception: ${err.message}`);
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-genuine"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Signing you in...
        </p>
        <p className="mt-2 text-xs text-gray-500">
          <a href="/auth/debug" className="underline hover:text-gray-600">
            Debug Info
          </a>
        </p>
      </div>
    </div>
  );
}
