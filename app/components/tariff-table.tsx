"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Truck, Ship, Plane, Train, Loader2 } from "lucide-react";

const countryNames: Record<string, string> = {
  KR: "Южная Корея",
  CN: "Китай",
  TR: "Турция",
  UZ: "Узбекистан",
  KZ: "Казахстан",
};

export function TariffTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: () => api<{ routes: any[] }>("/api/tariffs/routes"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const routes = data?.routes || [];

  return (
    <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-50">
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Направление</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Тип перевозки</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Срок</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Тариф (кг)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {routes.map((route: any, idx: any) => (
            <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-900 uppercase">{route.originCountry}</span>
                  <div className="h-px w-4 bg-slate-200" />
                  <span className="font-black text-slate-900 uppercase">{route.destinationCountry}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {countryNames[route.originCountry]} → {countryNames[route.destinationCountry]}
                </p>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-2 text-slate-700">
                  {route.transportType === 'air' && <Plane className="w-4 h-4 text-blue-500" />}
                  {route.transportType === 'sea' && <Ship className="w-4 h-4 text-cyan-500" />}
                  {route.transportType === 'rail' && <Train className="w-4 h-4 text-orange-500" />}
                  {route.transportType === 'combined' && <Truck className="w-4 h-4 text-emerald-500" />}
                  <span className="text-sm font-bold capitalize">
                    {route.transportType === 'air' ? 'Авиа' : 
                     route.transportType === 'sea' ? 'Море' : 
                     route.transportType === 'rail' ? 'Ж/Д' : 'Авто'}
                  </span>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className="text-sm font-black text-slate-900">{route.minDays}-{route.maxDays}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase ml-1">дней</span>
              </td>
              <td className="px-8 py-6">
                <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                  ${Number(route.ratePerKg).toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
