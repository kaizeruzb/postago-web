"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Country, TransportType } from "@postago/shared";
import { cn } from "../../lib/utils";

export function Calculator() {
  const [origin, setOrigin] = useState<Country>("KR");
  const [destination, setDestination] = useState<Country>("UZ");
  const [weight, setWeight] = useState<number>(1);
  const [transport, setTransport] = useState<TransportType | "all">("all");

  const { mutate, data, isPending, isError } = useMutation({
    mutationFn: (input: any) => api<{ estimates: any[] }>("/api/tariffs/calculate", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      originCountry: origin,
      destinationCountry: destination,
      weightKg: weight,
      transportType: transport === "all" ? undefined : transport,
    });
  };

  return (
    <section id="calculator" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Калькулятор стоимости</h2>
            <p className="text-gray-600">Рассчитайте примерную стоимость и сроки доставки вашей посылки</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <form onSubmit={handleCalculate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Откуда</label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value as Country)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="KR">Южная Корея</option>
                      <option value="CN">Китай</option>
                      <option value="TR">Турция</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Куда</label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value as Country)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="UZ">Узбекистан</option>
                      <option value="KZ">Казахстан</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Вес (кг)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Способ доставки</label>
                  <div className="flex flex-wrap gap-2">
                    {["all", "air", "rail", "sea"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTransport(type as any)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-bold transition duration-200",
                          transport === type
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {type === "all" ? "Все" : type === "air" ? "Авиа" : type === "rail" ? "Ж/Д" : "Море"}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition duration-200 disabled:opacity-50"
                >
                  {isPending ? "Расчет..." : "Рассчитать стоимость"}
                </button>
              </form>
            </div>

            <div className="flex flex-col justify-center">
              {data && data.estimates.length > 0 ? (
                <div className="space-y-4">
                  {data.estimates.map((est, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-blue-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm text-gray-500 uppercase font-bold">
                            {est.transportType === "air" ? "✈️ Авиа" : est.transportType === "rail" ? "🚂 Ж/Д" : "🚢 Море"}
                          </p>
                          <p className="text-lg font-bold">{est.minDays}-{est.maxDays} дней</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Итого</p>
                          <p className="text-2xl font-bold text-blue-600">${est.totalCost.toFixed(2)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">Тариф: ${est.ratePerKg}/кг</p>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="bg-red-50 p-6 rounded-2xl text-red-600 text-center">
                  Произошла ошибка при расчете. Пожалуйста, попробуйте позже.
                </div>
              ) : (
                <div className="bg-blue-50 p-12 rounded-3xl border-2 border-dashed border-blue-200 text-center">
                  <p className="text-blue-400 font-bold">Заполните данные для расчета</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
