"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../lib/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("+998");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => api("/api/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),
    onSuccess: () => setStep("code"),
    onError: (err: any) => setError(err.message),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: { phone: string; code: string }) => api<{
      token?: string;
      user?: any;
      isNew: boolean;
      phone?: string;
    }>("/api/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: (res) => {
      if (res.isNew) {
        router.push(`/register?phone=${encodeURIComponent(phone)}&code=${encodeURIComponent(code)}`);
      } else if (res.token && res.user) {
        setAuth(res.token, res.user);
        router.push("/dashboard");
      }
    },
    onError: (err: any) => setError(err.message),
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    sendOtpMutation.mutate(phone);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    verifyOtpMutation.mutate({ phone, code });
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-6 text-center">
        {step === "phone" ? "Вход в систему" : "Подтверждение"}
      </h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">
          {error}
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Номер телефона
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+998901234567"
              required
            />
          </div>
          <button
            type="submit"
            disabled={sendOtpMutation.isPending}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50"
          >
            {sendOtpMutation.isPending ? "Отправка..." : "Получить код"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Код из SMS
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-widest"
              placeholder="000000"
              required
            />
          </div>
          <button
            type="submit"
            disabled={verifyOtpMutation.isPending}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50"
          >
            {verifyOtpMutation.isPending ? "Проверка..." : "Войти"}
          </button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="w-full text-sm text-gray-500 hover:text-blue-600"
          >
            Изменить номер телефона
          </button>
        </form>
      )}
    </div>
  );
}
