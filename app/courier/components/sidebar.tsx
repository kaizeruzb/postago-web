"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  Package,
  History,
  LogOut,
  User,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Активные доставки", href: "/courier", icon: Package },
  { name: "История", href: "/courier/history", icon: History },
];

export function CourierSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white w-64">
      <div className="p-5 border-b border-slate-800">
        <Link href="/courier" onClick={onNavigate} className="flex items-center gap-2">
          <div className="bg-green-600 p-1.5 rounded-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">PostaGo <span className="text-[10px] text-green-400 uppercase tracking-widest ml-1">Drive</span></span>
        </Link>
      </div>

      <div className="px-4 py-4 mb-2">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="h-10 w-10 rounded-full bg-green-600/20 flex items-center justify-center text-green-500">
            <User className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Курьер</p>
            <p className="text-sm font-bold truncate">{user?.name}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-green-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
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

export function CourierSidebar() {
  return (
    <div className="hidden md:flex shrink-0">
      <CourierSidebarContent />
    </div>
  );
}
