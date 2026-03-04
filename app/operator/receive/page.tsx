"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Search,
  User,
  Scale,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Loader2,
  CreditCard,
  Banknote,
  Warehouse,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { COUNTRY_NAMES } from "@postago/shared";

interface ParcelData {
  id: string;
  trackingCode: string;
  status: string;
  weightKg?: number;
  finalCost?: number;
  description?: string;
  user: { name: string; clientCode: string; phone: string };
  route: {
    originCountry: string;
    destinationCountry: string;
    ratePerKg: number;
  };
}

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = [
  { step: 1, label: "Поиск" },
  { step: 2, label: "Взвешивание" },
  { step: 3, label: "Оплата" },
  { step: 4, label: "Приёмка" },
];

export default function ReceivePage() {
  const token = useAuthStore((state) => state.token);
  const [step, setStep] = useState<Step>(1);
  const [trackingCode, setTrackingCode] = useState("");
  const [parcel, setParcel] = useState<ParcelData | null>(null);
  const [weight, setWeight] = useState("");
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);
  const [searchError, setSearchError] = useState("");
  const [completed, setCompleted] = useState(false);

  // Calculate cost when weight changes
  useEffect(() => {
    if (parcel && weight) {
      const w = parseFloat(weight);
      if (w > 0) {
        setCalculatedCost(w * Number(parcel.route.ratePerKg));
      } else {
        setCalculatedCost(null);
      }
    } else {
      setCalculatedCost(null);
    }
  }, [weight, parcel]);

  // Search parcel by tracking code
  const searchMutation = useMutation({
    mutationFn: (code: string) =>
      api<ParcelData>(`/api/parcels/track/${code}`, { token: token! }),
    onSuccess: (data) => {
      setParcel(data);
      setSearchError("");
      // Determine which step to show based on current parcel status
      if (data.status === "created") {
        setStep(2);
      } else if (data.status === "weighed") {
        setWeight(data.weightKg?.toString() || "");
        setCalculatedCost(data.finalCost ? Number(data.finalCost) : null);
        setStep(3);
      } else if (data.status === "paid") {
        setWeight(data.weightKg?.toString() || "");
        setCalculatedCost(data.finalCost ? Number(data.finalCost) : null);
        setStep(4);
      } else {
        setSearchError(`Посылка в статусе "${data.status}" — приёмка невозможна`);
      }
    },
    onError: () => {
      setSearchError("Посылка не найдена");
      setParcel(null);
    },
  });

  // Step 2: Weigh parcel
  const weighMutation = useMutation({
    mutationFn: (data: { id: string; weightKg: number }) =>
      api<ParcelData>(`/api/parcels/${data.id}/weight`, {
        method: "PATCH",
        body: JSON.stringify({ weightKg: data.weightKg }),
        token: token!,
      }),
    onSuccess: (data) => {
      setParcel({ ...parcel!, ...data, status: "weighed" });
      setCalculatedCost(data.finalCost ? Number(data.finalCost) : calculatedCost);
      setStep(3);
    },
  });

  // Step 3: Confirm payment
  const paymentMutation = useMutation({
    mutationFn: (id: string) =>
      api<ParcelData>(`/api/parcels/${id}/confirm-payment`, {
        method: "PATCH",
        token: token!,
      }),
    onSuccess: (data) => {
      setParcel({ ...parcel!, ...data, status: "paid" });
      setStep(4);
    },
  });

  // Step 4: Accept to warehouse
  const acceptMutation = useMutation({
    mutationFn: (id: string) =>
      api<ParcelData>(`/api/parcels/${id}/accept`, {
        method: "PATCH",
        token: token!,
      }),
    onSuccess: () => {
      setCompleted(true);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    searchMutation.mutate(trackingCode.trim());
  };

  const handleWeigh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcel || !weight) return;
    weighMutation.mutate({ id: parcel.id, weightKg: parseFloat(weight) });
  };

  const handleReset = () => {
    setStep(1);
    setTrackingCode("");
    setParcel(null);
    setWeight("");
    setCalculatedCost(null);
    setSearchError("");
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <div className="bg-green-600 text-white p-10 rounded-3xl text-center shadow-2xl shadow-green-200">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-black uppercase tracking-wider mb-2">Принято!</h2>
          <p className="text-lg font-bold opacity-80 mb-2">{parcel?.trackingCode}</p>
          <p className="font-bold opacity-60">Посылка принята на склад</p>
          <button
            onClick={handleReset}
            className="mt-8 px-8 py-4 bg-white text-green-700 rounded-2xl font-black uppercase tracking-wider hover:bg-green-50 transition-all flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            Следующая посылка
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
          Приёмка посылок
        </h2>
        <p className="text-slate-500">Поиск → Взвешивание → Оплата → Приём на склад</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map(({ step: s, label }) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all",
                step === s
                  ? "bg-orange-600 text-white"
                  : step > s
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-400"
              )}
            >
              <span>{s}</span>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {s < 4 && (
              <ArrowRight
                className={cn(
                  "w-4 h-4",
                  step > s ? "text-green-400" : "text-slate-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Search */}
      <div
        className={cn(
          "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all",
          step === 1 ? "ring-2 ring-orange-600" : step > 1 ? "opacity-60" : ""
        )}
      >
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="font-black text-xs uppercase text-slate-500 tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4" />
            Шаг 1: Поиск посылки
          </span>
          {step > 1 && parcel && (
            <span className="text-xs font-black text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {parcel.trackingCode}
            </span>
          )}
        </div>
        {step === 1 && (
          <div className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                placeholder="Введите трекинг-код (PG-KR-...)"
                autoFocus
                className="flex-1 px-5 py-4 text-lg font-bold rounded-xl border-2 border-slate-200 focus:border-orange-600 focus:ring-0 outline-none transition-all"
                value={trackingCode}
                onChange={(e) => {
                  setTrackingCode(e.target.value);
                  setSearchError("");
                }}
              />
              <button
                type="submit"
                disabled={searchMutation.isPending || !trackingCode.trim()}
                className="px-6 py-4 bg-orange-600 text-white rounded-xl font-black uppercase tracking-wider hover:bg-orange-700 transition-all disabled:bg-slate-200 disabled:text-slate-400"
              >
                {searchMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </form>
            {searchError && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {searchError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Parcel info card (shown after search) */}
      {parcel && step >= 2 && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-tight">{parcel.trackingCode}</h3>
            <div className="flex flex-wrap gap-4 text-sm font-bold opacity-70">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> {parcel.user.name}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />{" "}
                {COUNTRY_NAMES[parcel.route.originCountry] || parcel.route.originCountry} →{" "}
                {COUNTRY_NAMES[parcel.route.destinationCountry] || parcel.route.destinationCountry}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
              Клиент
            </p>
            <p className="text-xl font-black">{parcel.user.clientCode}</p>
          </div>
        </div>
      )}

      {/* Step 2: Weigh */}
      {step >= 2 && (
        <div
          className={cn(
            "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all",
            step === 2 ? "ring-2 ring-orange-600" : step > 2 ? "opacity-60" : ""
          )}
        >
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="font-black text-xs uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Шаг 2: Взвешивание
            </span>
            {step > 2 && (
              <span className="text-xs font-black text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {weight} кг — ${calculatedCost?.toFixed(2)}
              </span>
            )}
          </div>
          {step === 2 && (
            <form onSubmit={handleWeigh} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-orange-600" />
                    Вес (кг)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      autoFocus
                      required
                      className="w-full px-6 py-6 text-4xl font-black bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-orange-600 focus:ring-0 outline-none transition-all text-slate-900"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">
                      KG
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  {calculatedCost !== null && (
                    <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">
                        Стоимость доставки
                      </p>
                      <p className="text-4xl font-black text-orange-900">
                        ${calculatedCost.toFixed(2)}
                      </p>
                      <p className="text-xs font-bold text-orange-600/60 mt-1">
                        {weight} кг × ${Number(parcel?.route.ratePerKg).toFixed(2)}/кг
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={weighMutation.isPending || !weight || parseFloat(weight) <= 0}
                className={cn(
                  "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-lg transition-all",
                  weighMutation.isPending || !weight || parseFloat(weight) <= 0
                    ? "bg-slate-100 text-slate-400"
                    : "bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-100"
                )}
              >
                {weighMutation.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  "Взвесить"
                )}
              </button>
              {weighMutation.isError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Ошибка при взвешивании
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* Step 3: Payment */}
      {step >= 3 && (
        <div
          className={cn(
            "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all",
            step === 3 ? "ring-2 ring-orange-600" : step > 3 ? "opacity-60" : ""
          )}
        >
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="font-black text-xs uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Шаг 3: Оплата
            </span>
            {step > 3 && (
              <span className="text-xs font-black text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Оплачено
              </span>
            )}
          </div>
          {step === 3 && (
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  К оплате
                </p>
                <p className="text-5xl font-black text-slate-900">
                  ${calculatedCost?.toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => parcel && paymentMutation.mutate(parcel.id)}
                disabled={paymentMutation.isPending}
                className={cn(
                  "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-lg transition-all flex items-center justify-center gap-3",
                  paymentMutation.isPending
                    ? "bg-slate-100 text-slate-400"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-xl shadow-green-100"
                )}
              >
                {paymentMutation.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Banknote className="w-6 h-6" />
                    Подтвердить оплату (наличные)
                  </>
                )}
              </button>
              {paymentMutation.isError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Ошибка при подтверждении оплаты
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Accept */}
      {step >= 4 && (
        <div
          className={cn(
            "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all",
            step === 4 ? "ring-2 ring-orange-600" : ""
          )}
        >
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <span className="font-black text-xs uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <Warehouse className="w-4 h-4" />
              Шаг 4: Приём на склад
            </span>
          </div>
          {step === 4 && (
            <div className="p-6">
              <button
                onClick={() => parcel && acceptMutation.mutate(parcel.id)}
                disabled={acceptMutation.isPending}
                className={cn(
                  "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-lg transition-all flex items-center justify-center gap-3",
                  acceptMutation.isPending
                    ? "bg-slate-100 text-slate-400"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100"
                )}
              >
                {acceptMutation.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Warehouse className="w-6 h-6" />
                    Принять на склад
                  </>
                )}
              </button>
              {acceptMutation.isError && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Ошибка при приёме на склад
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reset button */}
      {step > 1 && (
        <button
          onClick={handleReset}
          className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Начать заново
        </button>
      )}
    </div>
  );
}
