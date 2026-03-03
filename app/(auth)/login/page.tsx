"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../lib/auth-store";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return `+${digits}`;
  if (digits.length <= 5) return `+${digits.slice(0, 3)} (${digits.slice(3)}`;
  if (digits.length <= 8) return `+${digits.slice(0, 3)} (${digits.slice(3, 5)}) ${digits.slice(5)}`;
  if (digits.length <= 10) return `+${digits.slice(0, 3)} (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8)}`;
  return `+${digits.slice(0, 3)} (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
}

function rawPhone(formatted: string): string {
  return "+" + formatted.replace(/\D/g, "");
}

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
    onSuccess: () => { setStep("code"); setError(""); },
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
    onSuccess: (res: any) => {
      if (res.isNew) {
        router.push(`/register?phone=${encodeURIComponent(rawPhone(phone))}&code=${encodeURIComponent(code)}`);
      } else if (res.token && res.user) {
        setAuth(res.token, res.user);
        const role = res.user.role;
        if (role === "admin") router.push("/admin");
        else if (role === "operator_origin" || role === "operator_destination") router.push("/operator");
        else if (role === "courier") router.push("/courier");
        else router.push("/dashboard");
      }
    },
    onError: (err: any) => setError(err.message),
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 12) {
      setPhone(formatPhone(val));
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 6) {
      setCode(val);
    }
  };

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length >= 12;
  const isCodeValid = code.length === 6;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    sendOtpMutation.mutate(rawPhone(phone));
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    verifyOtpMutation.mutate({ phone: rawPhone(phone), code });
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
              onChange={handlePhoneChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              placeholder="+998 (90) 123-45-67"
              required
            />
            {phoneDigits.length > 3 && !isPhoneValid && (
              <p className="text-xs text-amber-500 mt-1">Введите полный номер (12 цифр)</p>
            )}
          </div>
          <button
            type="submit"
            disabled={sendOtpMutation.isPending || !isPhoneValid}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50"
          >
            {sendOtpMutation.isPending ? "Отправка..." : "Получить код"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-gray-500 text-center mb-2">
            Код отправлен на <span className="font-semibold text-gray-700">{phone}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Код из SMS
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={handleCodeChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
              autoFocus
              required
            />
            {code.length > 0 && !isCodeValid && (
              <p className="text-xs text-amber-500 mt-1 text-center">Код должен содержать 6 цифр</p>
            )}
          </div>
          <button
            type="submit"
            disabled={verifyOtpMutation.isPending || !isCodeValid}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50"
          >
            {verifyOtpMutation.isPending ? "Проверка..." : "Войти"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("phone"); setCode(""); setError(""); }}
            className="w-full text-sm text-gray-500 hover:text-blue-600"
          >
            Изменить номер телефона
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Тестовый код: <span className="font-mono font-bold text-gray-500">000000</span>
          </p>
        </form>
      )}
    </div>
  );
}
