"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import Link from "next/link";
import { 
  Truck, 
  Package, 
  History, 
  LogOut, 
  User,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Активные доставки", href: "/courier", icon: Package },
  { name: "История", href: "/courier/history", icon: History },
];

export default function CourierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isCourier = user?.role === "courier" || user?.role === "admin";
    
    if (!token || !isCourier) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [token, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar for Courier */}
      <div className="flex h-full flex-col bg-slate-900 text-white w-64 shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-green-600 p-1.5 rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span>PostaGo <span className="text-[10px] text-green-400 uppercase tracking-widest ml-1 text-xs">Drive</span></span>
          </Link>
        </div>

        <div className="px-6 py-4 mb-4">
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
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = "/";
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Выйти
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">Доставка</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
