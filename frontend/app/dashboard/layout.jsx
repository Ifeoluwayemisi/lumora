"use client";

import AuthGuard from "@/components/AuthGuard";
import DashboardNav from "@/components/DashboardNav";

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
        <DashboardNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
