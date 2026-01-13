"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get("/user/favorites");
      setFavorites(response.data || []);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError(err.response?.data?.message || "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center dark:text-white text-lg">
          Loading favorites...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-red-600 dark:text-red-400 text-lg">
          {error}
        </p>
      </div>
    );

  if (!favorites || favorites.length === 0)
    return (
      <AuthGuard allowedRoles={["consumer"]}>
        <DashboardSidebar userRole="consumer" />

        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No favorites yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              Start verifying products and save them!
            </p>
            <a
              href="/verify"
              className="px-6 py-2 bg-genuine text-white rounded-lg hover:bg-green-600 transition font-medium"
            >
              Verify Products
            </a>
          </div>
        </div>
      </AuthGuard>
    );

  return (
    <AuthGuard allowedRoles={["consumer"]}>
      <DashboardSidebar userRole="consumer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">
            Saved Products ❤️
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      {item.productName || "Product"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Code: {item.codeValue}
                    </p>
                  </div>
                  <span className="text-xl">❤️</span>
                </div>

                <p className="text-xs text-gray-400 mb-4">
                  Saved {new Date(item.createdAt).toLocaleDateString()}
                </p>

                <button
                  onClick={() =>
                    window.location.assign(
                      `/verify/result?code=${item.codeValue}`
                    )
                  }
                  className="w-full px-4 py-2 bg-genuine text-white rounded-lg text-sm hover:bg-green-600 transition font-medium"
                >
                  Verify Again
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
