"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Package, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Loader2,
  Navigation,
  User,
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface Parcel {
  id: string;
  trackingCode: string;
  status: string;
  weightKg?: number;
  user: {
    name: string;
    phone: string;
    city?: string;
    clientCode: string;
  };
}

export default function CourierDashboard() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  const { data, isLoading, error } = useQuery({
    queryKey: ["courier-deliveries"],
    queryFn: () => api<{ parcels: Parcel[] }>("/api/parcels/warehouse/all?status=out_for_delivery", { token: token! }),
    enabled: !!token,
  });

  const deliverMutation = useMutation({
    mutationFn: (id: string) => 
      api(`/api/parcels/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "delivered", note: "Доставлено курьером" }),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courier-deliveries"] });
      alert("Доставка успешно завершена!");
    },
    onError: (err: any) => {
      alert(`Ошибка при завершении доставки: ${err.message}`);
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Загрузка маршрутов...</p>
      </div>
    );
  }

  const parcels = data?.parcels || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Активные Доставки</h2>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {parcels.length} заказов
        </span>
      </div>

      {parcels.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-20 flex flex-col items-center justify-center text-center px-6">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <Package className="w-12 h-12 text-slate-200" />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase mb-1">Свободная смена</h3>
          <p className="text-sm font-medium text-slate-400 max-w-xs leading-relaxed">
            Пока нет заказов на доставку. Как только оператор склада назначит посылки, они появятся здесь.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {parcels.map((parcel) => (
            <div key={parcel.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Трекинг:</span>
                      <span className="text-sm font-black text-slate-900">{parcel.trackingCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-none">{parcel.user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Клиент ID: {parcel.user.clientCode}</p>
                      </div>
                    </div>
                  </div>
                  <a 
                    href={`tel:${parcel.user.phone}`}
                    className="flex flex-col items-center justify-center gap-1 h-14 w-14 rounded-2xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-lg shadow-green-100/50 group"
                  >
                    <Phone className="w-5 h-5 group-active:scale-90 transition-transform" />
                    <span className="text-[8px] font-black uppercase">Позвонить</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 flex gap-3">
                    <MapPin className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Адрес доставки</p>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">
                        {parcel.user.city || "Узбекистан, Ташкент"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 flex gap-3">
                    <Navigation className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Карта</p>
                      <a 
                        href={`https://maps.google.com/?q=${parcel.user.city || "Tashkent"}`}
                        target="_blank"
                        className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        Открыть в Google Maps
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deliverMutation.mutate(parcel.id)}
                  disabled={deliverMutation.isPending}
                  className={cn(
                    "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-3",
                    deliverMutation.isPending
                      ? "bg-slate-100 text-slate-300"
                      : "bg-green-600 text-white hover:bg-green-700 hover:-translate-y-1 shadow-green-100"
                  )}
                >
                  {deliverMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Подтвердить Доставку
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
