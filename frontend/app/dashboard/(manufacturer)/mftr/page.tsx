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

// Mock verification data
const verificationData = [
  { date: "2025-12-01", genuine: 50, suspicious: 2 },
  { date: "2025-12-02", genuine: 60, suspicious: 1 },
  { date: "2025-12-03", genuine: 45, suspicious: 3 },
];

// Mock product distribution for PieChart
const productDistribution = [
  { name: "Product A", value: 120 },
  { name: "Product B", value: 80 },
  { name: "Product C", value: 50 },
];

const COLORS = ["#22c55e", "#3b82f6", "#a855f7"];

export default function ManufacturerDashboard() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([
    {
      id: "B001",
      name: "Product A",
      qty: 100,
      date: "Dec 01",
      status: "Active",
    },
    {
      id: "B002",
      name: "Product B",
      qty: 50,
      date: "Dec 02",
      status: "Suspicious",
    },
    {
      id: "B003",
      name: "Product C",
      qty: 75,
      date: "Dec 03",
      status: "Active",
    },
  ]);

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
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      status: "Active",
    };
    setBatches([newBatch, ...batches]);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manufacturer Portal
          </h1>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Codes Generated"
          value={totalCodesGenerated.toLocaleString()}
          icon={Hash}
          trend="+12%"
        />
        <StatCard
          title="Active Products"
          value={activeProducts}
          icon={Package}
        />
        <StatCard
          title="Total Verifications"
          value={totalVerifications.toLocaleString()}
          icon={ShieldCheck}
          trend="+5%"
        />
        <StatCard
          title="Suspicious Alerts"
          value={suspiciousAlerts}
          icon={AlertTriangle}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BarChart */}
        <div className="bg-black/20 p-4 rounded-xl">
          <h3 className="text-white font-bold mb-2">Daily Verifications</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={verificationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Bar dataKey="genuine" fill="#22c55e" />
              <Bar dataKey="suspicious" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PieChart */}
        <div className="bg-black/20 p-4 rounded-xl">
          <h3 className="text-white font-bold mb-2">Product Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={productDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {productDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
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
