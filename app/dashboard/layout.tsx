"use client";

import { useState } from "react";
import { AuthGuard } from "@/lib/auth-guard";
import { Sidebar, SidebarContent } from "./components/sidebar";
import { Header } from "./components/header";
import { MobileDrawer } from "../components/mobile-drawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <SidebarContent onNavigate={() => setDrawerOpen(false)} />
        </MobileDrawer>
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuToggle={() => setDrawerOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
