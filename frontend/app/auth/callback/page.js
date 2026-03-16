"use client";

import { useEffect, useContext, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-toastify";

/**
 * Google OAuth Callback Handler
 *
 * This page is where Google redirects after user authorizes the app.
 * It reads the token and user data from URL parameters,
 * stores them in localStorage, and redirects to the dashboard.
 */
function CallbackContent() {
  const router = useRouter();
  const { login } = useContext(AuthContext);

  // Log immediately when component renders
  console.warn("🔴🔴🔴 CALLBACK PAGE COMPONENT RENDERING 🔴🔴🔴");
  console.log("URL:", typeof window !== "undefined" ? window.location.href : "SSR");

  useEffect(() => {
    // Use window.location to reliably get URL params
    if (typeof window === "undefined") return;

    console.log("🟢 CALLBACK useEffect running");
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userJson = params.get("user");
    const error = params.get("error");
    const message = params.get("message");

    console.log("[CALLBACK] ========== CALLBACK PAGE LOADED ==========");
    console.log("[CALLBACK] Full URL:", window.location.href);
    console.log("[CALLBACK] Token:", token ? "✓ EXISTS" : "✗ MISSING");
    console.log("[CALLBACK] User JSON size:", userJson?.length || "N/A");
    console.log("[CALLBACK] Error:", error || "none");

    if (error) {
      console.error("[CALLBACK] ❌ Backend returned error:", error);
      toast.error(message || "Authentication failed: " + error);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
      return;
    }

    if (!token || !userJson) {
      console.error(
        "[CALLBACK] ❌ Missing data - Token:",
        !!token,
        "User:",
        !!userJson,
      );
      toast.error("Missing authentication data from server");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
      return;
    }

    try {
      const user = JSON.parse(userJson);
      console.log("[CALLBACK] ✓ User parsed:", user.email, "Role:", user.role);

      login(user, token)
        .then(() => {
          console.log("[CALLBACK] ✓ AuthContext login successful");

          let dashUrl = "/dashboard/user";
          if (user.role === "manufacturer") dashUrl = "/dashboard/manufacturer";
          else if (user.role === "admin") dashUrl = "/dashboard/admin";

          console.log("[CALLBACK] → Pushing to:", dashUrl);
          toast.success("✓ Signed in!");
          router.push(dashUrl);
        })
        .catch((err) => {
          console.error("[CALLBACK] ❌ AuthContext login error:", err.message);
          toast.error("Login failed");
          setTimeout(() => router.push("/auth/login"), 1500);
        });
    } catch (err) {
      console.error("[CALLBACK] ❌ JSON parse error:", err.message);
      toast.error("Invalid user data");
      setTimeout(() => router.push("/auth/login"), 1500);
    }
  }, [router, login]);

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

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-genuine"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
