"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUnreadNotifications } from "@/hooks/notification.hook";
import { findNavTitle } from "@/lib/navigation";
import { TYPE_ROLE_LABELS } from "@/types/user.type";
import type { SessionUser } from "@/lib/session";

type HeaderProps = {
  user: SessionUser;
  onLogout: () => void;
};

export function Header({ user, onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const { data, isLoading, error, refetch } = useUnreadNotifications();

  const unreadCount = data?.data?.length ?? 0;
  const title = findNavTitle(user.role, pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4">
      <h1 className="truncate text-base font-semibold text-zinc-900">{title}</h1>

      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          aria-label={
            unreadCount > 0
              ? `Notifikasi, ${unreadCount} belum dibaca`
              : "Notifikasi"
          }
          className="relative rounded-lg border border-zinc-300 p-2 text-zinc-700 transition hover:bg-zinc-50"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>

          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[0.6rem] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-2 py-1.5 transition hover:bg-zinc-50"
          >
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white"
            >
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-medium text-zinc-900">
                {user.name}
              </span>
              <span className="block text-[0.65rem] text-zinc-500">
                {TYPE_ROLE_LABELS[user.role]}
              </span>
            </span>
          </button>

          {isMenuOpen ? (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
            >
              <p className="px-3 py-2 text-xs text-zinc-500">{user.email}</p>
              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="block w-full px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
              >
                Keluar
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}