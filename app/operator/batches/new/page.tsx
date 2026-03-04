"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Layers,
  Package,
  MapPin,
  Scale,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { COUNTRY_NAMES, TRANSPORT_TYPES } from "@/lib/constants";

interface Warehouse {
  id: string;
  country: string;
  city: string;
  address: string;
  type: "origin" | "destination";
}

interface Parcel {
  id: string;
  trackingCode: string;
  weightKg?: number;
  routeId: string;
  route: {
    id: string;
    originCountry: string;
    destinationCountry: string;
    transportType: string;
  };
  user?: {
    name: string;
    clientCode: string;
  };
}

function NewBatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const [destinationWarehouseId, setDestinationWarehouseId] = useState("");
  const parcelIdsString = searchParams.get("parcels");
  const parcelIds = useMemo(
    () => (parcelIdsString ? parcelIdsString.split(",") : []),
    [parcelIdsString]
  );

  const { data: parcels, isLoading } = useQuery<Parcel[]>({
    queryKey: ["parcels-to-batch", parcelIds],
    queryFn: async () => {
      const res = await api<{ parcels: Parcel[] }>(
        "/api/parcels/warehouse/all",
        { token: token! }
      );
      return res.parcels.filter((p: Parcel) => parcelIds.includes(p.id));
    },
    enabled: !!token && parcelIds.length > 0,
  });

  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api<{ warehouses: Warehouse[] }>("/api/warehouses", { token: token! }),
    enabled: !!token,
  });

  // Auto-detect route from parcels
  const detectedRoute = useMemo(() => {
    if (!parcels || parcels.length === 0) return null;
    return parcels[0].route;
  }, [parcels]);

  const routeId = detectedRoute?.id || "";

  const destinationWarehouses = warehousesData?.warehouses.filter(
    (w) => detectedRoute ? w.country === detectedRoute.destinationCountry : true
  ) || [];

  // Check if all parcels are on the same route
  const mixedRoutes = useMemo(() => {
    if (!parcels || parcels.length <= 1) return false;
    return parcels.some((p: Parcel) => p.routeId !== parcels[0].routeId);
  }, [parcels]);

  const totalWeight = useMemo(
    () =>
      (parcels || [])
        .reduce((sum: number, p: Parcel) => sum + Number(p.weightKg || 0), 0)
        .toFixed(2),
    [parcels]
  );

  const createBatchMutation = useMutation({
    mutationFn: (data: { routeId: string; parcelIds: string[]; destinationWarehouseId: string }) =>
      api("/api/batches", {
        method: "POST",
        body: JSON.stringify(data),
        token: token!,
      }),
    onSuccess: () => {
      router.push("/operator/batches");
    },
    onError: (err: Error) => {
      alert(`Ошибка при создании партии: ${err.message}`);
    },
  });

  const handleSubmit = () => {
    if (!routeId || !parcels || parcels.length === 0 || mixedRoutes || !destinationWarehouseId) return;
    createBatchMutation.mutate({
      routeId,
      parcelIds: parcels.map((p: Parcel) => p.id),
      destinationWarehouseId,
    });
  };

  if (parcelIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <p className="text-slate-400 font-bold mb-4">Посылки не выбраны</p>
        <Link
          href="/operator/warehouse"
          className="text-orange-600 font-black uppercase underline tracking-widest text-sm"
        >
          Назад на склад
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase">
          Загрузка посылок...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/operator/warehouse"
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Новая партия
          </h2>
          <p className="text-slate-500 text-sm">
            {parcels?.length || 0} посылок для отправки
          </p>
        </div>
      </div>

      {/* Mixed routes warning */}
      {mixedRoutes && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">
              Выбраны посылки с разными маршрутами
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Все посылки в одной партии должны иметь одинаковый маршрут.
              Вернитесь на склад и выберите посылки с одним маршрутом.
            </p>
          </div>
        </div>
      )}

      {/* Route — auto-detected */}
      {detectedRoute && !mixedRoutes && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <MapPin className="w-5 h-5 text-orange-600" />
            <h3>Маршрут</h3>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-black text-slate-900">
                {COUNTRY_NAMES[detectedRoute.originCountry] ||
                  detectedRoute.originCountry}{" "}
                →{" "}
                {COUNTRY_NAMES[detectedRoute.destinationCountry] ||
                  detectedRoute.destinationCountry}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                {TRANSPORT_TYPES[detectedRoute.transportType] ||
                  detectedRoute.transportType}
              </p>
            </div>
            <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-black uppercase">
              {detectedRoute.transportType}
            </div>
          </div>
        </div>
      )}

      {/* Destination warehouse selector */}
      {!mixedRoutes && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <MapPin className="w-5 h-5 text-orange-600" />
            <h3>Склад назначения</h3>
          </div>
          <select
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:border-orange-600 focus:ring-0 outline-none transition-all"
            value={destinationWarehouseId}
            onChange={(e) => setDestinationWarehouseId(e.target.value)}
          >
            <option value="">Выберите склад назначения</option>
            {destinationWarehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {COUNTRY_NAMES[w.country] || w.country}, {w.city}
              </option>
            ))}
          </select>
          {!destinationWarehouseId && (
            <p className="text-xs font-bold text-amber-600">
              Выберите склад назначения для формирования партии
            </p>
          )}
        </div>
      )}

      {/* Parcels list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Package className="w-5 h-5 text-orange-600" />
            <h3>Посылки в партии</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {parcels?.length || 0} шт.
          </span>
        </div>

        <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
          {(parcels || []).map((parcel: Parcel) => (
            <div
              key={parcel.id}
              className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="text-sm font-black text-slate-900">
                  {parcel.trackingCode}
                </p>
                <p className="text-[10px] font-medium text-slate-400">
                  {parcel.user
                    ? `${parcel.user.name} (${parcel.user.clientCode})`
                    : "—"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                {parcel.weightKg
                  ? `${Number(parcel.weightKg).toFixed(2)} кг`
                  : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary + Submit */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Посылок
            </p>
            <p className="text-3xl font-black">{parcels?.length || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Общий вес
            </p>
            <p className="text-3xl font-black">
              {totalWeight}{" "}
              <span className="text-sm text-slate-400">кг</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={
            createBatchMutation.isPending ||
            !parcels?.length ||
            mixedRoutes ||
            !destinationWarehouseId
          }
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
            createBatchMutation.isPending || !parcels?.length || mixedRoutes || !destinationWarehouseId
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg"
          }`}
        >
          {createBatchMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Сформировать партию
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        После формирования партии все посылки получат статус «В партии»
      </p>
    </div>
  );
}

export default function NewBatchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      }
    >
      <NewBatchContent />
    </Suspense>
  );
}
