"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { Sidebar } from "@/components/navigation/main";
import { ThemeToggle } from "@/components/navigation/main/theme-toggle";
import { usePreferences } from "@/components/providers/preferences-provider";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  user: SessionUser;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export function MobileNav({
  user,
  open,
  onClose,
  onLogout,
}: MobileNavProps) {
  const pathname = usePathname();
  const { locale, toggleLocale, t } = usePreferences();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const handleChange = () => {
      if (query.matches) {
        onClose();
      }
    };

    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, [onClose]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[80] md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <button
        type="button"
        aria-label="Tutup navigasi"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink/45 backdrop-blur-[2px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        className={cn(
          "absolute inset-y-0 left-0 flex w-[min(19rem,86vw)] max-w-full flex-col border-r border-line bg-surface shadow-2xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="min-h-0 flex-1">
          <Sidebar
            variant="mobile"
            user={user}
            onLogout={onLogout}
            onNavigate={onClose}
            onClose={onClose}
            isHidden={!open}
          />
        </div>

        {/* Quick preference controls (hidden from the compact phone header) */}
        <div
          inert={!open}
          className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-forest-dark px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden"
        >
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={t("switchLanguage")}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-bold uppercase tracking-wider text-ink-soft"
          >
            <Languages aria-hidden="true" className="size-4" />
            <span>{locale.toUpperCase()}</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
