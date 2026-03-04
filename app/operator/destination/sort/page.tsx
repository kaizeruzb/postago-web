"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Package, 
  User, 
  MapPin, 
  CheckCircle2, 
  Loader2, 
  Box, 
  Truck, 
  ShieldAlert, 
  ClipboardList 
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
  user: {
    name: string;
    clientCode: string;
    city?: string;
  };
  route: {
    originCountry: string;
    destinationCountry: string;
  };
}

export default function SortingPage() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParcels, setSelectedParcels] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["sorting-inventory"],
    queryFn: () => api<{ parcels: Parcel[] }>("/api/parcels/warehouse/all?direction=inbound&status=received_at_destination", { token: token! }),
    enabled: !!token,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { ids: string[], status: string, note?: string }) => 
      Promise.all(data.ids.map(id => 
        api(`/api/parcels/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: data.status, note: data.note }),
          token: token!,
        })
      )),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sorting-inventory"] });
      setSelectedParcels([]);
      alert("Статус посылок успешно обновлен!");
    },
    onError: (err: any) => {
      alert(`Ошибка при обновлении статуса: ${err.message}`);
    }
  });

  const filteredParcels = data?.parcels.filter((p: any) => 
    p.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.user.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.user.city && p.user.city.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const toggleSelect = (id: string) => {
    setSelectedParcels(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const statusActions = [
    { label: "На таможню", status: "customs", color: "bg-orange-600", icon: ShieldAlert },
    { label: "В сортировку", status: "sorting", color: "bg-blue-600", icon: ClipboardList },
    { label: "Передать курьеру", status: "out_for_delivery", color: "bg-green-600", icon: Truck },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Сортировка и Таможня</h2>
          <p className="text-slate-500 font-medium">Обработка посылок в стране назначения</p>
        </div>

        {selectedParcels.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-in fade-in zoom-in-95">
            {statusActions.map((action) => (
              <button
                key={action.status}
                onClick={() => updateStatusMutation.mutate({ ids: selectedParcels, status: action.status })}
                disabled={updateStatusMutation.isPending}
                className={cn(
                  "inline-flex items-center gap-2 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95",
                  action.color,
                  updateStatusMutation.isPending && "opacity-50 cursor-not-allowed"
                )}
              >
                <action.icon className="w-3.5 h-3.5" />
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по коду, городу, клиенту..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 pt-2">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    checked={filteredParcels.length > 0 && selectedParcels.length === filteredParcels.length}
                    onChange={() => setSelectedParcels(selectedParcels.length === filteredParcels.length ? [] : filteredParcels.map((p: any) => p.id))}
                  />
                </th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Посылка</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Клиент / Город</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Вес</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Текущий статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">Загрузка данных...</p>
                  </td>
                </tr>
              ) : filteredParcels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">
                    <Box className="w-12 h-12 opacity-10 mx-auto mb-4" />
                    <p className="text-sm font-bold">Нет посылок для сортировки</p>
                  </td>
                </tr>
              ) : (
                filteredParcels.map((parcel: any) => (
                  <tr
                    key={parcel.id}
                    className={cn(
                      "hover:bg-slate-50 transition-colors group",
                      selectedParcels.includes(parcel.id) && "bg-blue-50/30"
                    )}
                  >
                    <td className="py-4">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                        checked={selectedParcels.includes(parcel.id)}
                        onChange={() => toggleSelect(parcel.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {parcel.trackingCode}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">{parcel.user.name}</span>
                          <span className="text-[10px] font-black text-slate-400">({parcel.user.clientCode})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase mt-1">
                          <MapPin className="w-3 h-3" />
                          {parcel.user.city || "Город не указан"}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-black text-slate-700">{parcel.weightKg || "—"} кг</span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={parcel.status} />
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
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">Загрузка данных...</p>
            </div>
          ) : filteredParcels.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Box className="w-12 h-12 opacity-10 mx-auto mb-4" />
              <p className="text-sm font-bold">Нет посылок для сортировки</p>
            </div>
          ) : (
            filteredParcels.map((parcel: any) => (
              <div
                key={parcel.id}
                className={cn(
                  "p-4 rounded-2xl border border-slate-200 space-y-3 transition-colors",
                  selectedParcels.includes(parcel.id) && "bg-blue-50/30 border-blue-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      checked={selectedParcels.includes(parcel.id)}
                      onChange={() => toggleSelect(parcel.id)}
                    />
                    <span className="font-black text-slate-900">{parcel.trackingCode}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{parcel.user.name}</span>
                  <span className="text-[10px] font-black text-slate-400">({parcel.user.clientCode})</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase">
                  <MapPin className="w-3 h-3" />
                  {parcel.user.city || "Город не указан"}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700">{parcel.weightKg || "—"} кг</span>
                  <StatusBadge status={parcel.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
