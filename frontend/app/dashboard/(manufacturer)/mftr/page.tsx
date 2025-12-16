"use client";
import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  Plus,
  Package,
  ShieldCheck,
  AlertTriangle,
  Hash,
} from "lucide-react";
import StatCard from "../../../../components/dashboard/StatCard";
import CreateProductModal from "../../../../components/dashboard/CreateProductModal";
import { useRouter } from "next/navigation";

interface Batch {
  id: string;
  name: string;
  qty: number;
  date: string;
  status: "Active" | "Archived" | "Suspicious";
}

// TODO: Mock data...
const verificationData = [...];
const productDistribution = [...];
const COLORS = ["#22c55e", "#3b82f6", "#a855f7"];
const rowsPerPage = 5;

export default function ManufacturerDashboard() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [batches, setBatches] = useState<Batch[]>([...]);

  const totalCodesGenerated = useMemo(
    () => batches.reduce((sum, b) => sum + b.qty, 0),
    [batches]
  );
  const activeProducts = useMemo(
    () =>
      new Set(batches.filter((b) => b.status === "Active").map((b) => b.name))
        .size,
    [batches]
  );
  const totalVerifications = useMemo(
    () =>
      verificationData.reduce((sum, v) => sum + v.genuine + v.suspicious, 0),
    []
  );
  const suspiciousAlerts = useMemo(
    () => batches.filter((b) => b.status === "Suspicious").length,
    [batches]
  );

  const handleGenerateBatch = (details: any) => {
    const newBatch: Batch = {
      id: details.batchNumber,
      name: details.name,
      qty: details.quantity,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      status: "Active",
    };
    setBatches([newBatch, ...batches]);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manufacturer Portal</h1>
          <p className="text-gray-400">
            Manage your product integrity and generate secure codes.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition">
            <Download size={18} /> Export Reports
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-xl hover:bg-green-500 transition font-bold shadow-lg shadow-green-900/20"
          >
            <Plus size={18} /> New Product Batch
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Codes Generated" value={totalCodesGenerated.toLocaleString()} icon={Hash} trend="+12%" />
        <StatCard title="Active Products" value={activeProducts} icon={Package} />
        <StatCard title="Total Verifications" value={totalVerifications.toLocaleString()} icon={ShieldCheck} trend="+5%" />
        <StatCard title="Suspicious Alerts" value={suspiciousAlerts} icon={AlertTriangle} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BarChart & PieChart components here */}
      </div>

      {/* Modal */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerateBatch}
      />
    </>
  );
}
