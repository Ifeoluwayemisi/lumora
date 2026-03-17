"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";

/**
 * SIMPLIFIED OAuth Callback
 * - Direct execution, no Suspense
 * - Stores debug info in localStorage
 * - No toast notifications (simplest possible)
 */
export default function OAuthCallbackPage() {
  const router = useRouter();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
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
          router.push("/auth/login");
          return;
        }

        // Validate required data
        if (!token || !userJson) {
          localStorage.setItem(
            "oauth_error",
            `Missing data: token=${!!token}, user=${!!userJson}`,
          );
          router.push("/auth/login");
          return;
        }

        // Parse user
        const user = JSON.parse(userJson);

        // Login via AuthContext
        await login(user, token);

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
        router.push(destination);
      } catch (err) {
        localStorage.setItem("oauth_error", `Exception: ${err.message}`);
        router.push("/auth/login");
      }
    })();
  }, [login, router]);

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
