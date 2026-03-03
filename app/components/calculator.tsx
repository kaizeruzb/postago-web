"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calculator as CalcIcon, Scale, MapPin, Truck, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export function Calculator() {
  const [origin, setOrigin] = useState("KR");
  const [destination, setDestination] = useState("UZ");
  const [weight, setWeight] = useState("1");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["calculate", origin, destination, weight],
    queryFn: () => api<{ estimates: any[] }>("/api/tariffs/calculate", {
      method: "POST",
      body: JSON.stringify({ originCountry: origin, destinationCountry: destination, weightKg: parseFloat(weight) }),
    }),
    enabled: !!weight && parseFloat(weight) > 0,
  });

  return (
    <section id="calculator" className="py-12 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 md:mb-6 leading-tight">
              Рассчитайте стоимость{" "}
              <span className="text-blue-600">доставки за секунды</span>
            </h2>
            <p className="text-base md:text-lg text-slate-600 mb-6 md:mb-8 leading-relaxed">
              Введите параметры вашей посылки, чтобы получить точный расчет стоимости и примерные сроки доставки.
            </p>

            <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Откуда
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-4 py-3 md:py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  >
                    <option value="KR">Южная Корея</option>
                    <option value="CN">Китай</option>
                    <option value="TR">Турция</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Куда
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-4 py-3 md:py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  >
                    <option value="UZ">Узбекистан</option>
                    <option value="KZ">Казахстан</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 mb-6 md:mb-8">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Scale className="w-3 h-3" /> Вес посылки (кг)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-4 py-3 md:py-4 font-black text-xl md:text-2xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    placeholder="0.0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">KG</span>
                </div>
              </div>

              <button
                onClick={() => refetch()}
                className="w-full py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-xl md:rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
              >
                Рассчитать
              </button>
            </div>
          </div>

          <div className="relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 md:py-20 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl">
                <Loader2 className="w-10 md:w-12 h-10 md:h-12 text-blue-600 animate-spin mb-4" />
                <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">Считаем тарифы...</p>
              </div>
            ) : data?.estimates && data.estimates.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight mb-4 md:mb-6">Доступные варианты:</h3>
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  {data.estimates.map((est: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-lg hover:border-blue-600 transition-all group">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="p-2.5 md:p-3 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Truck className="w-5 h-5 md:w-6 md:h-6" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase text-sm md:text-base">{est.transportType === 'air' ? 'Авиаперевозка' : 'Наземная доставка'}</p>
                            <p className="text-xs md:text-sm font-bold text-slate-400">{est.minDays}-{est.maxDays} дней в пути</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-2xl md:text-3xl font-black text-blue-600">${Number(est.totalCost).toFixed(2)}</p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Итого (USD)</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-blue-600 p-8 md:p-12 rounded-2xl md:rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
                <div className="relative z-10">
                  <CalcIcon className="w-12 md:w-16 h-10 md:h-12 mb-6 md:mb-8 opacity-50" />
                  <h3 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 leading-tight">Результат расчета появится здесь</h3>
                  <p className="font-bold text-blue-100 opacity-80 leading-relaxed text-sm md:text-base">
                    Мы подберем для вас оптимальные маршруты и цены исходя из веса и направления.
                  </p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
