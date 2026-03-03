"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, PlusCircle, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Мои посылки", href: "/dashboard", icon: Package },
  { name: "Новая посылка", href: "/dashboard/new", icon: PlusCircle },
  { name: "Профиль", href: "/dashboard/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white w-64">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <span>PostaGo</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive 
                  ? "bg-blue-600 text-white" 
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
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </button>
      </div>
    </div>
  );
}
