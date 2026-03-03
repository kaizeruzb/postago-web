"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Truck, 
  DollarSign, 
  Clock, 
  Loader2,
  X,
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface Route {
  id: string;
  originCountry: string;
  destinationCountry: string;
  transportType: string;
  ratePerKg: number;
  minDays: number;
  maxDays: number;
  isActive: boolean;
}

const countryNames: Record<string, string> = {
  KR: "Южная Корея",
  CN: "Китай",
  TR: "Турция",
  UZ: "Узбекистан",
  KZ: "Казахстан",
};

export default function AdminRoutes() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or route ID
  
  // Form State
  const [formData, setFormData] = useState({
    originCountry: "KR",
    destinationCountry: "UZ",
    transportType: "air",
    ratePerKg: 0,
    minDays: 7,
    maxDays: 14,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-routes"],
    queryFn: () => api<{ routes: Route[] }>("/api/tariffs/routes", { token: token! }),
    enabled: !!token,
  });

  const upsertMutation = useMutation({
    mutationFn: (data: any) => {
      const isNew = isEditing === "new";
      return api(isNew ? "/api/tariffs/routes" : `/api/tariffs/routes/${isEditing}`, {
        method: isNew ? "POST" : "PATCH",
        body: JSON.stringify(data),
        token: token!,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-routes"] });
      setIsEditing(null);
      alert("Сохранено!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/tariffs/routes/${id}`, { method: "DELETE", token: token! }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-routes"] })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate(formData);
  };

  const startEdit = (route: Route) => {
    setIsEditing(route.id);
    setFormData({
      originCountry: route.originCountry,
      destinationCountry: route.destinationCountry,
      transportType: route.transportType,
      ratePerKg: Number(route.ratePerKg),
      minDays: route.minDays,
      maxDays: route.maxDays,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Тарифы и Маршруты</h2>
          <p className="text-sm text-slate-500 font-medium">Управление стоимостью и сроками доставки</p>
        </div>
        <button
          onClick={() => { setIsEditing("new"); setFormData({ originCountry: "KR", destinationCountry: "UZ", transportType: "air", ratePerKg: 0, minDays: 7, maxDays: 14 }); }}
          className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl font-black transition-all shadow-xl shadow-purple-100 text-sm"
        >
          <Plus className="w-5 h-5" />
          Добавить Маршрут
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-8 rounded-3xl border-2 border-purple-100 shadow-xl animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black uppercase tracking-widest">{isEditing === "new" ? "Новый Маршрут" : "Редактирование"}</h3>
            <button onClick={() => setIsEditing(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Откуда</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                value={formData.originCountry}
                onChange={(e) => setFormData({...formData, originCountry: e.target.value})}
              >
                {Object.entries(countryNames).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Куда</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                value={formData.destinationCountry}
                onChange={(e) => setFormData({...formData, destinationCountry: e.target.value})}
              >
                {Object.entries(countryNames).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Транспорт</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                value={formData.transportType}
                onChange={(e) => setFormData({...formData, transportType: e.target.value})}
              >
                <option value="air">Авиа</option>
                <option value="rail">Ж/Д</option>
                <option value="sea">Море</option>
                <option value="combined">Комбинированный</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Цена за кг ($)</label>
              <input 
                type="number" step="0.01"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                value={formData.ratePerKg}
                onChange={(e) => setFormData({...formData, ratePerKg: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Срок (мин дней)</label>
              <input 
                type="number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                value={formData.minDays}
                onChange={(e) => setFormData({...formData, minDays: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Срок (макс дней)</label>
              <input 
                type="number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold"
                value={formData.maxDays}
                onChange={(e) => setFormData({...formData, maxDays: parseInt(e.target.value)})}
              />
            </div>
            <div className="md:col-span-3 pt-4">
              <button
                type="submit"
                disabled={upsertMutation.isPending}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                {upsertMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Сохранить Изменения
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-slate-100" />)
        ) : data?.routes.map((route: any) => (
          <div key={route.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-sm leading-none">
                    {route.originCountry} → {route.destinationCountry}
                  </h4>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{route.transportType}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(route)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => { if(confirm('Удалить маршрут?')) deleteMutation.mutate(route.id) }} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ставка</p>
                <p className="text-xl font-black text-slate-900">${Number(route.ratePerKg).toFixed(2)}<span className="text-xs text-slate-400 ml-1">/кг</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Срок</p>
                <p className="text-sm font-bold text-slate-700">{route.minDays}-{route.maxDays} дней</p>
              </div>
            </div>

            {route.isActive ? (
              <span className="absolute top-4 right-12 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
