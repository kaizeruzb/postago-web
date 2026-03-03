"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { statusMap } from "@/app/dashboard/components/status-badge";

interface Analytics {
  totalUsers: number;
  totalParcels: number;
  parcelsThisMonth: number;
  totalRevenue: number;
  parcelsByStatus: { status: string; _count: number }[];
}

export default function AdminDashboard() {
  const token = useAuthStore((state) => state.token);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api<Analytics>("/api/admin/analytics", { token: token! }),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Анализ данных...</p>
      </div>
    );
  }

  const stats = [
    { label: "Клиентов", value: data?.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Всего посылок", value: data?.totalParcels, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "За 30 дней", value: data?.parcelsThisMonth, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Выручка", value: `$${data?.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Обзор Платформы</h2>
        <p className="text-slate-500 font-medium">Общие показатели работы системы</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">
                <ArrowUpRight className="w-3 h-3" />
                Live
              </span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Distribution */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Распределение по статусам
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data?.parcelsByStatus.map((item) => {
                const config = statusMap[item.status] || { label: item.status, color: "bg-slate-100 text-slate-700" };
                const percentage = data.totalParcels > 0 ? (item._count / data.totalParcels) * 100 : 0;
                
                return (
                  <div key={item.status} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider", config.color)}>
                        {config.label}
                      </span>
                      <span className="text-sm font-black text-slate-900">{item._count}</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000", config.color.split(' ')[0].replace('text-', 'bg-').replace('-100', '-500'))}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-black text-purple-400 uppercase tracking-widest text-xs mb-4">Быстрые действия</h4>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-left text-sm font-bold transition-colors">
                  Скачать отчет (CSV)
                </button>
                <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-left text-sm font-bold transition-colors">
                  Обновить тарифы
                </button>
                <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-left text-sm font-bold transition-colors">
                  Проверить логи API
                </button>
              </div>
            </div>
            <ShieldCheck className="absolute bottom-[-20px] right-[-20px] w-32 h-32 text-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
