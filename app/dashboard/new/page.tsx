"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Send, Info, Scale, Package, Calculator } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

interface Route {
  id: string;
  originCountry: string;
  destinationCountry: string;
  transportType: string;
  ratePerKg: number;
  minDays: number;
  maxDays: number;
}

const countryNames: Record<string, string> = {
  KR: "Южная Корея",
  CN: "Китай",
  TR: "Турция",
  UZ: "Узбекистан",
  KZ: "Казахстан",
};

const transportTypes: Record<string, string> = {
  air: "Авиа",
  rail: "Ж/Д",
  sea: "Море",
  combined: "Комбинированный",
};

export default function NewParcelPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  
  const [routeId, setRouteId] = useState("");
  const [description, setDescription] = useState("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [declaredValue, setDeclaredValue] = useState<string>("");
  
  const { data: routesData, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: () => api<{ routes: Route[] }>("/api/tariffs/routes"),
  });

  const createParcelMutation = useMutation({
    mutationFn: (data: any) => api("/api/parcels", {
      method: "POST",
      body: JSON.stringify(data),
      token: token!,
    }),
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error: any) => {
      alert(`Ошибка: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeId) return alert("Выберите маршрут");
    
    createParcelMutation.mutate({
      routeId,
      description,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      declaredValue: declaredValue ? parseFloat(declaredValue) : undefined,
    });
  };

  const selectedRoute = routesData?.routes.find(r => r.id === routeId);
  const estimatedCost = selectedRoute && weightKg 
    ? (selectedRoute.ratePerKg * parseFloat(weightKg)).toFixed(2) 
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard"
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Новая посылка</h2>
          <p className="text-slate-500">Заполните данные для оформления заказа</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Route Selection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h3>Маршрут и Тариф</h3>
          </div>
          
          {isLoadingRoutes ? (
            <div className="h-12 bg-slate-100 animate-pulse rounded-xl" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routesData?.routes.map((route) => (
                <label 
                  key={route.id}
                  className={`
                    relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all
                    ${routeId === route.id 
                      ? "border-blue-600 bg-blue-50/50" 
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/50"}
                  `}
                >
                  <input 
                    type="radio" 
                    name="routeId" 
                    value={route.id}
                    checked={routeId === route.id}
                    onChange={(e) => setRouteId(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-slate-900">
                      {countryNames[route.originCountry]} → {countryNames[route.destinationCountry]}
                    </span>
                    <span className="text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-100">
                      ${route.ratePerKg}/кг
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <span>{transportTypes[route.transportType]}</span>
                    <span>{route.minDays}-{route.maxDays} дней</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Parcel Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Package className="w-5 h-5 text-blue-600" />
            <h3>Детали посылки</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Что внутри?</label>
              <textarea
                placeholder="Например: одежда, электроника, подарки..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-400" />
                  Приблизительный вес (кг)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                  Окончательный вес будет определен оператором на складе при приемке.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Объявленная стоимость ($)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  value={declaredValue}
                  onChange={(e) => setDeclaredValue(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Price Preview & Submit */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
          <div className="flex items-center gap-4">
            {estimatedCost && (
              <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-lg shadow-blue-200">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Предварительно</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">${estimatedCost}</span>
                  <span className="text-sm font-bold opacity-80">USD</span>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 max-w-xs text-slate-400">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] leading-relaxed">
                Стоимость может измениться после точного взвешивания на складе отправителя.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={createParcelMutation.isPending || !routeId}
            className={`
              w-full md:w-auto min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-xl
              ${createParcelMutation.isPending || !routeId
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0"}
            `}
          >
            {createParcelMutation.isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Создать заказ
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
