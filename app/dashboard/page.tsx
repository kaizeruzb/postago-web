"use client";

import { useQuery } from "@tanstack/react-query";
import { PlusCircle, PackageSearch } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { ParcelCard } from "./components/parcel-card";

export default function DashboardPage() {
  const token = useAuthStore((state) => state.token);

  const { data, isLoading, error } = useQuery({
    queryKey: ["parcels"],
    queryFn: () => api<{ parcels: any[] }>("/api/parcels", { token: token! }),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-10 w-40 bg-slate-200 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
        <p className="text-red-500 font-medium mb-4">Ошибка загрузки посылок</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  const parcels = data?.parcels || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Мои посылки</h2>
          <p className="text-slate-500 mt-1">Отслеживайте свои отправления в реальном времени</p>
        </div>
        
        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <PlusCircle className="w-5 h-5" />
          Оформить посылку
        </Link>
      </div>

      {parcels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="bg-slate-50 p-6 rounded-full mb-6">
            <PackageSearch className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">У вас пока нет посылок</h3>
          <p className="text-slate-500 mb-8 max-w-sm text-center">
            Создайте свою первую посылку, чтобы начать пользоваться услугами PostaGo
          </p>
          <Link
            href="/dashboard/new"
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
          >
            Создать посылку
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parcels.map((parcel: any) => (
            <ParcelCard key={parcel.id} parcel={parcel} />
          ))}
        </div>
      )}
    </div>
  );
}
