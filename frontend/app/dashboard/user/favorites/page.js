"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import api from "@/services/api";
import AuthGuard from "@/components/AuthGuard";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

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

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      setRemovingId(favoriteId);
      await api.delete(`/user/favorite/${favoriteId}`);
      // Remove from local state
      setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
    } catch (err) {
      console.error("Error removing favorite:", err);
      alert(
        err.response?.data?.message || "Failed to remove favorite. Try again."
      );
    } finally {
      setRemovingId(null);
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

        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  aria-label="Go back"
                >
                  <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Favorites
                </h1>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
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
        </div>
      </AuthGuard>
    );

  return (
    <AuthGuard allowedRoles={["consumer"]}>
      <DashboardSidebar userRole="consumer" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                aria-label="Go back"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Favorites
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      {item.productName && item.productName !== ""
                        ? item.productName
                        : "Product"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Code: {item.codeValue}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(item.id)}
                    disabled={removingId === item.id}
                    className="text-xl hover:scale-110 transition disabled:opacity-50"
                    title="Remove from favorites"
                  >
                    {removingId === item.id ? "⏳" : "❤️"}
                  </button>
                </div>

                <p className="text-xs text-gray-400 mb-4">
                  Saved {new Date(item.createdAt).toLocaleDateString()}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() =>
                      router.push(
                        `/verify/states/GENUINE?code=${encodeURIComponent(
                          item.codeValue
                        )}&reverify=true`
                      )
                    }
                    className="w-full px-4 py-2 bg-genuine text-white rounded-lg text-sm hover:bg-green-600 transition font-medium"
                  >
                    Verify Again
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/report?code=${encodeURIComponent(
                          item.codeValue
                        )}&product=${encodeURIComponent(
                          item.productName || "Unknown"
                        )}`
                      )
                    }
                    className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition font-medium"
                  >
                    🚩 Report Issue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
