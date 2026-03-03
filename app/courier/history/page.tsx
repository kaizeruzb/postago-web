"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Package, 
  CheckCircle2, 
  Loader2,
  Calendar,
  User,
  MapPin
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { StatusBadge } from "@/app/dashboard/components/status-badge";

interface Parcel {
  id: string;
  trackingCode: string;
  status: string;
  weightKg?: number;
  updatedAt: string;
  user: {
    name: string;
    clientCode: string;
    city?: string;
  };
}

export default function CourierHistory() {
  const token = useAuthStore((state) => state.token);

  const { data, isLoading } = useQuery({
    queryKey: ["courier-history"],
    queryFn: () => api<{ parcels: Parcel[] }>("/api/parcels/warehouse/all?status=delivered", { token: token! }),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Загрузка истории...</p>
      </div>
    );
  }

  const parcels = data?.parcels || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">История Доставок</h2>

      {parcels.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 py-20 flex flex-col items-center justify-center text-center px-6">
          <Package className="w-12 h-12 text-slate-100 mb-4" />
          <p className="text-sm font-bold text-slate-400">История пуста</p>
        </div>
      ) : (
        <div className="space-y-3">
          {parcels.map((parcel: any) => (
            <div key={parcel.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{parcel.trackingCode}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{parcel.user.name}</span>
                    <span className="text-[10px] font-black text-slate-300">•</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{parcel.user.city || "Ташкент"}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase justify-end mb-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(parcel.updatedAt).toLocaleDateString("ru-RU")}
                </div>
                <StatusBadge status={parcel.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
