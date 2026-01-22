"use client";

import { AdminProvider } from "@/context/AdminContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import RoleGuard from "@/components/admin/RoleGuard";
import { usePathname } from "next/navigation";

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();

  // Don't wrap login page in admin layout
  if (
    pathname.includes("/admin/login") ||
    pathname.includes("/admin/register")
  ) {
    return <>{children}</>;
  }

  return (
    <AdminProvider>
      <RoleGuard requiredRoles={[]}>
        <div className="flex h-screen bg-gray-50">
          <AdminSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </RoleGuard>
    </AdminProvider>
  );
}
