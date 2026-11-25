"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Clock, Lightbulb, Search } from "lucide-react";

import type { AppLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ManualChapter } from "./manual-data";

export function NormalManualView({
  chapters,
  locale,
}: {
  chapters: ManualChapter[];
  locale: AppLocale;
}) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.title[locale].toLowerCase().includes(q) ||
        c.subtitle[locale].toLowerCase().includes(q) ||
        c.summary[locale].toLowerCase().includes(q) ||
        c.steps.some(
          (s) =>
            s.heading[locale].toLowerCase().includes(q) ||
            s.body[locale].toLowerCase().includes(q),
        ),
    );
  }, [chapters, locale, query]);

  return (
    <div className="grid gap-6 lg:grid-cols-[270px_1fr]">
      <aside className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === "en" ? "Search chapters..." : "Cari bab atau topik..."}
            className="ui-input pl-9"
          />
        </div>

        <nav
          aria-label={locale === "en" ? "Manual chapters" : "Daftar bab panduan"}
          className="ui-panel p-3"
        >
          <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted">
            {locale === "en" ? "Table of Contents" : "Daftar Isi"}
          </p>
          <ul className="flex flex-col gap-1">
            {filtered.map((chapter) => (
              <li key={chapter.id}>
                <a
                  href={`#chapter-${chapter.id}`}
                  onClick={() => setActiveId(chapter.id)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs transition",
                    activeId === chapter.id
                      ? "bg-primary-soft font-semibold text-primary-dark"
                      : "text-ink-soft hover:bg-surface-muted",
                  )}
                >
                  <span className="font-mono font-bold text-primary">{chapter.number}</span>
                  <span className="line-clamp-2">{chapter.title[locale]}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex flex-col gap-6">
        {filtered.length === 0 ? (
          <div className="ui-panel p-10 text-center text-sm text-muted">
            {locale === "en"
              ? "No chapters match your search."
              : "Tidak ada bab yang cocok dengan pencarian Anda."}
          </div>
        ) : (
          filtered.map((chapter) => (
            <section
              key={chapter.id}
              id={`chapter-${chapter.id}`}
              className="ui-panel scroll-mt-24 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 font-mono text-xs font-bold text-white">
                    <BookOpen className="size-3.5" /> BAB {chapter.number}
                  </span>
                  {chapter.roles.map((r, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-ink-soft"
                    >
                      {r[locale]}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <Clock className="size-3.5" /> {chapter.readMinutes}{" "}
                  {locale === "en" ? "min read" : "menit baca"}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-bold text-ink">{chapter.title[locale]}</h3>
              <p className="mt-1 text-sm text-muted">{chapter.subtitle[locale]}</p>
              <p className="mt-3 rounded-xl bg-surface-muted/60 p-3.5 text-sm leading-6 text-ink-soft">
                {chapter.summary[locale]}
              </p>

              <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                {chapter.steps.map((step, index) => (
                  <li
                    key={step.id}
                    className="rounded-xl border border-line bg-surface p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        0{index + 1}
                      </span>
                      {step.badge ? (
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary-dark">
                          {step.badge[locale]}
                        </span>
                      ) : null}
                    </div>
                    <h4 className="mt-1.5 text-sm font-bold text-ink">{step.heading[locale]}</h4>
                    <p className="mt-1 text-xs leading-5 text-ink-soft">{step.body[locale]}</p>
                    <ul className="mt-2.5 flex flex-col gap-1 text-xs leading-5 text-ink-soft">
                      {step.details.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{detail[locale]}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-t border-line pt-4">
                <ul className="flex flex-1 flex-col gap-1 text-xs text-ink-soft">
                  {chapter.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{tip[locale]}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {chapter.links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary-soft"
                    >
                      {item.label[locale]} <ArrowRight className="size-3.5" />
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
