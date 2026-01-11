import AuthGuard from "@/components/AuthGuard";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function UserDashboard() {
  return (
    <AuthGuard allowedRoles={["user"]}>
      <div className="pb-20">
        <h1 className="text-2xl font-bold mb-4">Verification History</h1>
        {/* history list here */}
      </div>
      <MobileBottomNav />
    </AuthGuard>
  );
}
