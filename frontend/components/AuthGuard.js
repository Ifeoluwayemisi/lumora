"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export default function AuthGuard({ children, allowedRoles }) {
  const router = useRouter();
  const { user, isHydrated } = useContext(AuthContext);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!isHydrated) {
      console.log("[AUTHGUARD DEBUG] Not hydrated yet");
      return;
    }

    // No user after hydration = not logged in
    if (!user) {
      console.log("[AUTHGUARD DEBUG] No user found, redirecting to login");
      router.replace("/auth/login");
      return;
    }

    console.log("[AUTHGUARD DEBUG] User object:", {
      id: user.id,
      email: user.email,
      role: user.role,
      roleType: typeof user.role,
      roleUpper: user.role?.toUpperCase(),
      allowedRoles: allowedRoles,
      allowedRolesUpper: allowedRoles?.map(r => r.toUpperCase()),
    });

    // Check if user has required role (case-insensitive)
    if (allowedRoles && allowedRoles.length > 0) {
      const userRoleUpper = user.role?.toUpperCase();
      const allowedRolesUpper = allowedRoles.map(r => r.toUpperCase());
      const hasRole = allowedRolesUpper.includes(userRoleUpper);
      
      console.log("[AUTHGUARD DEBUG] Role check:", {
        userRole: user.role,
        userRoleUpper,
        allowedRoles,
        allowedRolesUpper,
        hasRole,
      });
      
      if (!hasRole) {
        console.log("[AUTHGUARD DEBUG] Role mismatch! Redirecting to unauthorized");
        router.replace("/unauthorized");
        return;
      }
    }
    
    console.log("[AUTHGUARD DEBUG] Auth passed, rendering children");
  }, [isHydrated, user, router, allowedRoles]);

  // While hydrating, show spinner
  if (!isHydrated) {
    return <LoadingSpinner />;
  }

  // Not logged in, show spinner (redirect will happen)
  if (!user) {
    return <LoadingSpinner />;
  }

  // Check roles (case-insensitive)
  if (allowedRoles) {
    const userRoleUpper = user.role?.toUpperCase();
    const allowedRolesUpper = allowedRoles.map(r => r.toUpperCase());
    if (!allowedRolesUpper.includes(userRoleUpper)) {
      return <LoadingSpinner />;
    }
  }

  // User is authenticated and authorized
  return children;
}
