import AuthGuard from "@/components/AuthGuard";

export default function AdminDashboard() {
  return (
    <AuthGuard allowedRoles={["admin", "nafdac"]}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Lumora Intelligence Dashboard
      </h1>
    </AuthGuard>
  );
}
