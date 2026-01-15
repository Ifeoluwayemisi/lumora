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
      return;
    }

    // No user after hydration = not logged in
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // Check if user has required role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/unauthorized");
      return;
    }
  }, [isHydrated, user, router, allowedRoles]);

  // While hydrating, show spinner
  if (!isHydrated) {
    return <LoadingSpinner />;
  }

  // Not logged in, show spinner (redirect will happen)
  if (!user) {
    return <LoadingSpinner />;
  }

  // Check roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <LoadingSpinner />;
  }

  // User is authenticated and authorized
  return children;
}
