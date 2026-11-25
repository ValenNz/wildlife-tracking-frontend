"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Backpack,
  CalendarDays,
  CheckCircle2,
  Clock,
  Footprints,
  MapPin,
  PawPrint,
  ShieldAlert,
  Ticket,
  Users,
} from "lucide-react";

import { EmptyState, ErrorState, Loading } from "@/components/ui";
import { ElevationProfile, GuideAvatar, RatingStars, RouteMap, routeColor } from "@/components/tourism";
import { TrailSafetyPanel } from "@/components/tourism/trail-safety-panel";
import { useTourRoute } from "@/hooks/use-tourism";
import { toApiErrorState } from "@/services/api";
import { DIFFICULTY_LABELS, SHIFT_LABELS, type TYPE_PUBLIC_SHIFT } from "@/types/tourism.type";
import { formatDate, formatLongDate, formatRupiah } from "@/utils/format";

const RouteMap3D = dynamic(() => import("@/components/tourism/route-map-3d").then((module) => module.RouteMap3D), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse rounded-2xl bg-surface-muted" />,
});

function ListCard({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <section className="ui-panel p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">{icon}{title}</h3>
      <ul className="flex flex-col gap-2 text-sm leading-6 text-ink-soft">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ShiftRow({ shift, slug }: { shift: TYPE_PUBLIC_SHIFT; slug: string }) {
  const full = shift.remaining <= 0;

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      {shift.guide ? (
        <GuideAvatar guideId={shift.guide.guide_id} name={shift.guide.display_name} hasPhoto={shift.guide.has_photo} size="sm" />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">
          {formatDate(shift.shift_date)} · {SHIFT_LABELS[shift.shift_type]} {shift.start_time}–{shift.end_time}
        </p>
        <p className="text-xs text-muted">
          {shift.guide ? (
            <Link href={`/guides/${shift.guide.guide_id}/detail`} className="font-medium text-primary hover:underline">
              {shift.guide.display_name}
            </Link>
          ) : "Pemandu"}
          {shift.guide?.favorite_animal ? ` · suka ${shift.guide.favorite_animal}` : ""}
        </p>
      </div>
      <span className={`text-xs font-semibold ${full ? "text-danger" : "text-forest-primary"}`}>
        {full ? "Penuh" : `Sisa ${shift.remaining}/${shift.capacity}`}
      </span>
      {full ? null : (
        <Link
          href={`/tours/${slug}/create?shift=${shift.shift_id}`}
          className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-dark"
        >
          Pilih
        </Link>
      )}
    </li>
  );
}

export default function TourDetailPage() {
  const { id: slug } = useParams<{ id: string }>();
  const routeQuery = useTourRoute(slug ?? "");
  const detail = routeQuery.data;
  const route = detail?.route;
  const [view, setView] = useState<"2d" | "3d">("2d");
  const routes3d = useMemo(
    () =>
      route
        ? [
            {
              id: route.route_id,
              name: route.name,
              color: routeColor(0),
              waypoints: route.waypoints ?? [],
              meeting:
                route.meeting_lat && route.meeting_lon
                  ? { lat: Number(route.meeting_lat), lon: Number(route.meeting_lon), label: route.meeting_point }
                  : null,
            },
          ]
        : [],
    [route],
  );

  const meeting = useMemo(
    () =>
      route?.meeting_lat && route?.meeting_lon
        ? { lat: Number(route.meeting_lat), lon: Number(route.meeting_lon), label: route.meeting_point }
        : null,
    [route],
  );

  if (routeQuery.isLoading) return <Loading label="Memuat detail rute..." />;
  if (routeQuery.error || !detail || !route) {
    const error = toApiErrorState(routeQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void routeQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/tours" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="size-4" /> Semua rute
      </Link>

      <header className="relative overflow-hidden rounded-card bg-primary-dark px-6 py-8 text-white sm:px-8">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_90%_10%,white,transparent_40%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{route.code} · {route.entry_point}</p>
            <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{route.name}</h1>
            <p className="mt-3 text-sm leading-7 text-white/80">{route.summary}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-white/80">
              <RatingStars value={route.reviews_avg_route_rating} />
              {route.reviews_count ? `${Number(route.reviews_avg_route_rating).toFixed(1)} dari ${route.reviews_count} ulasan` : "Belum ada ulasan"}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur lg:min-w-64">
            <p className="text-xs uppercase tracking-wider text-white/70">Jasa pemandu</p>
            <p className="text-2xl font-bold">{formatRupiah(route.guide_fee_per_person)}<span className="text-sm font-normal text-white/70"> /orang</span></p>
            <p className="mt-1 text-xs text-white/70">+ tiket masuk PNBP sesuai kategori & hari</p>
            <Link
              href={`/tours/${route.slug}/create`}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-primary-dark hover:bg-white/90"
            >
              <Ticket className="size-4" /> Pesan Tiket
            </Link>
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { icon: Clock, label: "Durasi", value: route.duration_days > 1 ? `${route.duration_days} hari` : `${route.duration_hours} jam` },
          { icon: Footprints, label: "Jarak", value: route.distance_km ? `${Number(route.distance_km)} km` : "-" },
          { icon: ShieldAlert, label: "Tingkat", value: DIFFICULTY_LABELS[route.difficulty] },
          { icon: Users, label: "Rombongan", value: `Maks ${route.max_group_size} orang` },
          { icon: CalendarDays, label: "Mulai", value: `${route.start_time?.slice(0, 5)} WIB` },
          { icon: CheckCircle2, label: "Usia minimal", value: route.min_age ? `${route.min_age} tahun` : "Semua usia" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-4">
            <dt className="flex items-center gap-1.5 text-xs text-muted"><Icon className="size-3.5 text-primary" />{label}</dt>
            <dd className="mt-1 text-sm font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          <section className="ui-panel p-5">
            <h2 className="mb-3 text-base font-bold text-ink">Tentang rute</h2>
            <p className="whitespace-pre-line text-sm leading-7 text-ink-soft">{route.description}</p>
          </section>

          <section className="ui-panel p-5">
            <h2 className="mb-4 text-base font-bold text-ink">Itinerary</h2>
            <ol className="relative flex flex-col gap-5 border-l-2 border-primary-soft pl-6">
              {route.itinerary.map((step, index) => (
                <li key={`${step.time}-${index}`} className="relative">
                  <span className="absolute -left-[33px] top-0.5 flex size-4 items-center justify-center rounded-full border-2 border-primary bg-surface" />
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">{step.time}</p>
                  <p className="text-sm font-semibold text-ink">{step.title}</p>
                  {step.description ? <p className="mt-1 text-sm leading-6 text-muted">{step.description}</p> : null}
                </li>
              ))}
            </ol>
          </section>

          <section className="ui-panel p-5">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink"><MapPin className="size-4 text-primary" />Peta jalur & titik kumpul</h2>
              <div className="flex overflow-hidden rounded-lg border border-line text-xs font-semibold" role="tablist" aria-label="Mode peta">
                {(["2d", "3d"] as const).map((mode) => (
                  <button key={mode} type="button" role="tab" aria-selected={view === mode} onClick={() => setView(mode)} className={view === mode ? "bg-primary px-3 py-1.5 text-white" : "px-3 py-1.5 text-ink-soft"}>
                    {mode === "2d" ? "2D" : "3D"}
                  </button>
                ))}
              </div>
            </div>
            <p className="mb-4 text-sm text-muted">
              {route.meeting_point} ·{" "}
              <Link href="/tours/map-3d" className="font-semibold text-primary hover:underline">semua rute dalam 3D</Link>
            </p>
            {view === "3d" ? (
              <div className="flex flex-col gap-4">
                <RouteMap3D routes={routes3d} selectedId={route.route_id} className="h-[440px]" />
                {route.waypoints && route.waypoints.length > 1 ? <ElevationProfile waypoints={route.waypoints} /> : null}
              </div>
            ) : route.waypoints && route.waypoints.length > 1 ? (
              <div className="flex flex-col gap-4">
                <RouteMap waypoints={route.waypoints} meeting={meeting} />
                <ElevationProfile waypoints={route.waypoints} />
              </div>
            ) : meeting ? (
              <RouteMap waypoints={[]} meeting={meeting} />
            ) : (
              <p className="text-sm text-muted">Peta jalur belum tersedia.</p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="ui-panel p-5">
            <h2 className="mb-1 text-base font-bold text-ink">Jadwal pemandu terdekat</h2>
            <p className="text-sm text-muted">Pilih shift yang masih memiliki kuota.</p>
            {detail.upcoming_shifts.length === 0 ? (
              <EmptyState className="mt-4" title="Belum ada jadwal" description="Shift pemandu untuk rute ini belum dibuka." />
            ) : (
              <ul className="mt-2 divide-y divide-line">
                {detail.upcoming_shifts.slice(0, 10).map((shift) => (
                  <ShiftRow key={shift.shift_id} shift={shift} slug={route.slug} />
                ))}
              </ul>
            )}
          </section>
          <ListCard title="Satwa yang mungkin dijumpai" icon={<PawPrint className="size-4 text-primary" />} items={route.wildlife} />
          <ListCard title="Termasuk dalam paket" icon={<CheckCircle2 className="size-4 text-primary" />} items={route.includes} />
          <ListCard title="Yang perlu dibawa" icon={<Backpack className="size-4 text-primary" />} items={route.bring_list} />
          <ListCard title="Aturan kawasan" icon={<ShieldAlert className="size-4 text-primary" />} items={route.rules} />
        </aside>
      </div>

      <TrailSafetyPanel slug={route.slug} />

      <section className="ui-panel p-5">
        <h2 className="mb-4 text-base font-bold text-ink">Ulasan pengunjung</h2>
        {detail.reviews.length === 0 ? (
          <p className="text-sm text-muted">Belum ada ulasan untuk rute ini.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {detail.reviews.map((review) => (
              <li key={review.review_id} className="rounded-2xl border border-line p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{review.reviewer}</p>
                  <RatingStars value={review.route_rating} />
                </div>
                {review.comment ? <p className="mt-2 text-sm leading-6 text-ink-soft">{review.comment}</p> : null}
                <p className="mt-2 text-xs text-muted">
                  {review.guide ? `Pemandu: ${review.guide}` : ""}
                  {review.guide_rating ? ` (${review.guide_rating}/5)` : ""}
                  {review.created_at ? ` · ${formatLongDate(review.created_at)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
