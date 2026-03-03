"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";
import { StatusBadge } from "@/app/dashboard/components/status-badge";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const [code, setCode] = useState(initialCode);

  const { data: parcel, isLoading, isError, refetch } = useQuery({
    queryKey: ["track", initialCode],
    queryFn: () => api<any>(`/api/parcels/track/${initialCode}`),
    enabled: !!initialCode,
    retry: false
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    window.location.href = `/track?code=${code}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Search Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl text-blue-600 mb-4">
            <Package className="w-8 h-8" />
            PostaGo
          </Link>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Отслеживание посылки</h1>
          <p className="text-slate-500 font-medium">Введите трекинг-код, чтобы узнать статус вашего отправления</p>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="PG-KR-2026-XXXXXX"
            className="w-full pl-6 pr-32 py-6 rounded-3xl border-2 border-white bg-white shadow-xl shadow-slate-200/50 text-xl font-black focus:border-blue-600 outline-none transition-all uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-3 top-3 bottom-3 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-2xl font-black uppercase tracking-widest text-sm transition-all"
          >
            Найти
          </button>
        </form>

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="font-bold text-slate-400 uppercase tracking-widest">Ищем посылку...</p>
          </div>
        ) : isError ? (
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-red-50 flex flex-col items-center text-center space-y-4 shadow-sm">
            <div className="p-4 bg-red-50 text-red-500 rounded-full">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase">Посылка не найдена</h3>
            <p className="text-slate-500 max-w-sm">Убедитесь, что код введен верно. Если вы только что оформили заказ, информация появится в течение 30 минут.</p>
          </div>
        ) : parcel ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Quick Status Card */}
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Статус</span>
                    <StatusBadge status={parcel.status} />
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter uppercase">{parcel.trackingCode}</h2>
                  <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {parcel.route.originCountry} → {parcel.route.destinationCountry}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Обновлено {new Date(parcel.updatedAt).toLocaleDateString("ru-RU")}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between text-right">
                  <ShieldCheck className="w-12 h-12 text-blue-500 opacity-50" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Тип доставки</p>
                    <p className="text-lg font-black uppercase">{parcel.route.transportType}</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  История перемещений
                </h3>
              </div>
              <div className="p-8">
                <div className="space-y-10">
                  {parcel.events.map((event: any, index: number) => (
                    <div key={event.id} className="relative flex gap-8">
                      {index !== parcel.events.length - 1 && (
                        <div className="absolute left-4 top-10 bottom-[-30px] w-0.5 bg-slate-100" />
                      )}
                      <div className={cn(
                        "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                        index === 0 ? "bg-blue-600 shadow-xl shadow-blue-200 scale-110" : "bg-slate-100"
                      )}>
                        {index === 0 ? (
                          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="space-y-2 pb-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={cn(
                            "text-base font-black uppercase tracking-tight",
                            index === 0 ? "text-slate-900" : "text-slate-400"
                          )}>
                            {event.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                            {new Date(event.timestamp).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location}
                          </div>
                        )}
                        {event.note && (
                          <p className="text-sm text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : initialCode ? (
           <div className="text-center py-20">
             <p className="text-slate-400 font-bold">Ничего не найдено</p>
           </div>
        ) : (
          <div className="bg-blue-50 border-2 border-blue-100 p-12 rounded-[2.5rem] flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-white text-blue-600 rounded-3xl shadow-lg">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-black text-blue-900 uppercase">Безопасный трекинг</h3>
            <p className="text-blue-800/70 max-w-sm font-medium">Мы используем зашифрованные коды для вашей безопасности. Данные обновляются в реальном времени на каждом этапе логистической цепочки.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>}>
      <TrackingContent />
    </Suspense>
  );
}
