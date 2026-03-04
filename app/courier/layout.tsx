"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/lib/auth-guard";
import { useAuthStore } from "@/lib/auth-store";
import { CourierSidebar, CourierSidebarContent } from "./components/sidebar";
import { MobileDrawer } from "../components/mobile-drawer";
import { Menu } from "lucide-react";
import { api } from "@/lib/api";

export default function CourierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);

  // Refresh user data (incl. warehouse) on mount
  useEffect(() => {
    if (!token) return;
    api<{ id: string; phone: string; name: string; role: string; clientCode?: string; city?: string; warehouseId?: string; warehouse?: { id: string; country: string; city: string; type: "origin" | "destination" } }>("/api/auth/me", { token })
      .then((freshUser) => setAuth(token, freshUser))
      .catch(() => {});
  }, [token]);

  return (
    <AuthGuard allowedRoles={["courier", "admin"]}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <CourierSidebar />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <CourierSidebarContent onNavigate={() => setDrawerOpen(false)} />
        </MobileDrawer>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-slate-200 bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-sm md:text-lg font-black text-slate-900 tracking-tight uppercase">Доставка</h1>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
