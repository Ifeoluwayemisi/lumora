"use client";

import { useEffect, useContext, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get("token");
    const userJson = searchParams.get("user");
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    console.log("[CALLBACK] Token exists:", !!token);
    console.log("[CALLBACK] User data exists:", !!userJson);
    console.log("[CALLBACK] Error:", error);
    console.log("[CALLBACK] Message:", message);
    console.log("[CALLBACK] Search params keys:", Array.from(searchParams.keys()));

    // Handle errors from backend
    if (error) {
      console.error("[CALLBACK] OAuth error detected:", error, message);
      toast.error(message || "Authentication failed");
      
      // Wait a moment then redirect to login
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
      return;
    }

    // Check for token and user
    if (!token) {
      console.error("[CALLBACK] ❌ No token in URL");
      toast.error("No authentication token received");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
      return;
    }

    if (!userJson) {
      console.error("[CALLBACK] ❌ No user data in URL");
      toast.error("No user data received");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
      return;
    }

    try {
      // Parse user data (searchParams already decodes URL encoding)
      const user = JSON.parse(userJson);
      console.log("[CALLBACK] ✓ User parsed:", {
        email: user.email,
        id: user.id,
        role: user.role,
        firstName: user.firstName,
      });

      // Store token and user via AuthContext
      login(user, token).then(() => {
        console.log("[CALLBACK] ✓ Login via AuthContext successful");
        console.log("[CALLBACK] User role:", user.role);

        // Redirect based on role
        const role = user.role || "user";
        let dashboardUrl = "/dashboard/user";

        if (role === "manufacturer") {
          dashboardUrl = "/dashboard/manufacturer";
        } else if (role === "admin") {
          dashboardUrl = "/dashboard/admin";
        }

        console.log("[CALLBACK] → Redirecting to:", dashboardUrl);
        toast.success("Sign in successful! Redirecting...");
        
        // Small delay to ensure auth state is set
        setTimeout(() => {
          router.push(dashboardUrl);
        }, 500);
      });
    } catch (err) {
      console.error("[CALLBACK] ❌ Error during callback processing:", err.message);
      console.error("[CALLBACK] Stack:", err.stack);
      toast.error("Error processing sign-in");
      
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
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
