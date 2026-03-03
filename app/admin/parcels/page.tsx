"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  Loader2,
  Filter,
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/app/dashboard/components/status-badge";

interface Parcel {
  id: string;
  trackingCode: string;
  status: string;
  weightKg?: number;
  createdAt: string;
  user: {
    name: string;
    clientCode: string;
  };
  route: {
    originCountry: string;
    destinationCountry: string;
  };
}

export default function AdminParcels() {
  const token = useAuthStore((state) => state.token);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-parcels", statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      return api<{ parcels: Parcel[] }>(`/api/parcels/warehouse/all?${params.toString()}`, { token: token! });
    },
    enabled: !!token,
  });

  const filteredParcels = data?.parcels.filter((p: any) => 
    p.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.user.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Все Посылки</h2>
        <p className="text-slate-500 font-medium">Мониторинг всех отправлений платформы</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по коду, клиенту..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-600"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="created">Создан</option>
              <option value="paid">Оплачен</option>
              <option value="weighed">Взвешен</option>
              <option value="shipped">Отправлен</option>
              <option value="delivered">Доставлен</option>
            </select>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Трекинг / Клиент</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Маршрут</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Вес</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Статус</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">Загрузка данных...</p>
                  </td>
                </tr>
              ) : filteredParcels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">
                    <Package className="w-12 h-12 opacity-10 mx-auto mb-4" />
                    <p className="text-sm font-bold">Ничего не найдено</p>
                  </td>
                </tr>
              ) : (
                filteredParcels.map((parcel: any) => (
                  <tr key={parcel.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                          {parcel.trackingCode}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase">
                            {parcel.user.clientCode}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{parcel.user.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                        {parcel.route.originCountry}
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        {parcel.route.destinationCountry}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-black text-slate-700">
                      {parcel.weightKg ? `${parcel.weightKg} кг` : "—"}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={parcel.status} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(parcel.createdAt).toLocaleDateString("ru-RU")}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">Загрузка данных...</p>
            </div>
          ) : filteredParcels.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Package className="w-12 h-12 opacity-10 mx-auto mb-4" />
              <p className="text-sm font-bold">Ничего не найдено</p>
            </div>
          ) : (
            filteredParcels.map((parcel: any) => (
              <div key={parcel.id} className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-black text-slate-900">{parcel.trackingCode}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase">
                    {parcel.user.clientCode}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{parcel.user.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                  {parcel.route.originCountry}
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  {parcel.route.destinationCountry}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700">
                    {parcel.weightKg ? `${parcel.weightKg} кг` : "—"}
                  </span>
                  <StatusBadge status={parcel.status} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(parcel.createdAt).toLocaleDateString("ru-RU")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
