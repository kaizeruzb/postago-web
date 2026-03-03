"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore, useAuthHydrated } from "@/lib/auth-store";
import { Menu, X } from "lucide-react";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = hydrated && !!token;

  const navLinks = [
    { href: "#calculator", label: "Калькулятор" },
    { href: "#tariffs", label: "Тарифы" },
    { href: "#faq", label: "Вопросы" },
    { href: "/track", label: "Отследить" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="text-xl md:text-2xl font-bold text-blue-600">
          PostaGo
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-bold text-gray-600 hover:text-blue-600">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href={getDashboardPath(user?.role)}
              className="px-4 md:px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition"
            >
              Кабинет
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline text-sm font-bold text-gray-600 hover:text-blue-600">Войти</Link>
              <Link
                href="/login"
                className="px-4 md:px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition"
              >
                Регистрация
              </Link>
            </>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
