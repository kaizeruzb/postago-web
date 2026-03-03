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

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const p = searchParams.get("phone");
    const c = searchParams.get("code");
    if (p) setPhone(p);
    if (c) setCode(c);
    
    if (!p || !c) {
      router.replace("/login");
    }
  }, [searchParams, router]);

  const registerMutation = useMutation({
    mutationFn: (data: any) => api<{ token: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: (res) => {
      setAuth(res.token, res.user);
      router.push("/dashboard");
    },
    onError: (err: any) => setError(err.message),
  });

  const handleRegister = (e: React.FormEvent) => {
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

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ташкент"
          />
        </div>
        <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-600">
          Регистрация для номера: <strong>{phone}</strong>
        </div>
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50"
        >
          {registerMutation.isPending ? "Регистрация..." : "Завершить"}
        </button>
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
