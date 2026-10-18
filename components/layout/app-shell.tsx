"use client";

import { useRouter } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import type { SessionUser } from "@/lib/session";

type AppShellProps = {
  user: SessionUser;
  children: ReactNode;
};

export function AppShell({ user, children }: AppShellProps) {
  const router = useRouter();

  const logout = useCallback(() => {
    void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      router.push("/login");
      router.refresh();
    });
  }, [router]);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <div className="hidden lg:block">
        <Sidebar user={user} onLogout={logout} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={user} onLogout={logout} />
        <main className="flex-1 overflow-x-auto px-4 py-6">{children}</main>
      </div>
    </div>
  );
}