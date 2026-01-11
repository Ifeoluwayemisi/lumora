"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { decodeUser } from "@/lib/decodeToken";

export default function AuthGuard({ children, allowedRoles }) {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const user = decodeUser(token);
    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
      router.replace("/unauthorized");
    }
  }, []);

  return children;
}
