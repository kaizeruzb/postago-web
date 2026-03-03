"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Layers, 
  Search, 
  ArrowRight, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package,
  Loader2,
  PlusCircle,
  Hash
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface Batch {
  id: string;
  status: string;
  totalWeight?: number;
  totalParcels: number;
  trackingNumber?: string;
  shippedAt?: string;
  createdAt: string;
  route: {
    originCountry: string;
    destinationCountry: string;
    transportType: string;
  };
  operator: {
    name: string;
  };
}

export default function BatchesPage() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [searchTerm, setSearchTerm] = useState("");
  const [shippingBatchId, setShippingBatchId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: () => api<{ batches: Batch[] }>("/api/batches", { token: token! }),
    enabled: !!token,
  });

  const shipBatchMutation = useMutation({
    mutationFn: (data: { id: string, trackingNumber: string }) => 
      api(`/api/batches/${data.id}/ship`, {
        method: "POST",
        body: JSON.stringify({ trackingNumber: data.trackingNumber }),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      setShippingBatchId(null);
      setTrackingNumber("");
    },
    onError: (err: any) => {
      alert(`Ошибка при отправке партии: ${err.message}`);
    }
  });

  const filteredBatches = data?.batches.filter((b: any) => 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.trackingNumber && b.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const batchStatusMap: Record<string, { label: string, color: string, icon: any }> = {
    forming: { label: "Формируется", color: "bg-blue-100 text-blue-700", icon: Clock },
    shipped: { label: "Отправлена", color: "bg-indigo-100 text-indigo-700", icon: Truck },
    in_transit: { label: "В пути", color: "bg-sky-100 text-sky-700", icon: Truck },
    received: { label: "Принята", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Управление Партиями</h2>
          <p className="text-slate-500 font-medium">Формирование и отправка международных грузов</p>
        </div>

        <Link
          href="/operator/warehouse"
          className="inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-slate-100"
        >
          <PlusCircle className="w-5 h-5" />
          Новая Партия
        </Link>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по ID или трекинг-номеру..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-4">
                <th className="px-6 pb-2">Партия / Маршрут</th>
                <th className="px-6 pb-2">Статус</th>
                <th className="px-6 pb-2">Состав</th>
                <th className="px-6 pb-2">Вес</th>
                <th className="px-6 pb-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center bg-slate-50 rounded-3xl">
                    <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">Загрузка партий...</p>
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center bg-slate-50 rounded-3xl">
                    <Layers className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400">Партии еще не созданы</p>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch: any) => {
                  const status = batchStatusMap[batch.status] || { label: batch.status, color: "bg-slate-100 text-slate-700", icon: Clock };
                  const isShipping = shippingBatchId === batch.id;

                  return (
                    <tr key={batch.id} className="group">
                      <td className="px-6 py-6 bg-slate-50 rounded-l-3xl border-y border-l border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID:</span>
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{batch.id}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm font-black text-slate-900">
                            {batch.route.originCountry}
                            <ArrowRight className="w-4 h-4 text-orange-600" />
                            {batch.route.destinationCountry}
                            <span className="ml-2 text-[10px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">
                              {batch.route.transportType.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 bg-slate-50 border-y border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          status.color
                        )}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </div>
                        {batch.trackingNumber && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <Hash className="w-3 h-3" />
                            {batch.trackingNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-6 bg-slate-50 border-y border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-black text-slate-900">{batch.totalParcels}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">ед.</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 bg-slate-50 border-y border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                        <span className="text-sm font-black text-slate-900">{batch.totalWeight ? Number(batch.totalWeight).toFixed(2) : "—"}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">кг</span>
                      </td>
                      <td className="px-6 py-6 bg-slate-50 rounded-r-3xl border-y border-r border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                        {batch.status === "forming" ? (
                          isShipping ? (
                            <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                              <input
                                type="text"
                                autoFocus
                                placeholder="Трекинг №"
                                className="w-32 px-3 py-2 bg-white border border-orange-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-orange-600 outline-none"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                              />
                              <button
                                onClick={() => shipBatchMutation.mutate({ id: batch.id, trackingNumber })}
                                disabled={shipBatchMutation.isPending || !trackingNumber}
                                className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                              >
                                {shipBatchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => { setShippingBatchId(null); setTrackingNumber(""); }}
                                className="text-[10px] font-black text-slate-400 uppercase hover:text-red-500"
                              >
                                Отмена
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShippingBatchId(batch.id)}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Отправить
                            </button>
                          )
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 italic">
                            {batch.shippedAt ? `Отправлена ${new Date(batch.shippedAt).toLocaleDateString("ru-RU")}` : "Завершена"}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
