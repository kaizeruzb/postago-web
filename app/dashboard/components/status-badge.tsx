"use client";

import { cn } from "@/lib/utils";

export const statusMap: Record<string, { label: string; color: string }> = {
  created: { label: "Создан", color: "bg-slate-100 text-slate-700" },
  weighed: { label: "Взвешено", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Оплачен", color: "bg-green-100 text-green-700" },
  received_at_origin: { label: "Принят на складе", color: "bg-blue-100 text-blue-700" },
  in_batch: { label: "В партии", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "Отправлен", color: "bg-blue-100 text-blue-700" },
  in_transit: { label: "В пути", color: "bg-sky-100 text-sky-700" },
  customs: { label: "На таможне", color: "bg-orange-100 text-orange-700" },
  received_at_destination: { label: "Прибыл в пункт назначения", color: "bg-teal-100 text-teal-700" },
  sorting: { label: "Сортировка", color: "bg-emerald-100 text-emerald-700" },
  out_for_delivery: { label: "У курьера", color: "bg-yellow-100 text-yellow-700" },
  delivered: { label: "Доставлен", color: "bg-green-100 text-green-700 border border-green-200" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status] || { label: status, color: "bg-slate-100 text-slate-700" };
  
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap inline-flex items-center",
      config.color
    )}>
      {config.label}
    </span>
  );
}
