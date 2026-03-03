"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  User, 
  Package, 
  Scale, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface Parcel {
  id: string;
  trackingCode: string;
  status: string;
  weightKg?: number;
  description?: string;
  user: {
    name: string;
    clientCode: string;
    phone: string;
  };
  route: {
    originCountry: string;
    destinationCountry: string;
  };
}

export default function ReceivePage() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [weight, setWeight] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch all parcels created by clients
  const { data, isLoading } = useQuery({
    queryKey: ["warehouse-parcels"],
    queryFn: () => api<{ parcels: Parcel[] }>("/api/parcels/warehouse/all?status=created", { token: token! }),
    enabled: !!token,
  });

  const updateWeightMutation = useMutation({
    mutationFn: (data: { id: string, weightKg: number }) => 
      api(`/api/parcels/${data.id}/weight`, {
        method: "PATCH",
        body: JSON.stringify({ weightKg: data.weightKg }),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse-parcels"] });
      setSuccess(true);
      setSelectedParcel(null);
      setWeight("");
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      alert(`Ошибка при сохранении веса: ${err.message}`);
    }
  });

  const filteredParcels = data?.parcels.filter((p: any) => 
    p.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.user.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelect = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setWeight(parcel.weightKg?.toString() || "");
    setSuccess(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcel || !weight) return;
    updateWeightMutation.mutate({ 
      id: selectedParcel.id, 
      weightKg: parseFloat(weight) 
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Приемка посылок</h2>
        <p className="text-slate-500">Поиск по коду клиента, трекинг-коду или имени</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Search & List Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-xs uppercase text-slate-500 tracking-wider">
              Ожидают приемки ({filteredParcels.length})
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                <p className="text-sm font-bold text-slate-400">Загрузка...</p>
              </div>
            ) : filteredParcels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center text-slate-400">
                <Package className="w-12 h-12 opacity-10 mb-4" />
                <p className="text-sm font-bold">Ничего не найдено</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {filteredParcels.map((parcel: any) => (
                  <button
                    key={parcel.id}
                    onClick={() => handleSelect(parcel)}
                    className={cn(
                      "w-full text-left p-4 hover:bg-slate-50 transition-colors group",
                      selectedParcel?.id === parcel.id ? "bg-orange-50/50 border-l-4 border-orange-600" : "border-l-4 border-transparent"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                        {parcel.trackingCode}
                      </span>
                      <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">
                        {parcel.user.clientCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                      <User className="w-3 h-3" />
                      {parcel.user.name}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 uppercase">
                      <MapPin className="w-3 h-3" />
                      {parcel.route.originCountry} → {parcel.route.destinationCountry}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Section */}
        <div className="lg:col-span-2 space-y-6">
          {success && (
            <div className="bg-green-600 text-white p-6 rounded-2xl flex items-center gap-4 shadow-xl shadow-green-100 animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 className="w-8 h-8" />
              <div>
                <p className="font-black uppercase tracking-wider">Принято!</p>
                <p className="text-sm font-bold opacity-80">Вес посылки успешно обновлен, статус изменен на "Взвешена".</p>
              </div>
            </div>
          )}

          {selectedParcel ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-orange-600 rounded text-[10px] font-black uppercase tracking-widest">Приемка</span>
                    <h3 className="text-2xl font-black tracking-tight">{selectedParcel.trackingCode}</h3>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm font-bold opacity-70">
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {selectedParcel.user.name}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedParcel.route.originCountry} → {selectedParcel.route.destinationCountry}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Клиент ID</p>
                  <p className="text-2xl font-black">{selectedParcel.user.clientCode}</p>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-orange-600" />
                        Фактический вес (кг)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          autoFocus
                          required
                          className="w-full px-8 py-8 text-5xl font-black bg-slate-50 rounded-3xl border-2 border-slate-100 focus:border-orange-600 focus:ring-0 outline-none transition-all text-slate-900"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">KG</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Фото посылки</p>
                      <div className="grid grid-cols-3 gap-4">
                        <button type="button" className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-orange-600 hover:text-orange-600 transition-all bg-slate-50/50">
                          <Camera className="w-8 h-8" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Добавить</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                      <h4 className="font-black text-orange-900 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Инструкция
                      </h4>
                      <ul className="space-y-3 text-sm font-bold text-orange-800/80 leading-relaxed">
                        <li>1. Проверьте целостность упаковки</li>
                        <li>2. Положите посылку на весы</li>
                        <li>3. Сделайте минимум одно фото</li>
                        <li>4. Введите точный вес и нажмите кнопку</li>
                      </ul>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={updateWeightMutation.isPending || !weight}
                        className={cn(
                          "w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all shadow-xl",
                          updateWeightMutation.isPending || !weight
                            ? "bg-slate-100 text-slate-400"
                            : "bg-orange-600 text-white hover:bg-orange-700 hover:-translate-y-1 shadow-orange-100"
                        )}
                      >
                        {updateWeightMutation.isPending ? (
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        ) : "Принять и Взвесить"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-40 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-300">
              <div className="bg-slate-50 p-10 rounded-full mb-6">
                <Package className="w-20 h-20 opacity-10" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest mb-2">Выберите посылку</h3>
              <p className="text-sm font-bold opacity-60">Найдите посылку в списке слева, чтобы начать приемку</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
