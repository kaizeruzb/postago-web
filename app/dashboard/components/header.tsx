"use client";

import { useAuthStore } from "@/lib/auth-store";
import { Bell, User as UserIcon } from "lucide-react";

export function Header() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Дашборд</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-slate-900">{user.name}</span>
          <span className="text-xs font-bold text-blue-600 tracking-wider">
            {user.clientCode || "PG-000000"}
          </span>
        </div>
        
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
          <UserIcon className="w-6 h-6" />
        </div>
      </div>
    </header>
  );
}
