"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  Map, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Package
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Статистика", href: "/admin", icon: BarChart3 },
  { name: "Пользователи", href: "/admin/users", icon: Users },
  { name: "Тарифы", href: "/admin/routes", icon: Map },
  { name: "Посылки", href: "/admin/parcels", icon: Package },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex h-full flex-col bg-slate-950 text-white w-64 shrink-0">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-purple-600 p-1.5 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span>PostaGo <span className="text-[10px] text-purple-400 uppercase tracking-widest ml-1">Admin</span></span>
        </Link>
      </div>

      <div className="px-6 py-4 mb-4">
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Админ</p>
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
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                isActive 
                  ? "bg-purple-600 text-white" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </button>
      </div>
    </div>
  );
}
