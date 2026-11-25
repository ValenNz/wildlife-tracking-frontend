"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";

import { useLogout } from "@/hooks/use-logout";
import { Header, MobileNav, Sidebar } from "@/components/navigation/main";
import { UserRoleProvider, usePreferences } from "@/components/providers/preferences-provider";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { getNavLabel } from "@/lib/i18n";
import {
  canAccessRoute,
  findModuleSubItems,
  getDefaultRouteForRole,
  isRouteActive,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";

type AppShellProps = {
  user: SessionUser;
  children: ReactNode;
};

export function AppShell({ user, children }: AppShellProps) {
  const logout = useLogout();
  const pathname = usePathname();
  const { locale, t } = usePreferences();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const moduleSubItems = findModuleSubItems(user.role, pathname);
  const activeSubHref = moduleSubItems
    .filter((sub) => isRouteActive(pathname, sub.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), []);

  if (!canAccessRoute(user.role, pathname)) {
    const allowedPath = getDefaultRouteForRole(user.role);

    return (
      <main className="flex min-h-dvh items-center justify-center overflow-x-clip bg-background px-4 py-8">
        <Panel className="w-full max-w-lg text-center">
          <SectionHeader
            title={t("accessDeniedTitle")}
            description={t("accessDeniedDescription")}
          />
          <Link
            href={allowedPath}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {t("backToHome")}
          </Link>
        </Panel>
      </main>
    );
  }

  return (
    <UserRoleProvider role={user.role}>
      <div className="flex min-h-dvh overflow-x-clip bg-background">
        <a
          href="#main-content"
          className="sr-only rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          {t("skipToContent")}
        </a>

        <div className="hidden shrink-0 md:block print:hidden">
          <Sidebar user={user} onLogout={logout} />
        </div>

        <MobileNav
          user={user}
          open={isMobileNavOpen}
          onClose={closeMobileNav}
          onLogout={logout}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            user={user}
            onLogout={logout}
            onMenuOpen={() => setIsMobileNavOpen(true)}
          />
          <main
            id="main-content"
            className="min-w-0 flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 print:p-0"
          >
            <div className="mx-auto w-full min-w-0 max-w-[1600px]">
              {moduleSubItems.length > 0 ? (
                <nav
                  aria-label={locale === "en" ? "Module pages" : "Sub-halaman modul"}
                  className="mb-6 flex items-center gap-5 overflow-x-auto border-b border-line print:hidden"
                >
                  {moduleSubItems.map((sub) => {
                    const isActive = sub.href === activeSubHref;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "-mb-px shrink-0 border-b-2 pb-2.5 pt-1 text-[13px] font-medium transition-colors",
                          isActive
                            ? "border-primary text-ink"
                            : "border-transparent text-muted hover:border-line-strong/40 hover:text-ink",
                        )}
                      >
                        {getNavLabel(locale, sub.href, sub.label)}
                      </Link>
                    );
                  })}
                </nav>
              ) : null}
              {children}
            </div>
          </main>
        </div>
      </div>
    </UserRoleProvider>
  );
}
