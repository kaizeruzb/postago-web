"use client";

import { AuthGuard } from "@/lib/auth-guard";
import { useAuthStore } from "@/lib/auth-store";
import { AdminSidebar } from "./components/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <h1 className="text-sm font-black text-slate-900 tracking-widest uppercase">Управление платформой</h1>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Система активна</span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
