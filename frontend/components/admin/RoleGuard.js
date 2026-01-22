"use client";

import { useAdmin } from "@/hooks/useAdmin";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Component to guard routes based on admin role
 * Shows 403 page if user doesn't have required role
 */
export default function RoleGuard({ children, requiredRoles = [] }) {
  const { adminUser, isHydrated } = useAdmin();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (!adminUser) {
      router.push("/admin/login");
      return;
    }

    if (requiredRoles.length === 0) {
      setIsAuthorized(true);
      return;
    }

    if (requiredRoles.includes(adminUser.role)) {
      setIsAuthorized(true);
    } else {
      router.push("/admin/unauthorized");
    }
  }, [adminUser, isHydrated, requiredRoles, router]);

  if (!isHydrated || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children;
}
