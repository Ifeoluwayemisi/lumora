"use client";

import { useEffect, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

/**
 * Google OAuth Callback Handler
 * 
 * This page is where Google redirects after user authorizes the app.
 * It reads the token and user data from URL parameters,
 * stores them in localStorage, and redirects to the dashboard.
 */
export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get("token");
    const userJson = searchParams.get("user");
    const error = searchParams.get("error");

    console.log("[CALLBACK PAGE] Processing OAuth callback");
    console.log("[CALLBACK PAGE] Token:", token ? "✓" : "✗");
    console.log("[CALLBACK PAGE] User data:", userJson ? "✓" : "✗");
    console.log("[CALLBACK PAGE] Error:", error || "none");

    if (error) {
      console.error("[CALLBACK PAGE] OAuth error:", error);
      const message = searchParams.get("message") || "Authentication failed";
      
      // Redirect to login with error message
      router.push(`/auth/login?error=${encodeURIComponent(message)}`);
      return;
    }

    if (!token || !userJson) {
      console.error("[CALLBACK PAGE] Missing token or user data");
      router.push("/auth/login?error=Invalid callback data");
      return;
    }

    try {
      // Parse user data
      const user = JSON.parse(userJson);
      console.log("[CALLBACK PAGE] Parsed user:", user.email, "Role:", user.role);

      // Store token and user via AuthContext
      login(user, token)
        .then(() => {
          console.log("[CALLBACK PAGE] Login successful, redirecting...");

          // Redirect based on role
          switch (user.role) {
            case "manufacturer":
              router.push("/dashboard/manufacturer");
              break;
            case "admin":
              router.push("/dashboard/admin");
              break;
            default:
              router.push("/dashboard/user");
              break;
          }
        })
        .catch((err) => {
          console.error("[CALLBACK PAGE] Login failed:", err);
          router.push("/auth/login?error=Failed to login");
        });
    } catch (err) {
      console.error("[CALLBACK PAGE] Error parsing user data:", err);
      router.push("/auth/login?error=Invalid user data");
    }
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-genuine"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Completing sign-in...
        </p>
      </div>
    </div>
  );
}
