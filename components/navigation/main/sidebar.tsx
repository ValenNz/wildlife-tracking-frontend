"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { NavIconGlyph } from "@/components/navigation/main";
import { usePreferences } from "@/components/providers/preferences-provider";
import { getNavLabel, getRoleLabel, getSectionLabel } from "@/lib/i18n";
import { NAV_SECTIONS, findActiveHref } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";

type SidebarProps = {
  user: SessionUser;
  onLogout: () => void;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  onClose?: () => void;
  isHidden?: boolean;
};

export function Sidebar({
  user,
  onLogout,
  variant = "desktop",
  onNavigate,
  onClose,
  isHidden = false,
}: SidebarProps) {
  const pathname = usePathname();
  const { locale, t } = usePreferences();
  const sections = NAV_SECTIONS[user.role];
  const activeHref = findActiveHref(user.role, pathname);
  const isMobile = variant === "mobile";

  const [hovered, setHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const showLabels = isMobile || !isCollapsed || hovered;
  const tabIndex = isHidden ? -1 : undefined;

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setHovered(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    leaveTimeoutRef.current = setTimeout(() => setHovered(false), 180);
  };

  useEffect(() => {
    if (isMobile && !isHidden) {
      closeButtonRef.current?.focus();
    }
  }, [isMobile, isHidden]);

  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || user.name.slice(0, 1).toUpperCase();

  return (
    <aside
      aria-label="Navigasi utama"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group flex h-full min-h-0 flex-col bg-forest-dark text-white",
        isMobile
          ? "w-full"
          : cn(
              "sticky top-0 z-30 h-dvh shrink-0 border-r border-forest-black transition-[width] duration-200 ease-out",
              showLabels ? "w-72" : "w-20",
            ),
      )}
    >
      <div
        className={cn(
          "flex h-20 shrink-0 items-center overflow-hidden border-b border-white/10",
          isMobile || showLabels ? "gap-3 px-4" : "flex-col justify-center gap-1 px-2 py-2",
        )}
      >
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-lg bg-white p-1 ring-1 ring-white/15",
            showLabels ? "size-10" : "size-8",
          )}
        >
          <Image
            src="/images/logo-tngl.png"
            alt="Logo Taman Nasional Gunung Leuser"
            fill
            sizes={showLabels ? "40px" : "32px"}
            className="object-contain"
            priority
          />
        </div>

        {showLabels ? (
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold uppercase leading-tight tracking-[0.14em] text-sage-cream">
              {t("nationalPark")}
            </p>
            <p className="text-sm font-bold uppercase leading-tight tracking-wide text-white">
              {t("gunungLeuser")}
            </p>
          </div>
        ) : null}

        {isMobile && onClose ? (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            tabIndex={tabIndex}
            aria-label={t("closeNav")}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-natural-muted"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        ) : null}

        {!isMobile ? (
          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            aria-label={isCollapsed ? t("expandNav") : t("collapseNav")}
            title={isCollapsed ? t("expandNav") : t("collapseNav")}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-lg border border-white/20 text-white transition hover:border-natural-muted hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-natural-muted",
              showLabels ? "size-9" : "size-7",
            )}
          >
            {isCollapsed ? (
              <PanelLeftOpen aria-hidden="true" className={showLabels ? "size-4" : "size-3.5"} />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-4" />
            )}
          </button>
        ) : null}
      </div>

      <nav
        aria-label="Daftar halaman"
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain py-4",
          showLabels ? "px-3" : "px-2",
        )}
      >
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            {showLabels ? (
              <p className="px-3 pb-1.5 text-[11px] font-medium tracking-wide text-white/45">
                {getSectionLabel(locale, section.title)}
              </p>
            ) : (
              <div
                aria-hidden="true"
                className="mx-auto mb-2.5 h-px w-6 bg-white/12"
              />
            )}

            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = item.href === activeHref;
                const itemLabel =
                  item.subItems && item.subItems.length > 1
                    ? getSectionLabel(locale, item.label)
                    : getNavLabel(locale, item.href, item.label);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      tabIndex={tabIndex}
                      aria-current={active ? "page" : undefined}
                      aria-label={showLabels ? undefined : itemLabel}
                      title={showLabels ? undefined : itemLabel}
                      className={cn(
                        "group/item relative flex items-center rounded-md text-[13.5px] font-medium transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-natural-muted focus-visible:ring-offset-1 focus-visible:ring-offset-forest-dark",
                        showLabels ? "gap-2.5 px-3 py-2" : "justify-center px-2 py-2.5",
                        active
                          ? "bg-white/[0.12] text-white"
                          : "text-white/70 hover:bg-white/[0.06] hover:text-white",
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r bg-natural-muted"
                        />
                      ) : null}
                      <NavIconGlyph
                        icon={item.icon}
                        className={cn(
                          "size-[17px] shrink-0 transition-opacity",
                          active ? "opacity-100" : "opacity-75 group-hover/item:opacity-100",
                        )}
                      />
                      {showLabels ? (
                        <span className="min-w-0 truncate">{itemLabel}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-white/10 bg-forest-black/20",
          showLabels ? "px-4 py-4" : "px-2 py-4",
        )}
      >
        <div
          className={cn(
            "flex items-center rounded-lg border border-white/10 bg-white/5 p-2",
            showLabels ? "gap-3" : "justify-center",
          )}
        >
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-natural-muted text-xs font-bold text-forest-black"
          >
            {initials}
          </span>
          {showLabels ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user.name}
              </p>
              <p className="truncate text-xs text-sage-cream">
                {getRoleLabel(locale, user.role)}
              </p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onLogout}
          tabIndex={tabIndex}
          aria-label={showLabels ? undefined : t("logout")}
          title={showLabels ? undefined : t("logout")}
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 font-semibold text-white transition",
            "hover:border-natural-muted hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-natural-muted focus-visible:ring-offset-2 focus-visible:ring-offset-forest-dark",
            showLabels ? "px-3 py-2 text-sm" : "px-2 py-2.5",
          )}
        >
          <LogOut
            aria-hidden="true"
            className={cn("shrink-0", showLabels ? "size-4" : "size-5")}
          />
          {showLabels ? t("logout") : null}
        </button>
      </div>
    </aside>
  );
}
