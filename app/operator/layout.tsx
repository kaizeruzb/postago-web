"use client";

import { useState } from "react";
import { AuthGuard } from "@/lib/auth-guard";
import { useAuthStore } from "@/lib/auth-store";
import { OperatorSidebar, OperatorSidebarContent } from "./components/sidebar";
import { MobileDrawer } from "../components/mobile-drawer";
import { Menu } from "lucide-react";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AuthGuard allowedRoles={["operator", "admin"]}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <OperatorSidebar />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <OperatorSidebarContent onNavigate={() => setDrawerOpen(false)} />
        </MobileDrawer>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-slate-200 bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-sm md:text-lg font-black text-slate-900 tracking-tight uppercase">Складская Панель</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none">Роль</p>
                <p className="text-[10px] md:text-xs font-bold text-slate-500">{user?.role === 'admin' ? 'АДМИНИСТРАТОР' : 'ОПЕРАТОР'}</p>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
