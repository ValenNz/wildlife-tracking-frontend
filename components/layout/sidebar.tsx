"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS, isRouteActive } from "@/lib/navigation";
import type { NavIcon } from "@/lib/navigation";
import type { SessionUser } from "@/lib/session";
import { ROLE_LABELS } from "@/types/user";

const ICON_PATHS: Record<NavIcon, string> = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  paw: "M6 14c-1.5 0-3 1.5-3 3s1 3 3 3 3-1.5 3-3-1.5-3-3-3zM18 14c-1.5 0-3 1.5-3 3s1 3 3 3 3-1.5 3-3-1.5-3-3-3zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM16 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  alert: "M12 3 2 20h20L12 3zM12 9v5M12 17.5v.5",
  species: "M12 21c5-3 8-6 8-10a8 8 0 1 0-16 0c0 4 3 7 8 10z",
  device: "M7 3h10v18H7zM10 18h4",
  zone: "M12 2 3 7v10l9 5 9-5V7l-9-5zM12 22V12l9-5M12 12 3 7",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
};

function NavIconGlyph({ icon }: { icon: NavIcon }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICON_PATHS[icon]} />
    </svg>
  );
}

type SidebarProps = {
  user: SessionUser;
  onLogout: () => void;
};

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const sections = NAV_SECTIONS[user.role];

  return (
    <aside
      aria-label="Navigasi utama"
      className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-200 bg-white"
    >
      <div className="border-b border-zinc-200 px-4 py-4">
        <p className="text-sm font-semibold text-zinc-900">Wildlife Monitoring</p>
        <p className="text-xs text-zinc-500">BTNGL</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="px-2 pb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-zinc-400">
              {section.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isRouteActive(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={
                        active
                          ? "flex items-center gap-2.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
                          : "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100"
                      }
                    >
                      <NavIconGlyph icon={item.icon} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-zinc-200 px-4 py-3">
        <p className="truncate text-sm font-medium text-zinc-900">{user.name}</p>
        <p className="truncate text-xs text-zinc-500">{ROLE_LABELS[user.role]}</p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}