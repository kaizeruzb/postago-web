"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Layers, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Package,
  Loader2,
  Hash,
  MapPin,
  AlertCircle
} from "lucide-react";
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
}

export default function DestinationReceivePage() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["incoming-batches"],
    queryFn: () => api<{ batches: Batch[] }>("/api/batches?status=shipped", { token: token! }),
    enabled: !!token,
  });

  const receiveBatchMutation = useMutation({
    mutationFn: (id: string) => 
      api(`/api/batches/${id}/receive`, {
        method: "POST",
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-batches"] });
      alert("Партия успешно принята на складе назначения!");
    },
    onError: (err: any) => {
      alert(`Ошибка при приемке партии: ${err.message}`);
    }
  });

  const filteredBatches = data?.batches.filter(b => 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.trackingNumber && b.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Приемка Партий</h2>
        <p className="text-slate-500 font-medium">Приемка грузов, прибывших из стран отправления</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по ID или трекинг-номеру..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-4">
                <th className="px-6 pb-2">Партия / Трекинг</th>
                <th className="px-6 pb-2">Маршрут</th>
                <th className="px-6 pb-2">Дата отправки</th>
                <th className="px-6 pb-2">Состав / Вес</th>
                <th className="px-6 pb-2">Действие</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center bg-slate-50 rounded-3xl">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">Загрузка данных...</p>
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center bg-slate-50 rounded-3xl">
                    <Layers className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400">Нет партий в пути</p>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => (
                  <tr key={batch.id} className="group">
                    <td className="px-6 py-6 bg-slate-50 rounded-l-3xl border-y border-l border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID:</span>
                          <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{batch.id}</span>
                        </div>
                        {batch.trackingNumber && (
                          <div className="flex items-center gap-1.5 text-xs font-black text-blue-600">
                            <Hash className="w-3.5 h-3.5" />
                            {batch.trackingNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 bg-slate-50 border-y border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                      <div className="flex items-center gap-3 text-sm font-black text-slate-900">
                        {batch.route.originCountry}
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                        {batch.route.destinationCountry}
                        <span className="ml-2 text-[10px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 uppercase">
                          {batch.route.transportType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 bg-slate-50 border-y border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Clock className="w-4 h-4 text-slate-300" />
                        {batch.shippedAt ? new Date(batch.shippedAt).toLocaleDateString("ru-RU") : "—"}
                      </div>
                    </td>
                    <td className="px-6 py-6 bg-slate-50 border-y border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          {batch.totalParcels} ед.
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          {batch.totalWeight?.toFixed(2) || "—"} кг
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 bg-slate-50 rounded-r-3xl border-y border-r border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                      <button
                        onClick={() => receiveBatchMutation.mutate(batch.id)}
                        disabled={receiveBatchMutation.isPending}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                      >
                        {receiveBatchMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Принять
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 flex gap-6">
        <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-100">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-black text-blue-900 uppercase tracking-widest text-sm mb-2">Важно для оператора</h4>
          <p className="text-sm font-medium text-blue-800 leading-relaxed max-w-2xl">
            При нажатии кнопки "Принять", все посылки в этой партии автоматически изменят статус на "Прибыло в пункт назначения". После этого они станут доступны для сортировки и растаможки.
          </p>
        </div>
      </div>
    </div>
  );
}
