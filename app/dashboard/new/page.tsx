"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Send,
  Info,
  Scale,
  Package,
  Calculator,
  CheckCircle2,
  ClipboardCopy,
  MapPin,
  ArrowRight,
  Truck,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { WAREHOUSES, COUNTRY_NAMES, TRANSPORT_TYPES } from "@/lib/constants";

interface Route {
  id: string;
  originCountry: string;
  destinationCountry: string;
  transportType: string;
  ratePerKg: number;
  minDays: number;
  maxDays: number;
}

interface CreatedParcel {
  id: string;
  trackingCode: string;
  route: Route;
  weightKg?: number;
  estimatedCost: number | null;
}

function groupRoutesByOrigin(routes: Route[]): [string, Route[]][] {
  const groups = new Map<string, Route[]>();
  for (const route of routes) {
    const list = groups.get(route.originCountry) || [];
    list.push(route);
    groups.set(route.originCountry, list);
  }
  return Array.from(groups.entries());
}

export default function NewParcelPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [routeId, setRouteId] = useState("");
  const [description, setDescription] = useState("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [declaredValue, setDeclaredValue] = useState<string>("");
  const [createdParcel, setCreatedParcel] = useState<CreatedParcel | null>(null);

  const { data: routesData, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: () => api<{ routes: Route[] }>("/api/tariffs/routes"),
  });

  const createParcelMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api<Record<string, unknown>>("/api/parcels", {
        method: "POST",
        body: JSON.stringify(data),
        token: token!,
      }),
    onSuccess: (parcel: Record<string, unknown>) => {
      const route = selectedRoute!;
      const weight = weightKg ? parseFloat(weightKg) : undefined;
      setCreatedParcel({
        id: parcel.id as string,
        trackingCode: parcel.trackingCode as string,
        route,
        weightKg: weight,
        estimatedCost: weight ? route.ratePerKg * weight : null,
      });
    },
    onError: (error: Error) => {
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

  const selectedRoute = routesData?.routes.find((r: Route) => r.id === routeId);
  const estimatedCost =
    selectedRoute && weightKg
      ? (selectedRoute.ratePerKg * parseFloat(weightKg)).toFixed(2)
      : null;

  // --- Success Screen ---
  if (createdParcel) {
    return <SuccessScreen parcel={createdParcel} />;
  }

  // --- Form ---
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
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Новая посылка
          </h2>
          <p className="text-slate-500">
            Заполните данные для оформления заказа
          </p>
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
            <div className="space-y-5">
              {groupRoutesByOrigin(routesData?.routes || []).map(
                ([origin, routes]) => {
                  const wh = WAREHOUSES.find((w) => w.originCode === origin);
                  return (
                    <div key={origin}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{wh?.flag}</span>
                        <span className="text-sm font-bold text-slate-700">
                          Из {COUNTRY_NAMES[origin] ?? origin}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {routes.map((route) => (
                          <label
                            key={route.id}
                            className={`
                              relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all
                              ${
                                routeId === route.id
                                  ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                  : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                              }
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
                                → {COUNTRY_NAMES[route.destinationCountry]}
                              </span>
                              <span className="text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-100">
                                ${route.ratePerKg}/кг
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                              <span>
                                {TRANSPORT_TYPES[route.transportType]}
                              </span>
                              <span>
                                {route.minDays}-{route.maxDays} дней
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
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
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Что внутри?
              </label>
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
                  Окончательный вес будет определен оператором на складе при
                  приемке.
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
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">
                  Предварительно
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">${estimatedCost}</span>
                  <span className="text-sm font-bold opacity-80">USD</span>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 max-w-xs text-slate-400">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] leading-relaxed">
                Стоимость может измениться после точного взвешивания на складе
                отправителя.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={createParcelMutation.isPending || !routeId}
            className={`
              w-full md:w-auto min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-xl
              ${
                createParcelMutation.isPending || !routeId
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0"
              }
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

// --- Success Screen Component ---

function SuccessScreen({ parcel }: { parcel: CreatedParcel }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(parcel.trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const warehouse = WAREHOUSES.find(
    (w) => w.originCode === parcel.route.originCountry
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Посылка оформлена!
        </h2>
        <p className="text-slate-500">
          Заказ успешно создан. Следуйте инструкциям ниже.
        </p>
      </div>

      {/* Tracking Code */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center shadow-lg">
        <p className="text-blue-200 text-sm font-medium mb-2">Трекинг-код</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl md:text-3xl font-black tracking-wider">
            {parcel.trackingCode}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            title="Скопировать"
          >
            <ClipboardCopy className="w-5 h-5" />
          </button>
        </div>
        {copied && (
          <p className="text-blue-200 text-xs mt-2 animate-pulse">
            Скопировано!
          </p>
        )}
      </div>

      {/* Warehouse Address */}
      {warehouse && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3>Куда нести посылку</h3>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{warehouse.flag}</span>
              <span className="font-bold text-slate-900">
                {warehouse.country}, {warehouse.city}
              </span>
            </div>
            <p className="text-sm text-slate-600 ml-8">{warehouse.address}</p>
          </div>
          <div className="flex items-start gap-2 text-slate-500">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
            <p className="text-sm">
              Наклейте трекинг-код <strong>{parcel.trackingCode}</strong> на
              посылку и сдайте на склад.
            </p>
          </div>
        </div>
      )}

      {/* Estimated Cost */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3>Стоимость доставки</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
            <div className="space-y-0.5">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Маршрут
              </p>
              <p className="text-sm font-medium text-slate-700">
                {COUNTRY_NAMES[parcel.route.originCountry]} →{" "}
                {COUNTRY_NAMES[parcel.route.destinationCountry]}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Тариф
              </p>
              <p className="text-sm font-medium text-slate-700">
                ${parcel.route.ratePerKg}/кг
              </p>
            </div>
          </div>

          {parcel.estimatedCost !== null && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-sm font-medium text-slate-700">
                Предварительная стоимость
              </span>
              <span className="text-lg font-black text-blue-600">
                ${parcel.estimatedCost.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex items-start gap-2 text-slate-500">
            <Scale className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
            <p className="text-sm">
              Точная сумма будет рассчитана после взвешивания на складе. Инвойс
              появится в вашем личном кабинете.
            </p>
          </div>
        </div>
      </div>

      {/* Return Policy */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <RotateCcw className="w-5 h-5 text-blue-600" />
          <h3>Возврат</h3>
        </div>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <Truck className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
            <span>Платный возврат курьером на указанный адрес</span>
          </li>
          <li className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
            <span>Бесплатный самовывоз со склада</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all"
        >
          <Package className="w-5 h-5" />
          Мои посылки
        </Link>
        <Link
          href="/dashboard/new"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/dashboard/new";
          }}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold transition-all"
        >
          <ArrowRight className="w-5 h-5" />
          Создать ещё одну
        </Link>
      </div>
    </div>
  );
}
