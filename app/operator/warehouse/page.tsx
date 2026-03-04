"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Package, 
  User, 
  Scale,
  Calendar,
  Layers,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/app/dashboard/components/status-badge";

interface Parcel {
  id: string;
  trackingCode: string;
  status: string;
  weightKg?: number;
  finalCost?: number;
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

const originStatusOptions = [
  { value: "created", label: "Создан" },
  { value: "weighed", label: "Взвешено" },
  { value: "paid", label: "Оплачено" },
  { value: "received_at_origin", label: "Принято на склад" },
  { value: "in_batch", label: "В партии" },
  { value: "shipped", label: "Отправлен" },
];

const destinationStatusOptions = [
  { value: "shipped", label: "Отправлен" },
  { value: "in_transit", label: "В пути" },
  { value: "customs", label: "На таможне" },
  { value: "received_at_destination", label: "Прибыл" },
  { value: "sorting", label: "Сортировка" },
  { value: "out_for_delivery", label: "У курьера" },
  { value: "delivered", label: "Доставлен" },
];

export default function WarehousePage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const warehouseType = user?.warehouse?.type;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedParcels, setSelectedParcels] = useState<string[]>([]);

  const statusOptions = warehouseType === "destination"
    ? destinationStatusOptions
    : originStatusOptions;

  const { data, isLoading } = useQuery({
    queryKey: ["warehouse-inventory", statusFilter],
    queryFn: () => {
      const statusParam = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      return api<{ parcels: Parcel[] }>(`/api/parcels/warehouse/all${statusParam}`, { token: token! });
    },
    enabled: !!token,
  });

  const filteredParcels = data?.parcels.filter((p: any) => 
    p.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.user.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleSelect = (id: string) => {
    setSelectedParcels(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedParcels.length === filteredParcels.length) {
      setSelectedParcels([]);
    } else {
      setSelectedParcels(filteredParcels.map((p: any) => p.id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Складской Учет</h2>
          <p className="text-slate-500 font-medium">Управление текущими остатками на складе</p>
        </div>

        {selectedParcels.length > 0 && (
          <Link
            href={{
              pathname: "/operator/batches/new",
              query: { parcels: selectedParcels.join(",") }
            }}
            className="inline-flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-orange-100 animate-in fade-in zoom-in-95"
          >
            <Layers className="w-5 h-5" />
            Создать партию ({selectedParcels.length})
          </Link>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по коду, клиенту..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-600"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Все статусы</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 pt-2">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-600"
                    checked={filteredParcels.length > 0 && selectedParcels.length === filteredParcels.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Трекинг / Клиент</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Маршрут</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Параметры</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Статус</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">Загрузка данных...</p>
                  </td>
                </tr>
              ) : filteredParcels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Package className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400">На складе пусто</p>
                  </td>
                </tr>
              ) : (
                filteredParcels.map((parcel: any) => (
                  <tr 
                    key={parcel.id} 
                    className={cn(
                      "hover:bg-slate-50 transition-colors group",
                      selectedParcels.includes(parcel.id) && "bg-orange-50/30"
                    )}
                  >
                    <td className="py-4">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-600"
                        checked={selectedParcels.includes(parcel.id)}
                        onChange={() => toggleSelect(parcel.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                          {parcel.trackingCode}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">
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
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Scale className="w-3.5 h-3.5 text-slate-400" />
                          {parcel.weightKg ? `${parcel.weightKg} кг` : "—"}
                        </div>
                        {parcel.finalCost != null && (
                          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            ${Number(parcel.finalCost).toFixed(2)}
                          </div>
                        )}
                      </div>
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

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">Загрузка данных...</p>
            </div>
          ) : filteredParcels.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 text-slate-100 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400">На складе пусто</p>
            </div>
          ) : filteredParcels.map((parcel: any) => (
            <div
              key={parcel.id}
              className={cn(
                "bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 transition-colors",
                selectedParcels.includes(parcel.id) && "bg-orange-50/40 border-orange-200"
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-600 shrink-0"
                  checked={selectedParcels.includes(parcel.id)}
                  onChange={() => toggleSelect(parcel.id)}
                />
                <span className="font-black text-slate-900 text-sm">{parcel.trackingCode}</span>
              </div>

              <div className="flex items-center gap-2 pl-8">
                <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">
                  {parcel.user.clientCode}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{parcel.user.name}</span>
              </div>

              <div className="flex items-center justify-between pl-8 gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                  {parcel.route.originCountry}
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  {parcel.route.destinationCountry}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <Scale className="w-3.5 h-3.5 text-slate-400" />
                  {parcel.weightKg ? `${parcel.weightKg} кг` : "—"}
                </div>
              </div>

              <div className="flex items-center justify-between pl-8 gap-2">
                <StatusBadge status={parcel.status} />
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(parcel.createdAt).toLocaleDateString("ru-RU")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
