"use client";

import { useAuthStore } from "@/lib/auth-store";
import { User, Phone, MapPin, Hash, LogOut, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Профиль</h2>
        <p className="text-slate-500">Управление вашими данными и настройками</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex flex-col items-center">
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-blue-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-100">
            <User className="w-10 h-10 md:w-12 md:h-12" />
          </div>
          <h3 className="text-xl font-black text-slate-900">{user.name}</h3>
          <p className="text-blue-600 font-bold text-sm tracking-widest uppercase mt-1">
            {user.clientCode || "PG-000000"}
          </p>
        </div>

        <div className="p-5 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Телефон
              </label>
              <p className="font-bold text-slate-900">{user.phone}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Роль
              </label>
              <p className="font-bold text-slate-900 uppercase text-xs bg-slate-100 px-2 py-1 rounded inline-block">
                {user.role}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Город доставки
              </label>
              <p className="font-bold text-slate-900">{user.city || "Не указан"}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Hash className="w-3 h-3" />
                ID Пользователя
              </label>
              <p className="font-mono text-[10px] text-slate-500 break-all">{user.id}</p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Безопасность
        </h4>
        <p className="text-sm text-blue-800 leading-relaxed">
          Ваш аккаунт защищен. Для изменения номера телефона или города доставки, пожалуйста, обратитесь в службу поддержки через наш Telegram бот.
        </p>
      </div>
    </div>
  );
}
