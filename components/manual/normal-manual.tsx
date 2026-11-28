"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Search } from "lucide-react";

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
  const [selectedId, setSelectedId] = useState(chapters[0]?.id ?? "");

  const trimmedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!trimmedQuery) return chapters;
    return chapters.filter(
      (c) =>
        c.title[locale].toLowerCase().includes(trimmedQuery) ||
        c.subtitle[locale].toLowerCase().includes(trimmedQuery) ||
        c.summary[locale].toLowerCase().includes(trimmedQuery) ||
        c.steps.some(
          (s) =>
            s.heading[locale].toLowerCase().includes(trimmedQuery) ||
            s.body[locale].toLowerCase().includes(trimmedQuery),
        ),
    );
  }, [chapters, locale, trimmedQuery]);

  const activeIndex = Math.max(
    0,
    chapters.findIndex((c) => c.id === selectedId),
  );
  const activeChapter = chapters[activeIndex] ?? chapters[0];
  const prevChapter = activeIndex > 0 ? chapters[activeIndex - 1] : null;
  const nextChapter = activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : null;

  const displayedChapters = trimmedQuery ? filtered : activeChapter ? [activeChapter] : [];

  return (
    <div className="flex flex-col gap-6">

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={locale === "en" ? "Search topics in manual..." : "Cari topik di panduan..."}
          className="ui-input h-10 pl-10 text-sm"
        />
      </div>


      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 space-y-6">
          {displayedChapters.length === 0 ? (
            <div className="rounded-lg border border-line bg-surface p-8 text-center text-sm text-muted">
              {locale === "en"
                ? "No topics match your search."
                : "Tidak ada topik yang cocok dengan pencarian Anda."}
            </div>
          ) : (
            displayedChapters.map((chapter) => (
              <article
                key={chapter.id}
                className="rounded-lg border border-line bg-surface p-6 sm:p-8"
              >
                <p className="text-xs font-semibold text-primary">
                  {locale === "en" ? `Part ${Number(chapter.number)}` : `Bagian ${Number(chapter.number)}`}
                  {" · "}
                  {chapter.roles.map((r) => r[locale]).join(", ")}
                </p>

                <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-ink">
                  {chapter.title[locale]}
                </h2>
                <p className="mt-1 text-[15px] text-muted">{chapter.subtitle[locale]}</p>

                <p className="mt-5 border-b border-line pb-5 text-[15px] leading-7 text-ink-soft">
                  {chapter.summary[locale]}
                </p>

                <ol className="mt-6 space-y-6">
                  {chapter.steps.map((step, index) => (
                    <li key={step.id} className="space-y-1.5">
                      <h3 className="text-base font-semibold text-ink">
                        {index + 1}. {step.heading[locale]}
                      </h3>
                      <p className="text-[15px] leading-7 text-ink-soft">{step.body[locale]}</p>
                      {step.details.length > 0 ? (
                        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14.5px] leading-6 text-ink-soft">
                          {step.details.map((detail, dIdx) => (
                            <li key={dIdx}>{detail[locale]}</li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ol>

                {chapter.tips.length > 0 ? (
                  <div className="mt-7 rounded-lg bg-surface-muted p-4">
                    <p className="text-sm font-semibold text-ink">
                      {locale === "en" ? "Important Notes" : "Catatan Penting"}
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-soft">
                      {chapter.tips.map((tip, idx) => (
                        <li key={idx}>{tip[locale]}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {chapter.links.length > 0 ? (
                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                    {chapter.links.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3.5 text-sm font-medium text-ink transition hover:border-primary hover:text-primary"
                      >
                        <span>{item.label[locale]}</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            ))
          )}


          {!trimmedQuery ? (
            <div className="flex items-center justify-between gap-4">
              {prevChapter ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(prevChapter.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-left text-sm font-medium text-ink transition hover:border-primary hover:text-primary"
                >
                  <ArrowLeft className="size-4 shrink-0" />
                  <span className="line-clamp-1">{prevChapter.title[locale]}</span>
                </button>
              ) : (
                <span />
              )}

              {nextChapter ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(nextChapter.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-right text-sm font-medium text-ink transition hover:border-primary hover:text-primary"
                >
                  <span className="line-clamp-1">{nextChapter.title[locale]}</span>
                  <ArrowRight className="size-4 shrink-0" />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>


        <aside className="rounded-lg border border-line bg-surface p-4 lg:sticky lg:top-20">
          <p className="mb-3 text-sm font-semibold text-ink">
            {locale === "en" ? "Topics" : "Daftar Topik"}
          </p>
          <ul className="space-y-1">
            {chapters.map((chapter) => {
              const isActive = !trimmedQuery && activeChapter?.id === chapter.id;
              return (
                <li key={chapter.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSelectedId(chapter.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-primary-soft font-semibold text-primary"
                        : "text-ink-soft hover:bg-surface-muted hover:text-ink",
                    )}
                  >
                    <span className="line-clamp-2 leading-snug">{chapter.title[locale]}</span>
                    {isActive ? <ChevronRight className="size-4 shrink-0" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
