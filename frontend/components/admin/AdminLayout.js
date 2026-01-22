"use client";

import { AdminProvider } from "@/context/AdminContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import RoleGuard from "@/components/admin/RoleGuard";

export default function AdminLayout({ children, requiredRoles = [] }) {
  return (
    <AdminProvider>
      <RoleGuard requiredRoles={requiredRoles}>
        <div className="flex h-screen bg-gray-50">
          <AdminSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6 lg:ml-0">{children}</div>
          </main>
        </div>
      </RoleGuard>
    </AdminProvider>
  );
}
