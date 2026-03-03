"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { COUNTRY_NAMES } from "@postago/shared";

export function TariffTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["tariffs"],
    queryFn: () => api<{ routes: any[] }>("/api/tariffs/routes"),
  });

  if (isLoading) return <div className="text-center py-20">Загрузка тарифов...</div>;

  const routes = data?.routes || [];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Наши тарифы</h2>
          <p className="text-gray-600">Актуальные цены и сроки доставки по всем направлениям</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-sm font-bold text-gray-500 uppercase">Направление</th>
                <th className="p-4 text-sm font-bold text-gray-500 uppercase">Способ</th>
                <th className="p-4 text-sm font-bold text-gray-500 uppercase">Тариф</th>
                <th className="p-4 text-sm font-bold text-gray-500 uppercase">Сроки</th>
                <th className="p-4 text-sm font-bold text-gray-500 uppercase">Статус</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition duration-150">
                  <td className="p-4">
                    <span className="font-bold">{COUNTRY_NAMES[route.originCountry]}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="font-bold">{COUNTRY_NAMES[route.destinationCountry]}</span>
                  </td>
                  <td className="p-4">
                    {route.transportType === "air" ? "✈️ Авиа" : route.transportType === "rail" ? "🚂 Ж/Д" : route.transportType === "sea" ? "🚢 Море" : "📦 Комби"}
                  </td>
                  <td className="p-4 text-blue-600 font-bold">${Number(route.ratePerKg).toFixed(2)} / кг</td>
                  <td className="p-4 text-gray-600">{route.minDays}-{route.maxDays} дней</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-600 rounded-full">Активен</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
