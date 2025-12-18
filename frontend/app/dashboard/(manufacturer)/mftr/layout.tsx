"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

// Mock function — replace with real API call
async function fetchUser() {
  // Replace with real fetch: /api/auth/me
  return {
    role: "MANUFACTURER",
    hasCompletedOnboarding: false, // test first-time login
  };
}

export default function ManufacturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<null | {
    role: string;
    hasCompletedOnboarding: boolean;
  }>(null);

  useEffect(() => {
    fetchUser().then((data) => setUser(data));
  }, []);

  useEffect(() => {
    if (!user) return;
    // Only redirect if manufacturer hasn't completed onboarding
    if (user.role === "MANUFACTURER" && !user.hasCompletedOnboarding) {
      router.push("/onboarding/manufacturer");
    }
  }, [user, router]);

  // While loading user info
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  const accountStatus: "PENDING" | "VERIFIED" | "REJECTED" = "VERIFIED"; // replace with real logic

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar status={accountStatus} />
      <main className="flex-1 p-6 space-y-8">{children}</main>
    </div>
  );
}
