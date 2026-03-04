"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PackageCheck,
  Warehouse,
  Layers,
  LogOut,
  Package,
  ArrowDownToLine,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { COUNTRY_NAMES } from "@postago/shared";

const navigation = [
  {
    section: "Склад отправления",
    items: [
      { name: "Все посылки", href: "/operator/warehouse", icon: Warehouse },
      { name: "Приёмка", href: "/operator/receive", icon: PackageCheck },
      { name: "Партии", href: "/operator/batches", icon: Layers },
    ],
  },
  {
    section: "Склад назначения",
    items: [
      { name: "Приём партий", href: "/operator/destination/receive", icon: ArrowDownToLine },
      { name: "Сортировка", href: "/operator/destination/sort", icon: Package },
    ],
  },
];

export function OperatorSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  // All operators see all sections — one operator handles both receiving and shipping
  const filteredNavigation = navigation;

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white w-64">
      <div className="p-5 border-b border-slate-800">
        <Link href="/operator/warehouse" onClick={onNavigate} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-sm">
            PG
          </div>
          <span className="font-black text-sm tracking-tight">PostaGo</span>
        </Link>
      </div>

      {user?.warehouse && (
        <div className="px-5 py-2 border-b border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Склад</p>
          <p className="text-xs font-bold text-white">
            {COUNTRY_NAMES[user.warehouse.country] || user.warehouse.country}, {user.warehouse.city}
          </p>
        </div>
      )}

      {user?.role === "operator" && !user?.warehouseId && (
        <div className="px-5 py-3 bg-orange-900/30 border-b border-orange-800/50">
          <p className="text-[10px] font-black text-orange-400 uppercase">Склад не назначен</p>
          <p className="text-[10px] text-orange-300/70">Обратитесь к администратору</p>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-6 mt-4 overflow-y-auto">
        {filteredNavigation.map((group) => (
          <div key={group.section} className="space-y-1">
            <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
              {group.section}
            </p>
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/operator/warehouse" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-orange-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </button>
      </div>
    </div>
  );
}

export function OperatorSidebar() {
  return (
    <div className="hidden md:flex shrink-0">
      <OperatorSidebarContent />
    </div>
  );
}
