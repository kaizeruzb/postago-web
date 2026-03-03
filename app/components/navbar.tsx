"use client";

import Link from "next/link";
import { useAuthStore, useAuthHydrated } from "@/lib/auth-store";

function getDashboardPath(role: string | undefined) {
  switch (role) {
    case "admin": return "/admin";
    case "operator": return "/operator";
    case "courier": return "/courier";
    default: return "/dashboard";
  }
}

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthHydrated();

  const isLoggedIn = hydrated && !!token;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          PostaGo
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="#calculator" className="text-sm font-bold text-gray-600 hover:text-blue-600">Калькулятор</Link>
          <Link href="#tariffs" className="text-sm font-bold text-gray-600 hover:text-blue-600">Тарифы</Link>
          <Link href="#faq" className="text-sm font-bold text-gray-600 hover:text-blue-600">Вопросы</Link>
          <Link href="/track" className="text-sm font-bold text-gray-600 hover:text-blue-600">Отследить</Link>
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <Link
              href={getDashboardPath(user?.role)}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition"
            >
              Личный кабинет
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600">Войти</Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
