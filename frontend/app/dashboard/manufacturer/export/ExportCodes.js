"use client";
import { CSVLink } from "react-csv";
import { useEffect, useState } from "react";

export default function ExportCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const res = await fetch("/api/manufacturer/codes");
        const data = await res.json();
        setCodes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCodes();
  }, []);

  if (loading)
    return <p className="text-center mt-6 dark:text-white">Loading codes...</p>;

  return (
    <div className="p-4 pt-12 md:pt-16">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Export Codes</h1>
      <CSVLink
        data={codes}
        filename={`lumora_codes_${new Date().toISOString()}.csv`}
        className="px-4 py-2 bg-genuine text-white rounded hover:bg-green-600 transition"
      >
        Export as CSV
      </CSVLink>
    </div>
  );
}
