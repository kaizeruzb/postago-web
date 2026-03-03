"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Scale,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  Camera,
  Info,
  ClipboardCopy,
  Truck,
  RotateCcw,
  DollarSign,
  Package,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { StatusBadge } from "../../components/status-badge";
import { WAREHOUSES, COUNTRY_NAMES, TRANSPORT_TYPES } from "@/lib/constants";

interface ParcelEvent {
  id: string;
  status: string;
  location?: string;
  note?: string;
  timestamp: string;
}

interface Parcel {
  id: string;
  trackingCode: string;
  status: string;
  description?: string;
  weightKg?: number;
  finalCost?: number;
  calculatedCost?: number;
  createdAt: string;
  route: {
    originCountry: string;
    destinationCountry: string;
    transportType: string;
    ratePerKg?: number;
  };
  events: ParcelEvent[];
  photos: { id: string; url: string }[];
  payments: { id: string; status: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  created: "Создан",
  paid: "Оплачен",
  received_at_origin: "Принят на складе",
  weighed: "Взвешен",
  in_batch: "В партии",
  shipped: "Отправлен",
  in_transit: "В пути",
  customs: "На таможне",
  received_at_destination: "Прибыл",
  sorting: "Сортировка",
  out_for_delivery: "У курьера",
  delivered: "Доставлен",
};

// Statuses where the parcel hasn't left the origin warehouse yet
const EARLY_STATUSES = new Set(["created", "paid", "received_at_origin", "weighed"]);

export default function ParcelDetailsPage() {
  const { id } = useParams();
  const token = useAuthStore((state) => state.token);
  const [copied, setCopied] = useState(false);

  const { data: parcel, isLoading, error } = useQuery({
    queryKey: ["parcel", id],
    queryFn: () => api<Parcel>(`/api/parcels/${id}`, { token: token! }),
    enabled: !!token && !!id,
  });

  const createPaymentMutation = useMutation({
    mutationFn: () =>
      api("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          parcelId: id,
          provider: "cash",
          currency: "USD",
        }),
        token: token!,
      }),
    onSuccess: () => {
      window.location.reload();
    },
  });

  const handleCopy = () => {
    if (!parcel) return;
    navigator.clipboard.writeText(parcel.trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-3xl mx-auto">
        <div className="h-10 w-64 bg-slate-200 rounded-lg" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
        <div className="h-48 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 font-bold mb-4">Посылка не найдена</p>
        <Link
          href="/dashboard"
          className="text-blue-600 font-bold underline"
        >
          Вернуться в дашборд
        </Link>
      </div>
    );
  }

  const warehouse = WAREHOUSES.find(
    (w) => w.originCode === parcel.route.originCountry
  );
  const canPay =
    (parcel.status === "weighed" || parcel.status === "received_at_origin") &&
    !parcel.payments.some((p: { id: string; status: string }) => p.status === "completed");
  const isPaid = parcel.payments.some((p: { id: string; status: string }) => p.status === "completed");
  const showWarehouse = EARLY_STATUSES.has(parcel.status);
  const cost = parcel.finalCost || parcel.calculatedCost;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <p className="text-slate-500 text-sm">Детали посылки</p>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {parcel.trackingCode}
            </h2>
            <StatusBadge status={parcel.status} />
          </div>
        </div>
      </div>

      {/* Tracking Code — big copy block */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs font-medium mb-1">
              Трекинг-код
            </p>
            <span className="text-2xl font-black tracking-wider">
              {parcel.trackingCode}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            title="Скопировать"
          >
            <ClipboardCopy className="w-5 h-5" />
          </button>
        </div>
        {copied && (
          <p className="text-blue-200 text-xs mt-1 animate-pulse">
            Скопировано!
          </p>
        )}
      </div>

      {/* Warehouse Address — only for early statuses */}
      {showWarehouse && warehouse && (
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
              Наклейте трекинг-код{" "}
              <strong>{parcel.trackingCode}</strong> на посылку и сдайте на
              склад.
            </p>
          </div>
        </div>
      )}

      {/* Shipment Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Package className="w-5 h-5 text-blue-600" />
          <h3>Информация об отправлении</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Маршрут
            </p>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              {COUNTRY_NAMES[parcel.route.originCountry]} →{" "}
              {COUNTRY_NAMES[parcel.route.destinationCountry]}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Тип перевозки
            </p>
            <p className="text-sm font-bold text-slate-900">
              {TRANSPORT_TYPES[parcel.route.transportType] ||
                parcel.route.transportType}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Вес
            </p>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" />
              {parcel.weightKg ? `${parcel.weightKg} кг` : "Ожидает взвешивания"}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Создана
            </p>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              {new Date(parcel.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {parcel.description && (
          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Описание
            </p>
            <p className="text-sm text-slate-700">{parcel.description}</p>
          </div>
        )}
      </div>

      {/* Payment Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3>Оплата</h3>
        </div>

        {isPaid ? (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border border-green-100">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-green-700">
              Оплачено {cost ? `— $${Number(cost).toFixed(2)}` : ""}
            </span>
          </div>
        ) : cost ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-sm font-medium text-slate-700">
                К оплате
              </span>
              <span className="text-lg font-black text-amber-600">
                ${Number(cost).toFixed(2)}
              </span>
            </div>
            {canPay && (
              <button
                onClick={() => createPaymentMutation.mutate()}
                disabled={createPaymentMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                Оплатить ${Number(cost).toFixed(2)}
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2 px-4 py-3 bg-slate-50 rounded-xl">
            <Scale className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm text-slate-600">
                Ожидает взвешивания на складе
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Стоимость будет рассчитана после приёмки посылки
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {parcel.events.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3>История перемещений</h3>
          </div>
          <div className="space-y-6">
            {parcel.events.map((event: ParcelEvent, index: number) => (
              <div key={event.id} className="relative flex gap-4">
                {index !== parcel.events.length - 1 && (
                  <div className="absolute left-3 top-7 bottom-[-16px] w-0.5 bg-slate-100" />
                )}
                <div
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    index === 0
                      ? "bg-blue-600 shadow-lg shadow-blue-200"
                      : "bg-slate-200"
                  }`}
                >
                  {index === 0 ? (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`text-sm font-bold ${
                        index === 0 ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {STATUS_LABELS[event.status] || event.status}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.timestamp).toLocaleString("ru-RU")}
                    </span>
                  </div>
                  {event.note && (
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {event.note}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Camera className="w-5 h-5 text-blue-600" />
          <h3>Фото со склада</h3>
        </div>
        {parcel.photos.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
            <Camera className="w-8 h-8 opacity-20 mb-2" />
            <p className="text-xs font-bold">Фото появятся после приёмки на складе</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {parcel.photos.map((photo: { id: string; url: string }) => (
              <div
                key={photo.id}
                className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-100 hover:scale-105 transition-transform cursor-pointer"
              >
                <img
                  src={photo.url}
                  alt="Parcel"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
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
    </div>
  );
}
