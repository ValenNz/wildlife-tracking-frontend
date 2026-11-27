"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { NavIconGlyph } from "@/components/navigation/main";
import { usePreferences } from "@/components/providers/preferences-provider";
import { getNavLabel, getSectionLabel } from "@/lib/i18n";
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
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  return (
    <aside
      aria-label="Navigasi utama"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group flex h-full min-h-0 flex-col bg-surface text-ink",
        isMobile
          ? "w-full"
          : cn(
              "sticky top-0 z-30 h-dvh shrink-0 border-r border-line transition-[width] duration-200 ease-out",
              showLabels ? "w-64" : "w-20",
            ),
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center overflow-hidden border-b border-line",
          isMobile || showLabels ? "gap-3 px-4" : "flex-col justify-center gap-1 px-2 py-2",
        )}
      >
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-full bg-surface p-0.5 ring-1 ring-line",
            showLabels ? "size-9" : "size-8",
          )}
        >
          <Image
            src="/images/logo-tngl.png"
            alt="Logo Taman Nasional Gunung Leuser"
            fill
            sizes={showLabels ? "36px" : "32px"}
            className="object-contain"
            priority
          />
        </div>

        {showLabels ? (
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase leading-tight tracking-[0.06em] text-ink">
              {t("nationalPark")}
            </p>
            <p className="text-[11px] font-extrabold uppercase leading-tight tracking-[0.04em] text-primary">
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
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
              "inline-flex shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft transition hover:border-primary/40 hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              showLabels ? "size-8" : "size-7",
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
          <div key={section.title} className="mb-4">
            {showLabels ? (
              <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wide text-muted/80">
                {getSectionLabel(locale, section.title)}
              </p>
            ) : (
              <div
                aria-hidden="true"
                className="mx-auto mb-2.5 h-px w-6 bg-line"
              />
            )}

            <ul className="flex flex-col gap-1">
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
                        "group/item relative flex items-center rounded-lg text-[13.5px] font-semibold transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        showLabels ? "gap-3 px-3.5 py-2.5" : "justify-center px-2 py-2.5",
                        active
                          ? "bg-primary text-white shadow-sm"
                          : "text-ink-soft hover:bg-surface-muted hover:text-ink",
                      )}
                    >
                      <NavIconGlyph
                        icon={item.icon}
                        className={cn(
                          "size-[18px] shrink-0 transition-opacity",
                          active ? "text-white" : "text-ink-soft group-hover/item:text-primary",
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
          "shrink-0 border-t border-line bg-surface",
          showLabels ? "px-3 py-3" : "px-2 py-3",
        )}
      >
        <button
          type="button"
          onClick={onLogout}
          tabIndex={tabIndex}
          aria-label={showLabels ? undefined : t("logout")}
          title={showLabels ? undefined : t("logout")}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg font-semibold text-ink-soft transition",
            "hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger",
            showLabels ? "px-3.5 py-2.5 text-[13.5px]" : "justify-center px-2 py-2.5",
          )}
        >
          <LogOut
            aria-hidden="true"
            className="size-[18px] shrink-0"
          />
          {showLabels ? t("logout") : null}
        </button>
      </div>
    </aside>
  );
}
