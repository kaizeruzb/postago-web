"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { OperatorSidebar } from "./components/sidebar";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isOperator = user?.role === "operator_origin" || user?.role === "operator_destination" || user?.role === "admin";
    
    if (!token || !isOperator) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [token, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  return (
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
  );
}
