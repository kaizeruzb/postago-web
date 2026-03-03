"use client";

import { AuthGuard } from "@/lib/auth-guard";
import { useAuthStore } from "@/lib/auth-store";
import { OperatorSidebar } from "./components/sidebar";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);

  return (
    <AuthGuard allowedRoles={["operator", "admin"]}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <OperatorSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">Складская Панель</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-black text-orange-600 uppercase tracking-widest leading-none">Роль</p>
                <p className="text-xs font-bold text-slate-500">{user?.role === 'admin' ? 'АДМИНИСТРАТОР' : 'ОПЕРАТОР'}</p>
              </div>
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
