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

function TransportIcon({ type }: { type: string }) {
  switch (type) {
    case "air": return <Plane className="w-4 h-4 text-blue-500" />;
    case "sea": return <Ship className="w-4 h-4 text-cyan-500" />;
    case "rail": return <Train className="w-4 h-4 text-orange-500" />;
    default: return <Truck className="w-4 h-4 text-emerald-500" />;
  }
}

function transportLabel(type: string) {
  switch (type) {
    case "air": return "Авиа";
    case "sea": return "Море";
    case "rail": return "Ж/Д";
    default: return "Авто";
  }
}

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
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
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
            {routes.map((route: any, idx: number) => (
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
                    <TransportIcon type={route.transportType} />
                    <span className="text-sm font-bold">{transportLabel(route.transportType)}</span>
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

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {routes.map((route: any, idx: number) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 uppercase text-sm">{route.originCountry}</span>
                <span className="text-slate-300">→</span>
                <span className="font-black text-slate-900 uppercase text-sm">{route.destinationCountry}</span>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-black">
                ${Number(route.ratePerKg).toFixed(2)}/кг
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <TransportIcon type={route.transportType} />
                <span className="font-bold">{transportLabel(route.transportType)}</span>
              </div>
              <span className="text-slate-500 font-bold">{route.minDays}-{route.maxDays} дней</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
