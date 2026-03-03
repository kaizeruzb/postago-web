"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  PackageCheck, 
  Warehouse, 
  Layers, 
  LogOut, 
  Home,
  User
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const commonNavigation = [
  { name: "Склад", href: "/operator/warehouse", icon: Warehouse },
];

const originNavigation = [
  { name: "Приемка", href: "/operator/receive", icon: PackageCheck },
  { name: "Партии (Отправка)", href: "/operator/batches", icon: Layers },
];

const destinationNavigation = [
  { name: "Приемка Партий", href: "/operator/destination/receive", icon: Layers },
  { name: "Сортировка", href: "/operator/destination/sort", icon: PackageCheck },
];

export function OperatorSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const isOrigin = user?.role === 'operator_origin' || user?.role === 'admin';
  const isDestination = user?.role === 'operator_destination' || user?.role === 'admin';

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white w-64 shrink-0">
      {/* ... (keep header and profile info) ... */}
      <nav className="flex-1 px-4 space-y-8 mt-4">
        {isOrigin && (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Склад Отправления</p>
            {originNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive ? "bg-orange-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        {isDestination && (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Склад Назначения</p>
            {destinationNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Общее</p>
          {commonNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
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
