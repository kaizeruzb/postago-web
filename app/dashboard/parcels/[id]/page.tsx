"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Scale, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  Camera,
  Info
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { StatusBadge } from "../../components/status-badge";

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
  };
  events: ParcelEvent[];
  photos: { id: string; url: string }[];
  payments: { id: string; status: string }[];
}

const countryNames: Record<string, string> = {
  KR: "Южная Корея",
  CN: "Китай",
  TR: "Турция",
  UZ: "Узбекистан",
  KZ: "Казахстан",
};

export default function ParcelDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const { data: parcel, isLoading, error } = useQuery({
    queryKey: ["parcel", id],
    queryFn: () => api<Parcel>(`/api/parcels/${id}`, { token: token! }),
    enabled: !!token && !!id,
  });

  const createPaymentMutation = useMutation({
    mutationFn: () => api("/api/payments", {
      method: "POST",
      body: JSON.stringify({
        parcelId: id,
        provider: "cash", // MVP: using cash stub
        currency: "USD",
      }),
      token: token!,
    }),
    onSuccess: () => {
      window.location.reload();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="h-96 bg-slate-200 rounded-2xl" />
          </div>
          <div className="h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 font-bold mb-4">Посылка не найдена</p>
        <Link href="/dashboard" className="text-blue-600 font-bold underline">Вернуться в дашборд</Link>
      </div>
    );
  }

  const canPay = (parcel.status === "weighed" || parcel.status === "received_at_origin") && 
                !parcel.payments.some(p => p.status === "completed");

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{parcel.trackingCode}</h2>
              <StatusBadge status={parcel.status} />
            </div>
            <p className="text-slate-500 text-sm">Создан {new Date(parcel.createdAt).toLocaleDateString("ru-RU")}</p>
          </div>
        </div>

        {canPay && (
          <button
            onClick={() => createPaymentMutation.mutate()}
            disabled={createPaymentMutation.isPending}
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-black transition-all shadow-lg shadow-green-100"
          >
            <CreditCard className="w-5 h-5" />
            Оплатить ${(parcel.finalCost || parcel.calculatedCost || 0).toFixed(2)}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Информация об отправлении
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Маршрут</p>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {countryNames[parcel.route.originCountry]} → {countryNames[parcel.route.destinationCountry]}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Вес</p>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Scale className="w-4 h-4 text-blue-600" />
                  {parcel.weightKg ? `${parcel.weightKg} кг` : "Ожидает взвешивания"}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Стоимость</p>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  {parcel.finalCost ? `$${parcel.finalCost}` : parcel.calculatedCost ? `$${parcel.calculatedCost} (предв.)` : "Рассчитывается"}
                </div>
              </div>
            </div>
            {parcel.description && (
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-2">Описание</p>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{parcel.description}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                История перемещений
              </h3>
            </div>
            <div className="p-8">
              <div className="space-y-8">
                {parcel.events.map((event, index) => (
                  <div key={event.id} className="relative flex gap-6">
                    {index !== parcel.events.length - 1 && (
                      <div className="absolute left-3 top-8 bottom-[-24px] w-0.5 bg-slate-100" />
                    )}
                    <div className={`
                      relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0
                      ${index === 0 ? "bg-blue-600 shadow-lg shadow-blue-200" : "bg-slate-200"}
                    `}>
                      {index === 0 ? (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="space-y-1 pb-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-black ${index === 0 ? "text-slate-900" : "text-slate-500"}`}>
                          {event.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.timestamp).toLocaleString("ru-RU")}
                        </span>
                      </div>
                      {event.note && (
                        <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
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
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-8">
          {/* Photos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Фото со склада
              </h3>
            </div>
            <div className="p-6">
              {parcel.photos.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                  <Camera className="w-8 h-8 opacity-20 mb-2" />
                  <p className="text-xs font-bold">Фото пока нет</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {parcel.photos.map(photo => (
                    <div key={photo.id} className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-100 hover:scale-105 transition-transform cursor-pointer">
                      <img src={photo.url} alt="Parcel" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-black mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Советы
              </h4>
              <p className="text-xs leading-relaxed font-medium opacity-90">
                Оплатите посылку сразу после взвешивания, чтобы ускорить её отправку в следующей партии.
              </p>
            </div>
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
