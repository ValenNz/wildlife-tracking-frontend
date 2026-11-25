"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Clock, Footprints, Info, MapPin, Mountain, Route, Users } from "lucide-react";

import { EmptyState, ErrorState, Loading, PageHeader } from "@/components/ui";
import { RatingStars } from "@/components/tourism";
import { useTicketPrices, useTourRoutes } from "@/hooks/use-tourism";
import { toApiErrorState } from "@/services/api";
import { DIFFICULTY_LABELS, type TYPE_DIFFICULTY, type TYPE_TOUR_ROUTE } from "@/types/tourism.type";
import { formatRupiah } from "@/utils/format";

const DIFFICULTY_STYLES: Record<TYPE_DIFFICULTY, string> = {
  mudah: "bg-success-soft text-forest-primary",
  sedang: "bg-info-soft text-forest-deep",
  sulit: "bg-forest-black text-white",
};

const durationLabel = (route: TYPE_TOUR_ROUTE) =>
  route.duration_days > 1 ? `${route.duration_days} hari` : `${route.duration_hours} jam`;

function RouteCard({ route }: { route: TYPE_TOUR_ROUTE }) {
  return (
    <Link
      href={`/tours/${route.slug}/detail`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card"
    >
      <div className="relative bg-primary-dark px-5 pb-5 pt-6 text-white">
        <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_85%_15%,white,transparent_45%)]" />
        <div className="relative flex items-start justify-between gap-3">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
            {route.entry_point}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${DIFFICULTY_STYLES[route.difficulty]}`}>
            {DIFFICULTY_LABELS[route.difficulty]}
          </span>
        </div>
        <h3 className="relative mt-4 text-lg font-bold leading-snug">{route.name}</h3>
        <div className="relative mt-2 flex items-center gap-2 text-xs text-white/80">
          <RatingStars value={route.reviews_avg_route_rating} />
          <span>
            {route.reviews_count ? `${Number(route.reviews_avg_route_rating ?? 0).toFixed(1)} · ${route.reviews_count} ulasan` : "Belum ada ulasan"}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="line-clamp-3 text-sm leading-6 text-ink-soft">{route.summary}</p>
        <dl className="grid grid-cols-2 gap-3 text-xs text-muted">
          <div className="flex items-center gap-2"><Clock className="size-4 text-primary" />{durationLabel(route)}</div>
          <div className="flex items-center gap-2"><Footprints className="size-4 text-primary" />{route.distance_km ? `${Number(route.distance_km)} km` : "-"}</div>
          <div className="flex items-center gap-2"><Users className="size-4 text-primary" />Maks {route.max_group_size} orang</div>
          <div className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />Mulai {route.start_time?.slice(0, 5)}</div>
        </dl>
        <div className="flex flex-wrap gap-1.5">
          {route.wildlife.slice(0, 4).map((animal) => (
            <span key={animal} className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-ink-soft">
              {animal}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between border-t border-line pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted">Jasa pemandu mulai</p>
            <p className="text-lg font-bold text-ink">
              {formatRupiah(route.guide_fee_per_person)}
              <span className="text-xs font-medium text-muted"> /orang</span>
            </p>
          </div>
          <span className="text-sm font-semibold text-primary group-hover:underline">Lihat detail →</span>
        </div>
      </div>
    </Link>
  );
}

export default function ToursPage() {
  const routesQuery = useTourRoutes();
  const pricesQuery = useTicketPrices();
  const [entry, setEntry] = useState("all");

  const routes = useMemo(() => routesQuery.data ?? [], [routesQuery.data]);
  const entryPoints = useMemo(() => [...new Set(routes.map((route) => route.entry_point))], [routes]);
  const visible = entry === "all" ? routes : routes.filter((route) => route.entry_point === entry);
  const entryPrices = (pricesQuery.data ?? []).filter((price) => price.category === "entry");
  const activityPrices = (pricesQuery.data ?? []).filter((price) => price.category === "activity");

  if (routesQuery.error) {
    const error = toApiErrorState(routesQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void routesQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Wisata TN Gunung Leuser"
        title="Jelajah Tur & Rute"
        description="Pilih rute, cek jadwal pemandu per shift, lalu pesan tiket. Semua tur wajib didampingi pemandu berlisensi."
        actions={
          <>
            <Link href="/tours/map-3d" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
              <Mountain className="size-4" /> Peta 3D
            </Link>
            <Link href="/guides" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink-soft hover:border-primary hover:text-primary">
              <Users className="size-4" /> Jadwal Pemandu
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Pintu masuk">
        {["all", ...entryPoints].map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={entry === value}
            onClick={() => setEntry(value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
              entry === value ? "bg-primary text-white" : "border border-line bg-surface text-ink-soft hover:border-primary"
            }`}
          >
            {value === "all" ? <Route className="size-4" /> : <MapPin className="size-4" />}
            {value === "all" ? "Semua rute" : value}
          </button>
        ))}
      </div>

      {routesQuery.isLoading ? (
        <Loading label="Memuat rute..." />
      ) : visible.length === 0 ? (
        <EmptyState title="Belum ada rute aktif" description="Pengelola belum membuka rute untuk pemesanan." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((route) => (
            <RouteCard key={route.route_id} route={route} />
          ))}
        </div>
      )}

      <section className="ui-panel overflow-hidden">
        <div className="flex items-start gap-3 border-b border-line bg-surface-muted px-5 py-4">
          <div className="rounded-xl bg-primary-soft p-2 text-primary"><Mountain className="size-5" /></div>
          <div>
            <h2 className="text-base font-bold text-ink">Tarif Masuk Kawasan (PNBP)</h2>
            <p className="mt-1 text-sm text-muted">
              Berdasarkan PP No. 36 Tahun 2024 untuk TN Gunung Leuser (kelas III). Tarif masuk dikalikan jumlah hari kunjungan;
              jasa pemandu dihitung terpisah per rute.
            </p>
          </div>
        </div>
        <div className="grid gap-6 p-5 lg:grid-cols-[2fr_1fr]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted">
                <tr><th className="py-2">Kategori</th><th className="py-2">Hari</th><th className="py-2 text-right">Tarif</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entryPrices.map((price) => (
                  <tr key={price.price_id}>
                    <td className="py-2.5 font-medium text-ink">
                      {price.name}
                      {price.min_quantity > 1 ? <span className="ml-2 text-xs text-muted">(min. {price.min_quantity} orang)</span> : null}
                    </td>
                    <td className="py-2.5 text-muted">{price.day_type === "holiday" ? "Minggu/Libur" : price.day_type === "weekday" ? "Senin–Sabtu" : "Semua hari"}</td>
                    <td className="py-2.5 text-right font-semibold text-ink">{formatRupiah(price.amount)}<span className="text-xs font-normal text-muted"> /{price.unit}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4 text-sm text-ink-soft">
            <p className="flex items-center gap-2 font-semibold text-ink"><Info className="size-4 text-primary" /> Perlu diketahui</p>
            {activityPrices.map((price) => (
              <p key={price.price_id}>{price.name}: <b>{formatRupiah(price.amount)}</b> /{price.unit}</p>
            ))}
            <p>Tarif dapat berubah sesuai keputusan Balai Besar TNGL. Pembayaran PNBP disetor ke kas negara.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
