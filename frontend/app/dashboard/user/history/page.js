"use client";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/user/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading)
    return <p className="text-center mt-4 dark:text-white">Loading...</p>;

  return (
    <div className="p-4 pt-6 md:pt-12">
      <h1 className="text-2xl font-bold dark:text-white mb-4">
        Verification History
      </h1>
      <ul className="space-y-3">
        {history.map((item) => (
          <li
            key={item.id}
            className="p-4 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 flex justify-between items-center"
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
            <button className="px-3 py-1 bg-genuine text-white rounded-md text-sm hover:bg-green-600 transition">
              Re-verify
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
