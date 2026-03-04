"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, 
  User, 
  Shield, 
  Loader2, 
  Filter,
  MoreVertical,
  CheckCircle2,
  Package
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface Warehouse {
  id: string;
  country: string;
  city: string;
  type: "origin" | "destination";
}

interface UserData {
  id: string;
  phone: string;
  name: string;
  role: string;
  city?: string;
  clientCode?: string;
  createdAt: string;
  warehouseId?: string;
  warehouse?: Warehouse;
  _count: { parcels: number };
}

const roles = [
  { value: "client", label: "Клиент", color: "bg-blue-100 text-blue-700" },
  { value: "operator", label: "Оператор", color: "bg-orange-100 text-orange-700" },
  { value: "courier", label: "Курьер", color: "bg-green-100 text-green-700" },
  { value: "admin", label: "Админ", color: "bg-purple-100 text-purple-700" },
];

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", roleFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.append("role", roleFilter);
      return api<{ users: UserData[] }>(`/api/admin/users?${params.toString()}`, { token: token! });
    },
    enabled: !!token,
  });

  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api<{ warehouses: Warehouse[] }>("/api/warehouses", { token: token! }),
    enabled: !!token,
  });

  const warehouses = warehousesData?.warehouses || [];

  const assignWarehouseMutation = useMutation({
    mutationFn: (data: { id: string; warehouseId: string | null }) =>
      api(`/api/admin/users/${data.id}/warehouse`, {
        method: "PATCH",
        body: JSON.stringify({ warehouseId: data.warehouseId }),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (data: { id: string, role: string }) => 
      api(`/api/admin/users/${data.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: data.role }),
        token: token!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      alert("Роль успешно обновлена!");
    },
    onError: (err: any) => {
      alert(`Ошибка: ${err.message}`);
    }
  });

  const filteredUsers = data?.users.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone.includes(searchTerm) ||
    (u.clientCode && u.clientCode.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Пользователи</h2>
        <p className="text-slate-500 font-medium">Управление доступом и ролями</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по имени, телефону, ID..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-600"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Все роли</option>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Имя / Код</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Контакты</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Роль</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Склад</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Активность</th>
                <th className="pb-4 pt-2 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">Загрузка пользователей...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">
                    <User className="w-12 h-12 opacity-10 mx-auto mb-4" />
                    <p className="text-sm font-bold">Пользователи не найдены</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900">{u.name}</span>
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest mt-0.5">
                          {u.clientCode || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{u.phone}</span>
                        <span className="text-[10px] font-medium text-slate-400">{u.city || "Город не указан"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                        roles.find(r => r.value === u.role)?.color || "bg-slate-100 text-slate-700"
                      )}>
                        {roles.find(r => r.value === u.role)?.label || u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {(u.role === "operator" || u.role === "courier") ? (
                        <select
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-purple-600"
                          value={u.warehouseId || ""}
                          onChange={(e) => assignWarehouseMutation.mutate({
                            id: u.id,
                            warehouseId: e.target.value || null,
                          })}
                          disabled={assignWarehouseMutation.isPending}
                        >
                          <option value="">Не назначен</option>
                          {warehouses.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.city} ({w.type === "origin" ? "отпр." : "назн."})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        {u._count.parcels} посылок
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-purple-600 outline-none cursor-pointer"
                        value={u.role}
                        onChange={(e) => updateRoleMutation.mutate({ id: u.id, role: e.target.value })}
                        disabled={updateRoleMutation.isPending}
                      >
                        {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">Загрузка пользователей...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <User className="w-12 h-12 opacity-10 mx-auto mb-4" />
              <p className="text-sm font-bold">Пользователи не найдены</p>
            </div>
          ) : (
            filteredUsers.map((u: any) => (
              <div key={u.id} className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-black text-slate-900">{u.name}</span>
                    <span className="block text-[10px] font-black text-purple-600 uppercase tracking-widest mt-0.5">
                      {u.clientCode || "—"}
                    </span>
                  </div>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                    roles.find(r => r.value === u.role)?.color || "bg-slate-100 text-slate-700"
                  )}>
                    {roles.find(r => r.value === u.role)?.label || u.role}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-700">{u.phone}</span>
                  <span className="text-[10px] font-medium text-slate-400">{u.city || "Город не указан"}</span>
                </div>
                {(u.role === "operator" || u.role === "courier") && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Склад:</span>
                    <select
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-purple-600"
                      value={u.warehouseId || ""}
                      onChange={(e) => assignWarehouseMutation.mutate({
                        id: u.id,
                        warehouseId: e.target.value || null,
                      })}
                      disabled={assignWarehouseMutation.isPending}
                    >
                      <option value="">Не назначен</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.city} ({w.type === "origin" ? "отпр." : "назн."})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    {u._count.parcels} посылок
                  </div>
                  <select
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-purple-600 outline-none cursor-pointer"
                    value={u.role}
                    onChange={(e) => updateRoleMutation.mutate({ id: u.id, role: e.target.value })}
                    disabled={updateRoleMutation.isPending}
                  >
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
