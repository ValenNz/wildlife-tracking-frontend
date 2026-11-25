"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Award, CalendarDays, Languages, Moon, PawPrint, Sun, Sunrise } from "lucide-react";

import { EmptyState, ErrorState, Loading, PageHeader } from "@/components/ui";
import { GuideAvatar, RatingStars } from "@/components/tourism";
import { useTourGuides, useTourRoutes, useTourSchedule } from "@/hooks/use-tourism";
import { toApiErrorState } from "@/services/api";
import { SHIFT_LABELS, type TYPE_PUBLIC_SHIFT, type TYPE_SHIFT_TYPE, type TYPE_TOUR_GUIDE } from "@/types/tourism.type";
import { toLocalDateInput } from "@/utils/format";

const SHIFT_ICONS: Record<TYPE_SHIFT_TYPE, typeof Sun> = { pagi: Sunrise, siang: Sun, malam: Moon };

const nextDays = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });

function GuideCard({ guide }: { guide: TYPE_TOUR_GUIDE }) {
  return (
    <Link href={`/guides/${guide.guide_id}/detail`} className="group flex flex-col gap-4 rounded-card border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card">
      <div className="flex items-center gap-3">
        <GuideAvatar guideId={guide.guide_id} name={guide.display_name} hasPhoto={guide.has_photo} />
        <div className="min-w-0">
          <p className="truncate font-bold text-ink group-hover:text-primary">{guide.display_name}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <RatingStars value={guide.reviews_avg_guide_rating} />
            {guide.reviews_count ? `${Number(guide.reviews_avg_guide_rating).toFixed(1)} (${guide.reviews_count})` : "Baru"}
          </p>
        </div>
      </div>
      <div className="rounded-2xl bg-primary-soft/60 p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary"><PawPrint className="size-3.5" />Satwa favorit</p>
        <p className="mt-1 text-sm font-semibold text-ink">{guide.favorite_animal}</p>
        {guide.favorite_animal_reason ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-soft">“{guide.favorite_animal_reason}”</p> : null}
      </div>
      <dl className="flex flex-col gap-1.5 text-xs text-ink-soft">
        <div className="flex items-center gap-2"><Award className="size-3.5 text-primary" />{guide.years_experience} tahun pengalaman</div>
        <div className="flex items-center gap-2"><Languages className="size-3.5 text-primary" />{guide.languages.join(", ")}</div>
      </dl>
      {guide.fun_fact ? <p className="mt-auto border-t border-line pt-3 text-xs italic leading-5 text-muted">Fun fact: {guide.fun_fact}</p> : null}
    </Link>
  );
}

function ShiftCell({ shift }: { shift: TYPE_PUBLIC_SHIFT }) {
  const Icon = SHIFT_ICONS[shift.shift_type];
  const full = shift.remaining <= 0;

  return (
    <div className={`flex flex-col gap-1 rounded-xl border p-3 text-xs ${full ? "border-line bg-surface-muted opacity-70" : "border-line bg-surface"}`}>
      <span className="flex items-center gap-1.5 font-semibold text-ink"><Icon className="size-3.5 text-primary" />{SHIFT_LABELS[shift.shift_type]} {shift.start_time}–{shift.end_time}</span>
      {shift.route ? (
        <Link href={`/tours/${shift.route.slug}/detail`} className="text-primary hover:underline">{shift.route.name}</Link>
      ) : null}
      <span className={full ? "font-semibold text-danger" : "text-muted"}>{full ? "Kuota penuh" : `Sisa kuota ${shift.remaining}/${shift.capacity}`}</span>
      {!full && shift.route ? (
        <Link href={`/tours/${shift.route.slug}/create?shift=${shift.shift_id}`} className="mt-1 w-fit rounded-lg bg-primary px-2.5 py-1 font-semibold text-white hover:bg-primary-dark">Pesan</Link>
      ) : null}
    </div>
  );
}

export default function GuidesPage() {
  const days = useMemo(() => nextDays(14), []);
  const [selectedDate, setSelectedDate] = useState(toLocalDateInput(days[0]));
  const [routeId, setRouteId] = useState(0);
  const guidesQuery = useTourGuides();
  const routesQuery = useTourRoutes();
  const scheduleQuery = useTourSchedule({ from: selectedDate, to: selectedDate, route_id: routeId || undefined });

  const guides = useMemo(() => guidesQuery.data ?? [], [guidesQuery.data]);
  const shiftsByGuide = useMemo(() => {
    const map = new Map<number, TYPE_PUBLIC_SHIFT[]>();
    for (const shift of scheduleQuery.data ?? []) {
      if (!shift.guide) continue;
      map.set(shift.guide.guide_id, [...(map.get(shift.guide.guide_id) ?? []), shift]);
    }
    return map;
  }, [scheduleQuery.data]);

  if (guidesQuery.error) {
    const error = toApiErrorState(guidesQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void guidesQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Pemandu TNGL"
        title="Jadwal & Profil Pemandu"
        description="Lihat siapa yang bertugas di setiap shift, satwa favorit mereka, dan sisa kuota rombongan. Kontak pribadi pemandu tidak ditampilkan; semua komunikasi melalui pemesanan."
      />

      <section className="ui-panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-line bg-surface-muted px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink"><CalendarDays className="size-5 text-primary" />Siapa bertugas?</h2>
          <select
            aria-label="Filter rute"
            value={routeId}
            onChange={(event) => setRouteId(Number(event.target.value))}
            className="h-10 rounded-xl border border-line-strong bg-surface px-3 text-sm"
          >
            <option value={0}>Semua rute</option>
            {(routesQuery.data ?? []).map((route) => (
              <option key={route.route_id} value={route.route_id}>{route.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 overflow-x-auto border-b border-line px-5 py-3" role="tablist" aria-label="Pilih tanggal">
          {days.map((day) => {
            const value = toLocalDateInput(day);
            const active = value === selectedDate;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedDate(value)}
                className={`flex min-w-16 flex-col items-center rounded-xl px-3 py-2 text-xs transition ${
                  active ? "bg-primary text-white" : "border border-line bg-surface text-ink-soft hover:border-primary"
                } ${day.getDay() === 0 ? "font-bold" : ""}`}
              >
                <span>{new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(day)}</span>
                <span className="text-base font-bold">{day.getDate()}</span>
              </button>
            );
          })}
        </div>
        <div className="p-5">
          {scheduleQuery.isLoading || guidesQuery.isLoading ? (
            <Loading label="Memuat jadwal..." />
          ) : shiftsByGuide.size === 0 ? (
            <EmptyState title="Tidak ada pemandu bertugas" description="Coba tanggal atau rute lain." />
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {guides
                .filter((guide) => shiftsByGuide.has(guide.guide_id))
                .map((guide) => (
                  <li key={guide.guide_id} className="grid gap-3 py-4 md:grid-cols-[240px_1fr]">
                    <Link href={`/guides/${guide.guide_id}/detail`} className="flex items-center gap-3">
                      <GuideAvatar guideId={guide.guide_id} name={guide.display_name} hasPhoto={guide.has_photo} size="sm" />
                      <span>
                        <span className="block text-sm font-semibold text-ink hover:text-primary">{guide.display_name}</span>
                        <span className="block text-xs text-muted">🐾 {guide.favorite_animal}</span>
                      </span>
                    </Link>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {(shiftsByGuide.get(guide.guide_id) ?? []).map((shift) => (
                        <ShiftCell key={shift.shift_id} shift={shift} />
                      ))}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>

      <div>
        <h2 className="mb-4 text-base font-bold text-ink">Kenali para pemandu</h2>
        {guidesQuery.isLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {guides.map((guide) => (
              <GuideCard key={guide.guide_id} guide={guide} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
