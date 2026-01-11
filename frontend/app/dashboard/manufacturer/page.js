import AuthGuard from "@/components/AuthGuard";

export default function ManufacturerDashboard() {
  return (
    <AuthGuard allowedRoles={["manufacturer"]}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Product Codes & Batches
      </h1>
    </AuthGuard>
  );
}
