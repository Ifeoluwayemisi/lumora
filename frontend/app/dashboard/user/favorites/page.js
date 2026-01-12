"use client";
import { useEffect, useState } from "react";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/user/favorites");
      const data = await res.json();
      setFavorites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-6 dark:text-white">Loading favorites...</p>
    );

  if (!favorites.length)
    return (
      <p className="text-center mt-6 dark:text-white">
        No favorites yet. Start verifying products!
      </p>
    );

  return (
    <div className="p-4 pt-12 md:pt-16">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Favorites</h1>
      <ul className="space-y-3">
        {favorites.map((item) => (
          <li
            key={item.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow flex justify-between items-center border dark:border-gray-600"
          >
            <div>
              <p className="font-semibold">{item.code}</p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {item.status}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-400">
                Verified on {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() =>
                window.location.assign(`/verify/result?code=${item.code}`)
              }
              className="px-3 py-1 bg-genuine text-white rounded-md text-sm hover:bg-green-600 transition"
            >
              Re-verify
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
