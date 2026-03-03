"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Info,
  Scale,
  Package,
  CheckCircle2,
  ClipboardCopy,
  MapPin,
  Truck,
  RotateCcw,
  Plane,
  Train,
  Ship,
  Combine,
  Calculator,
  ChevronDown,
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

const TRANSPORT_ICONS: Record<string, typeof Plane> = {
  air: Plane,
  rail: Train,
  sea: Ship,
  combined: Combine,
};

export default function NewParcelPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  // Wizard state
  const [step, setStep] = useState(1);

  // Form state
  const [originCountry, setOriginCountry] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [routeId, setRouteId] = useState("");
  const [description, setDescription] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [declaredValue, setDeclaredValue] = useState("");
  const [createdParcel, setCreatedParcel] = useState<CreatedParcel | null>(null);

  const { data: routesData, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: () => api<{ routes: Route[] }>("/api/tariffs/routes"),
  });

  // Filter routes by selected origin + destination
  const availableRoutes = useMemo(
    () =>
      routesData?.routes.filter(
        (r: Route) => r.originCountry === originCountry && r.destinationCountry === destinationCountry
      ) || [],
    [routesData, originCountry, destinationCountry]
  );

  const selectedRoute = availableRoutes.find((r: Route) => r.id === routeId);
  const estimatedCost =
    selectedRoute && weightKg
      ? (selectedRoute.ratePerKg * parseFloat(weightKg)).toFixed(2)
      : null;

  const selectedWarehouse = WAREHOUSES.find((w) => w.originCode === originCountry);

  // Available origin countries (only those that have routes)
  const originCountries = useMemo(() => {
    if (!routesData?.routes) return [];
    const codes = Array.from(new Set(routesData.routes.map((r: Route) => r.originCountry))) as string[];
    return codes.map((code) => ({
      code,
      name: COUNTRY_NAMES[code] || code,
      flag: WAREHOUSES.find((w) => w.originCode === code)?.flag || "",
    }));
  }, [routesData]);

  // Available destination countries for selected origin
  const destinationCountries = useMemo(() => {
    if (!routesData?.routes || !originCountry) return [];
    const codes = Array.from(
      new Set(
        routesData.routes
          .filter((r: Route) => r.originCountry === originCountry)
          .map((r: Route) => r.destinationCountry)
      )
    ) as string[];
    return codes.map((code) => ({
      code,
      name: COUNTRY_NAMES[code] || code,
    }));
  }, [routesData, originCountry]);

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
      setStep(4);
    },
    onError: (error: Error) => {
      alert(`Ошибка: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!routeId) return;
    createParcelMutation.mutate({
      routeId,
      description,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      declaredValue: declaredValue ? parseFloat(declaredValue) : undefined,
    });
  };

  // --- Success Screen ---
  if (step === 4 && createdParcel) {
    return <SuccessScreen parcel={createdParcel} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => (step === 1 ? router.push("/dashboard") : setStep(step - 1))}
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Новая посылка
          </h2>
          <p className="text-slate-500 text-sm">Шаг {step} из 3</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-blue-600" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Origin + Destination Country */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            {/* Origin */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3>Откуда отправляете?</h3>
              </div>

              {isLoadingRoutes ? (
                <div className="h-12 bg-slate-100 animate-pulse rounded-xl" />
              ) : (
                <div className="relative">
                  <select
                    value={originCountry}
                    onChange={(e) => {
                      setOriginCountry(e.target.value);
                      setDestinationCountry("");
                      setRouteId("");
                    }}
                    className="w-full appearance-none px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-lg font-medium bg-white"
                  >
                    <option value="">Выберите страну отправки</option>
                    {originCountries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Destination */}
            {originCountry && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                  <h3>Куда доставить?</h3>
                </div>

                <div className="relative">
                  <select
                    value={destinationCountry}
                    onChange={(e) => {
                      setDestinationCountry(e.target.value);
                      setRouteId("");
                    }}
                    className="w-full appearance-none px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-lg font-medium bg-white"
                  >
                    <option value="">Выберите страну доставки</option>
                    {destinationCountries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Warehouse info */}
          {selectedWarehouse && destinationCountry && (
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedWarehouse.flag}</span>
                <div>
                  <p className="font-bold text-slate-900">
                    Пункт приёма — {selectedWarehouse.city}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 ml-9">
                <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700">{selectedWarehouse.address}</p>
              </div>
              <p className="text-xs text-slate-500 ml-9">
                Принесите посылку по этому адресу после оформления заказа
              </p>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            disabled={!originCountry || !destinationCountry}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg transition-all ${
              originCountry && destinationCountry
                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Дальше
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 2: Transport Type + Weight */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Truck className="w-5 h-5 text-blue-600" />
              <h3>Тип перевозки</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {availableRoutes.map((route: Route) => {
                const Icon = TRANSPORT_ICONS[route.transportType] || Truck;
                return (
                  <label
                    key={route.id}
                    className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      routeId === route.id
                        ? "border-blue-600 bg-blue-50/50 shadow-sm"
                        : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="routeId"
                      value={route.id}
                      checked={routeId === route.id}
                      onChange={(e) => setRouteId(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        routeId === route.id
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {TRANSPORT_TYPES[route.transportType]}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          ${route.ratePerKg}/кг
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-slate-500">
                          → {COUNTRY_NAMES[route.destinationCountry]}
                        </span>
                        <span className="text-xs text-slate-500">
                          {route.minDays}–{route.maxDays} дней
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Weight + Cost Calculator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Scale className="w-5 h-5 text-blue-600" />
              <h3>Вес посылки</h3>
            </div>

            <div>
              <input
                type="number"
                step="0.1"
                placeholder="Введите приблизительный вес (кг)"
                className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-lg"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-2">
                Окончательный вес определяется на складе при приёмке
              </p>
            </div>

            {/* Live cost */}
            {estimatedCost && (
              <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Предварительная стоимость
                  </span>
                </div>
                <span className="text-xl font-black text-blue-600">
                  ${estimatedCost}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setStep(3)}
            disabled={!routeId}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg transition-all ${
              routeId
                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Дальше
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 3: Description + Declared Value */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Package className="w-5 h-5 text-blue-600" />
              <h3>Детали посылки</h3>
            </div>

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

          {/* Order summary */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-bold text-slate-700">Ваш заказ</p>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Маршрут</span>
                <span className="font-medium text-slate-900">
                  {selectedWarehouse?.flag}{" "}
                  {COUNTRY_NAMES[selectedRoute?.originCountry || ""]} →{" "}
                  {COUNTRY_NAMES[selectedRoute?.destinationCountry || ""]}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Тип</span>
                <span className="font-medium text-slate-900">
                  {TRANSPORT_TYPES[selectedRoute?.transportType || ""]}
                </span>
              </div>
              {weightKg && (
                <div className="flex justify-between">
                  <span>Вес</span>
                  <span className="font-medium text-slate-900">{weightKg} кг</span>
                </div>
              )}
              {estimatedCost && (
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="font-bold text-slate-900">Стоимость</span>
                  <span className="font-black text-blue-600">${estimatedCost}</span>
                </div>
              )}
            </div>
            <div className="flex items-start gap-2 pt-1">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400">
                Финальная стоимость рассчитывается после взвешивания на складе
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={createParcelMutation.isPending}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${
              createParcelMutation.isPending
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
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
      )}
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
