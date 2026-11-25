"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Clock, Footprints, Mountain, Play, Ticket } from "lucide-react";

import { ElevationProfile, routeColor } from "@/components/tourism";
import type { Map3DRoute, RouteMap3DHandle } from "@/components/tourism/route-map-3d";
import { ErrorState, Loading, PageHeader } from "@/components/ui";
import { useTourRoutes } from "@/hooks/use-tourism";
import { cn } from "@/lib/utils";
import { toApiErrorState } from "@/services/api";
import { DIFFICULTY_LABELS } from "@/types/tourism.type";
import { formatRupiah } from "@/utils/format";

// MapLibre (WebGL) hanya di browser.
const RouteMap3D = dynamic(() => import("@/components/tourism/route-map-3d").then((module) => module.RouteMap3D), {
  ssr: false,
  loading: () => <div className="h-full min-h-[360px] animate-pulse rounded-2xl bg-surface-muted sm:min-h-[520px]" />,
});

export default function Map3DPage() {
  const routesQuery = useTourRoutes();
  const mapRef = useRef<RouteMap3DHandle>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const routes = useMemo(() => routesQuery.data ?? [], [routesQuery.data]);
  const mapRoutes = useMemo<Map3DRoute[]>(
    () =>
      routes.map((route, index) => ({
        id: route.route_id,
        name: route.name,
        color: routeColor(index),
        waypoints: route.waypoints ?? [],
        meeting:
          route.meeting_lat && route.meeting_lon
            ? { lat: Number(route.meeting_lat), lon: Number(route.meeting_lon), label: route.meeting_point }
            : null,
      })),
    [routes],
  );
  const selected = routes.find((route) => route.route_id === selectedId) ?? null;

  if (routesQuery.error) {
    const error = toApiErrorState(routesQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void routesQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Peta & Rute 3D"
        title="Jelajahi Leuser dalam 3D"
        description="Relief Bukit Barisan dari data elevasi, citra satelit, dan jalur tiap tur. Pilih rute lalu tekan “Jelajahi jalur” untuk terbang mengikuti jalurnya. Geser dengan klik kanan / dua jari untuk memiringkan peta."
        className="mb-0"
      />

      {routesQuery.isLoading ? (
        <Loading label="Memuat rute..." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
          <RouteMap3D ref={mapRef} routes={mapRoutes} selectedId={selectedId} onSelect={setSelectedId} className="h-[62dvh] min-h-[360px] sm:min-h-[520px]" />

          <aside className="flex flex-col gap-3">
            <ul className="flex flex-col gap-2" aria-label="Daftar rute">
              {routes.map((route, index) => (
                <li key={route.route_id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(route.route_id === selectedId ? null : route.route_id)}
                    aria-pressed={route.route_id === selectedId}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition",
                      route.route_id === selectedId ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary",
                    )}
                  >
                    <span className="mt-1 h-3 w-6 shrink-0 rounded-full" style={{ background: routeColor(index) }} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">{route.name}</span>
                      <span className="block text-xs text-muted">
                        {route.entry_point.split(",")[0]} · {DIFFICULTY_LABELS[route.difficulty]} · {route.distance_km ? `${Number(route.distance_km)} km` : "-"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {selected ? (
              <section className="ui-panel flex flex-col gap-3 p-4">
                <h2 className="text-base font-bold text-ink">{selected.name}</h2>
                <p className="text-sm leading-6 text-ink-soft">{selected.summary}</p>
                <dl className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-xl bg-surface-muted p-2"><dt className="flex items-center gap-1 text-muted"><Clock className="size-3" />Durasi</dt><dd className="font-bold">{selected.duration_days > 1 ? `${selected.duration_days} hari` : `${selected.duration_hours} jam`}</dd></div>
                  <div className="rounded-xl bg-surface-muted p-2"><dt className="flex items-center gap-1 text-muted"><Footprints className="size-3" />Jarak</dt><dd className="font-bold">{selected.distance_km ? `${Number(selected.distance_km)} km` : "-"}</dd></div>
                  <div className="rounded-xl bg-surface-muted p-2"><dt className="flex items-center gap-1 text-muted"><Mountain className="size-3" />Puncak</dt><dd className="font-bold">{selected.waypoints?.length ? `${Math.max(...selected.waypoints.map((point) => point[2]))} m` : "-"}</dd></div>
                </dl>
                {selected.waypoints && selected.waypoints.length > 1 ? <ElevationProfile waypoints={selected.waypoints} /> : null}
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => mapRef.current?.flyThrough(selected.route_id)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
                    <Play className="size-4" /> Fly-through
                  </button>
                  <Link href={`/tours/${selected.slug}/detail`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line-strong px-4 text-sm font-semibold text-ink-soft hover:border-primary">
                    <Ticket className="size-4" /> Detail & pesan ({formatRupiah(selected.guide_fee_per_person)})
                  </Link>
                </div>
              </section>
            ) : (
              <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">Klik rute di peta atau di daftar untuk melihat detail dan profil ketinggiannya.</p>
            )}
            <p className="text-[11px] leading-4 text-muted">
              Jalur di peta adalah gambaran rute wisata, bukan panduan navigasi. Selalu ikuti pemandu; elevasi dari data global (resolusi ±30–90 m).
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
