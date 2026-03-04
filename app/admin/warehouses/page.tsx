"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Warehouse,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { COUNTRY_NAMES } from "@postago/shared";
import { cn } from "@/lib/utils";

interface WarehouseItem {
  id: string;
  country: string;
  city: string;
  address: string;
}

const COUNTRIES = [
  { code: "KR", name: "Южная Корея" },
  { code: "CN", name: "Китай" },
  { code: "TR", name: "Турция" },
  { code: "UZ", name: "Узбекистан" },
  { code: "KZ", name: "Казахстан" },
];

const emptyForm = { country: "KR", city: "", address: "" };

export default function WarehousesPage() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-warehouses"],
    queryFn: () => api<{ warehouses: WarehouseItem[] }>("/api/admin/warehouses", { token: token! }),
    enabled: !!token,
  });

  const warehouses = data?.warehouses || [];

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) =>
      api("/api/admin/warehouses", { method: "POST", body: JSON.stringify(data), token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-warehouses"] });
      setShowForm(false);
      setForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: typeof emptyForm & { id: string }) =>
      api(`/api/admin/warehouses/${id}`, { method: "PATCH", body: JSON.stringify(data), token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-warehouses"] });
      setEditingId(null);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/api/admin/warehouses/${id}`, { method: "DELETE", token: token! }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-warehouses"] }),
  });

  const startEdit = (w: WarehouseItem) => {
    setEditingId(w.id);
    setForm({ country: w.country, city: w.city, address: w.address });
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = () => {
    if (!form.city.trim()) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Склады</h2>
          <p className="text-slate-500 font-medium">Управление складами отправления и назначения</p>
        </div>
        {!showForm && !editingId && (
          <button
            onClick={() => { setShowForm(true); setForm(emptyForm); }}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-purple-100"
          >
            <Plus className="w-5 h-5" />
            Добавить склад
          </button>
        )}
      </div>

      {/* Form */}
      {(showForm || editingId) && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 uppercase text-sm">
            {editingId ? "Редактирование склада" : "Новый склад"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Страна</label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Город</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Например: Сеул"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Адрес</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Адрес склада"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isPending || !form.city.trim()}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editingId ? "Сохранить" : "Создать"}
            </button>
            <button
              onClick={() => { setShowForm(false); cancelEdit(); }}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-black text-sm transition-all"
            >
              <X className="w-4 h-4" />
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">Загрузка...</p>
          </div>
        ) : warehouses.length === 0 ? (
          <div className="py-20 text-center">
            <Warehouse className="w-12 h-12 text-slate-100 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">Нет складов</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <table className="w-full text-left hidden md:table">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Страна</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Город</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Адрес</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {warehouses.map((w) => (
                  <tr key={w.id} className={cn("hover:bg-slate-50 transition-colors", editingId === w.id && "bg-purple-50/30")}>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-slate-900">
                        {COUNTRY_NAMES[w.country] || w.country}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-700">{w.city}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">{w.address || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(w)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-purple-600 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Удалить склад ${w.city}?`)) deleteMutation.mutate(w.id); }}
                          disabled={deleteMutation.isPending}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-slate-100">
              {warehouses.map((w) => (
                <div key={w.id} className="p-4 space-y-2">
                  <div>
                    <span className="text-sm font-black text-slate-900">
                      {COUNTRY_NAMES[w.country] || w.country}
                    </span>
                    <span className="text-sm font-bold text-slate-500 ml-2">{w.city}</span>
                  </div>
                  <p className="text-xs text-slate-400">{w.address || "Адрес не указан"}</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => startEdit(w)}
                      className="text-[10px] font-black text-purple-600 uppercase"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => { if (confirm(`Удалить склад ${w.city}?`)) deleteMutation.mutate(w.id); }}
                      className="text-[10px] font-black text-red-600 uppercase"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
