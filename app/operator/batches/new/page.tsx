"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Layers, 
  Package, 
  ArrowRight,
  MapPin,
  Scale,
  Loader2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface Route {
  id: string;
  originCountry: string;
  destinationCountry: string;
  transportType: string;
  ratePerKg: number;
}

interface Parcel {
  id: string;
  trackingCode: string;
  weightKg?: number;
  routeId: string;
  user: {
    name: string;
    clientCode: string;
  };
}

export default function NewBatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const parcelIdsString = searchParams.get("parcels");
  const parcelIds = useMemo(() => parcelIdsString ? parcelIdsString.split(",") : [], [parcelIdsString]);

  const [selectedRouteId, setSelectedRouteId] = useState<string>("");

  const { data: routesData, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: () => api<{ routes: Route[] }>("/api/tariffs/routes"),
  });

  const { data: parcelsData, isLoading: isLoadingParcels } = useQuery({
    queryKey: ["parcels-to-batch", parcelIds],
    queryFn: async () => {
      const res = await api<{ parcels: Parcel[] }>("/api/parcels/warehouse/all", { token: token! });
      return res.parcels.filter((p: any) => parcelIds.includes(p.id));
    },
    enabled: !!token && parcelIds.length > 0,
  });

  const createBatchMutation = useMutation({
    mutationFn: (data: { routeId: string, parcelIds: string[] }) => 
      api("/api/batches", {
        method: "POST",
        body: JSON.stringify(data),
        token: token!,
      }),
    onSuccess: () => {
      router.push("/operator/batches");
    },
    onError: (err: any) => {
      alert(`Ошибка при создании партии: ${err.message}`);
    }
  });

  const filteredParcels = useMemo(() => {
    if (!selectedRouteId) return [];
    return parcelsData?.filter((p: any) => p.routeId === selectedRouteId) || [];
  }, [parcelsData, selectedRouteId]);

  const totalWeight = useMemo(() => 
    filteredParcels.reduce((sum: any, p: any) => sum + (p.weightKg || 0), 0).toFixed(3),
    [filteredParcels]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteId || filteredParcels.length === 0) return;
    createBatchMutation.mutate({
      routeId: selectedRouteId,
      parcelIds: filteredParcels.map((p: any) => p.id),
    });
  };

  if (parcelIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <p className="text-slate-400 font-bold mb-4">Посылки не выбраны</p>
        <Link href="/operator/warehouse" className="text-orange-600 font-black uppercase underline tracking-widest text-sm">Назад на склад</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/operator/warehouse"
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Новая Партия</h2>
          <p className="text-slate-500 font-medium">Группировка посылок для международной отправки</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Route Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              1. Выберите маршрут
            </h3>
            
            {isLoadingRoutes ? (
              <div className="h-12 bg-slate-50 animate-pulse rounded-xl" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {routesData?.routes.map((route: any) => (
                  <label 
                    key={route.id}
                    className={cn(
                      "relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all",
                      selectedRouteId === route.id 
                        ? "border-orange-600 bg-orange-50/50 shadow-lg shadow-orange-100/50" 
                        : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                    )}
                  >
                    <input 
                      type="radio" 
                      name="routeId" 
                      value={route.id}
                      checked={selectedRouteId === route.id}
                      onChange={(e) => setSelectedRouteId(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                        {route.originCountry} → {route.destinationCountry}
                      </span>
                      <span className="text-[10px] font-black text-orange-600 bg-white px-2 py-0.5 rounded-full border border-orange-100">
                        {route.transportType.toUpperCase()}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Selected Parcels List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                2. Список посылок
              </h3>
              <span className="text-xs font-black text-slate-400">
                {filteredParcels.length} из {parcelIds.length} выбрано
              </span>
            </div>

            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {isLoadingParcels ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
                  <p className="text-xs font-bold text-slate-400 uppercase">Загрузка посылок...</p>
                </div>
              ) : filteredParcels.length === 0 ? (
                <div className="py-12 px-8 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-400">Нет подходящих посылок для этого маршрута</p>
                  <p className="text-[10px] text-slate-300 uppercase">Выберите другой маршрут или проверьте выбор на складе</p>
                </div>
              ) : (
                filteredParcels.map((parcel: any) => (
                  <div key={parcel.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">{parcel.trackingCode}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{parcel.user.name} ({parcel.user.clientCode})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                      <Scale className="w-3.5 h-3.5 text-slate-300" />
                      {parcel.weightKg ? `${parcel.weightKg} кг` : "—"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Batch Summary & Action */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl shadow-slate-200 space-y-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Итоговая сводка</h4>
              
              <div className="space-y-6">
                <div className="flex items-end justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Всего посылок</p>
                    <p className="text-3xl font-black">{filteredParcels.length}</p>
                  </div>
                  <Layers className="w-8 h-8 text-slate-700" />
                </div>

                <div className="flex items-end justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Общий вес</p>
                    <p className="text-3xl font-black">{totalWeight} <span className="text-sm">кг</span></p>
                  </div>
                  <Scale className="w-8 h-8 text-slate-700" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={createBatchMutation.isPending || filteredParcels.length === 0}
              className={cn(
                "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-3",
                createBatchMutation.isPending || filteredParcels.length === 0
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700 hover:-translate-y-1 shadow-orange-900/20"
              )}
            >
              {createBatchMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Сформировать Партию
                </>
              )}
            </button>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
            <p className="text-xs font-bold text-orange-800 leading-relaxed italic">
              * После формирования партии, все входящие в неё посылки изменят статус на "В ПАРТИИ".
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
