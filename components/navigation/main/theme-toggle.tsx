"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { usePreferences } from "@/components/providers/preferences-provider";

const STORAGE_KEY = "color-scheme";

type Scheme = "light" | "dark";

const readStoredScheme = (): Scheme | null => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
};

const getSystemScheme = (): Scheme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const applyMetaScheme = (stored: Scheme | null) => {
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.setAttribute("content", stored ?? "light dark");
  }
};

export function ThemeToggle() {
  const { t } = usePreferences();
  const [rendered, setRendered] = useState<Scheme>("light");

  useEffect(() => {
    const sync = () => {
      const stored = readStoredScheme();
      applyMetaScheme(stored);
      setRendered(stored ?? getSystemScheme());
    };

    sync();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      // Hanya ubah tampilan ikon bila user mengikuti sistem (tidak menghapus pilihan tersimpan).
      if (!readStoredScheme()) {
        setRendered(getSystemScheme());
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) sync();
    };

    media.addEventListener("change", handleMediaChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      media.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggle = () => {
    const system = getSystemScheme();
    const current = readStoredScheme() ?? system;
    const target: Scheme = current === "dark" ? "light" : "dark";
    const nextStored: Scheme | null = target === system ? null : target;

    try {
      if (nextStored === null) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, nextStored);
      }
    } catch {
      // Tetap terapkan di DOM meski localStorage tidak tersedia.
    }

    applyMetaScheme(nextStored);
    setRendered(target);
  };

  const label = rendered === "dark" ? t("switchToLight") : t("switchToDark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex size-10 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition hover:border-primary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {rendered === "dark" ? (
        <Sun aria-hidden="true" className="size-[1.15rem]" />
      ) : (
        <Moon aria-hidden="true" className="size-[1.15rem]" />
      )}
    </button>
  );
}
