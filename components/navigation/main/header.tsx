"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Languages, LogOut, Menu } from "lucide-react";
import { useUnreadNotifications } from "@/hooks/use-notifications";
import {
  Breadcrumb,
  buildPathBreadcrumbs,
} from "@/components/breadcrumb";
import { ThemeToggle } from "@/components/navigation/main/theme-toggle";
import { usePreferences } from "@/components/providers/preferences-provider";
import { getNavLabel, getRoleLabel } from "@/lib/i18n";
import { findActiveHref, findNavTitle, getDefaultRouteForRole } from "@/lib/navigation";
import type { SessionUser } from "@/lib/session";

type HeaderProps = {
  user: SessionUser;
  onLogout: () => void;
  onMenuOpen: () => void;
};

export function Header({ user, onLogout, onMenuOpen }: HeaderProps) {
  const [openMenuPathname, setOpenMenuPathname] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const { data } = useUnreadNotifications();
  const { locale, toggleLocale, t } = usePreferences();

  const unreadCount = data?.data?.length ?? 0;
  const isMenuOpen = openMenuPathname === pathname;
  const activeHref = findActiveHref(user.role, pathname);
  const rawTitle = findNavTitle(user.role, pathname);
  const title = activeHref ? getNavLabel(locale, activeHref, rawTitle) : rawTitle;
  const homeHref = getDefaultRouteForRole(user.role);
  const home =
    homeHref === "/dashboard"
      ? undefined
      : { label: getNavLabel(locale, homeHref, findNavTitle(user.role, homeHref)), href: homeHref };
  const breadcrumbItems = buildPathBreadcrumbs(pathname, home).map(
    (item, index, items) =>
      index === items.length - 1 ? { ...item, label: title } : item,
  );

  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || user.name.slice(0, 1).toUpperCase();

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenuPathname(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuPathname(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 flex h-14 print:hidden shrink-0 items-center gap-2 border-b border-line bg-surface/95 px-3 backdrop-blur-sm sm:gap-3 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label={t("openNav")}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition hover:border-primary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="hidden sm:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <h1
            title={title}
            className="truncate text-sm font-bold tracking-tight text-ink sm:text-base"
          >
            {title}
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={t("switchLanguage")}
            title={t("switchLanguage")}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-bold uppercase tracking-wider text-ink-soft transition hover:border-primary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Languages aria-hidden="true" className="size-4" />
            <span>{locale.toUpperCase()}</span>
          </button>

          <ThemeToggle />
        </div>

        <Link
          href="/notifications"
          aria-label={
            unreadCount > 0
              ? `${t("notifications")}, ${unreadCount} ${t("unreadCountLabel")}`
              : t("notifications")
          }
          className="group relative inline-flex size-10 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition hover:border-primary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Bell
            aria-hidden="true"
            className="size-[1.15rem] transition-transform group-hover:scale-105"
          />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.6rem] font-bold text-white ring-2 ring-surface">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() =>
              setOpenMenuPathname((current) =>
                current === pathname ? null : pathname,
              )
            }
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            aria-label={t("accountMenu")}
            className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface py-1 pl-1 pr-2 transition hover:border-primary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
            >
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-[9rem] truncate text-xs font-semibold text-ink">
                {user.name}
              </span>
              <span className="block text-[0.65rem] text-muted">
                {getRoleLabel(locale, user.role)}
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`hidden size-3.5 text-muted transition-transform sm:block ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isMenuOpen ? (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-line bg-surface shadow-card"
            >
              <div className="border-b border-line bg-surface-muted px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                  >
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-ink-soft transition hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  {t("logout")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
