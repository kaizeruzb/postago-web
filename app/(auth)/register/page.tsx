"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../lib/auth-store";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const phone = searchParams.get("phone") || "";
  const code = searchParams.get("code") || "";

  useEffect(() => {
    if (!phone || !code) {
      router.replace("/login");
    }
  }, [phone, code, router]);

  const [name, setName] = useState("");
  const [city, setCity] = useState("Tashkent");
  const [error, setError] = useState("");

  const registerMutation = useMutation({
    mutationFn: (data: any) => api<{ token: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: (res: any) => {
      setAuth(res.token, res.user);
      router.push("/dashboard");
    },
    onError: (err: any) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    registerMutation.mutate({ phone, code, name, city });
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-6 text-center">Завершение регистрации</h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Имя и Фамилия</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Иван Иванов"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Страна и город</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <optgroup label="Узбекистан">
              <option value="Tashkent">Ташкент</option>
              <option value="Samarkand">Самарканд</option>
              <option value="Bukhara">Бухара</option>
              <option value="Namangan">Наманган</option>
              <option value="Fergana">Фергана</option>
              <option value="Andijan">Андижан</option>
            </optgroup>
            <optgroup label="Казахстан">
              <option value="Almaty">Алматы</option>
              <option value="Astana">Астана</option>
              <option value="Shymkent">Шымкент</option>
            </optgroup>
            <optgroup label="Южная Корея">
              <option value="Seoul">Сеул</option>
              <option value="Busan">Пусан</option>
              <option value="Incheon">Инчхон</option>
            </optgroup>
            <optgroup label="Китай">
              <option value="Guangzhou">Гуанчжоу</option>
              <option value="Beijing">Пекин</option>
              <option value="Shanghai">Шанхай</option>
            </optgroup>
            <optgroup label="Турция">
              <option value="Istanbul">Стамбул</option>
              <option value="Ankara">Анкара</option>
              <option value="Antalya">Анталья</option>
            </optgroup>
          </select>
        </div>
        <div className="pt-2">
          <p className="text-xs text-gray-500 mb-4 text-center">
            Нажимая кнопку, вы соглашаетесь с правилами сервиса
          </p>
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50"
          >
            {registerMutation.isPending ? "Создание..." : "Зарегистрироваться"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
