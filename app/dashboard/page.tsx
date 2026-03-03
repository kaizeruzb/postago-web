"use client";

import { useQuery } from "@tanstack/react-query";
import { PlusCircle, PackageSearch, ClipboardCopy, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { ParcelCard } from "./components/parcel-card";
import { useState } from "react";
import { WAREHOUSES } from "@/lib/constants";

function WelcomeScreen({ clientCode }: { clientCode: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(clientCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Добро пожаловать в PostaGo!
        </h2>
        <p className="text-slate-500 mt-2 max-w-lg mx-auto">
          Отправляйте посылки из Кореи, Китая и Турции в Узбекистан быстро и надёжно
        </p>
      </div>

      {/* Client Code */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center shadow-lg">
        <p className="text-blue-200 text-sm font-medium mb-2">Ваш код клиента</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl font-black tracking-wider">{clientCode}</span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            title="Скопировать"
          >
            <ClipboardCopy className="w-5 h-5" />
          </button>
        </div>
        {copied && (
          <p className="text-blue-200 text-xs mt-2">Скопировано!</p>
        )}
        <p className="text-blue-200 text-sm mt-3">
          Наклейте этот код на посылку при отправке на склад
        </p>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-5">Как это работает</h3>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "Оформите заявку на сайте",
              desc: "Укажите откуда и куда отправляете, вес и описание посылки",
            },
            {
              step: 2,
              title: "Отнесите посылку на наш склад",
              desc: `Наклейте код ${clientCode} и сдайте посылку на ближайший склад`,
            },
            {
              step: 3,
              title: "Отслеживайте доставку",
              desc: "Следите за статусом в личном кабинете — от приёмки до вручения",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center">
                {item.step}
              </div>
              <div>
                <p className="font-bold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warehouses */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Наши склады</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WAREHOUSES.map((wh) => (
            <div
              key={wh.city}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{wh.flag}</span>
                <div>
                  <p className="font-bold text-slate-900">{wh.country}</p>
                  <p className="text-xs text-slate-500">{wh.city}</p>
                </div>
              </div>
              <div className="flex items-start gap-1.5 mt-3 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{wh.address}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-4">
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Оформить первую посылку
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

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

  if (parcels.length === 0) {
    return <WelcomeScreen clientCode={user?.clientCode || "PG-000000"} />;
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parcels.map((parcel: any) => (
          <ParcelCard key={parcel.id} parcel={parcel} />
        ))}
      </div>
    </div>
  );
}
