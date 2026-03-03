"use client";

import { useAuthStore } from "@/lib/auth-store";
import { Menu, User as UserIcon } from "lucide-react";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <header className="h-14 md:h-16 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base md:text-lg font-semibold text-slate-900">
          Личный кабинет
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-slate-900 truncate max-w-[120px] md:max-w-none">
            {user.name}
          </span>
          <span className="text-xs font-bold text-blue-600 tracking-wider">
            {user.clientCode || "PG-000000"}
          </span>
        </div>

        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
          <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>
    </header>
  );
}
