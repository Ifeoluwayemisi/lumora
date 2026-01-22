"use client";

// Mark admin routes as dynamic to prevent static prerendering
export const dynamic = "force-dynamic";

import { AdminProvider } from "@/context/AdminContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminFooter from "@/components/admin/AdminFooter";
import RoleGuard from "@/components/admin/RoleGuard";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
          {/* Sidebar */}
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Navbar */}
            <AdminNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              <div className="p-6">{children}</div>
            </main>

            {/* Footer */}
            <AdminFooter />
          </div>
        </div>
      </RoleGuard>
    </AdminProvider>
  );
}
