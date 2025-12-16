// app/(admin)/layout.tsx
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import "leaflet/dist/leaflet.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO:BACKEND_NODEJS_CONNECTION:
  // In a real app, we check if (user.role !== 'admin') { redirect('/login') }

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* PERSISTENT SIDEBAR */}
      <AdminSidebar pendingCount={12} />

      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#050505]/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              System Live Status
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-white">Super Admin</p>
              <p className="text-[10px] text-gray-500">ID: 001-ADMIN</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10" />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
