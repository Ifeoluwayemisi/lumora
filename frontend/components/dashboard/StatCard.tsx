// components/Dashboard/StatCard.tsx
import { LucideIcon } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-green-500/30 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
          <Icon size={24} />
        </div>
        {trend && (
          <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
    </div>
  );
}
