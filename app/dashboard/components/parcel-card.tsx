"use client";

import Link from "next/link";
import { Package, MapPin, Scale, Calendar, ArrowRight, DollarSign } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";

interface Parcel {
  id: string;
  trackingCode: string;
  status: string;
  route: {
    originCountry: string;
    destinationCountry: string;
    transportType: string;
    ratePerKg?: number;
  };
  weightKg?: number;
  finalCost?: number;
  createdAt: string;
}

const countryNames: Record<string, string> = {
  KR: "Южная Корея",
  CN: "Китай",
  TR: "Турция",
  UZ: "Узбекистан",
  KZ: "Казахстан",
};

export function ParcelCard({ parcel }: { parcel: Parcel }) {
  const date = new Date(parcel.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Трекинг-код</p>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {parcel.trackingCode}
              </h3>
            </div>
          </div>
          <StatusBadge status={parcel.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Маршрут</p>
              <p className="text-sm font-medium text-slate-700 truncate">
                {countryNames[parcel.route.originCountry]} → {countryNames[parcel.route.destinationCountry]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Вес</p>
              <p className="text-sm font-medium text-slate-700">
                {parcel.weightKg ? `${parcel.weightKg} кг` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <PaymentStatus parcel={parcel} />

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">{date}</span>
          </div>
          
          <Link
            href={`/dashboard/parcels/${parcel.id}`}
            className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all"
          >
            Детали
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

const WEIGHED_STATUSES = new Set([
  "weighed", "in_batch", "shipped", "in_transit", "customs",
  "received_at_destination", "sorting", "out_for_delivery", "delivered",
]);

const PAID_STATUSES = new Set(["paid", "delivered"]);

function PaymentStatus({ parcel }: { parcel: Parcel }) {
  if (PAID_STATUSES.has(parcel.status)) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg mb-4">
        <DollarSign className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-700">
          Оплачено {parcel.finalCost ? `— $${Number(parcel.finalCost).toFixed(2)}` : ""}
        </span>
      </div>
    );
  }

  if (WEIGHED_STATUSES.has(parcel.status) && parcel.finalCost) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg mb-4">
        <DollarSign className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-700">
          К оплате: ${Number(parcel.finalCost).toFixed(2)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg mb-4">
      <Scale className="w-4 h-4 text-slate-400" />
      <span className="text-xs text-slate-500">
        Ожидает взвешивания — стоимость будет рассчитана на складе
      </span>
    </div>
  );
}
