"use client";

import { useState } from "react";
import { PhoneCall } from "lucide-react";

import { TrailSafetyPanel } from "@/components/tourism/trail-safety-panel";
import { ErrorState, Loading, PageHeader } from "@/components/ui";
import { useTourRoutes } from "@/hooks/use-tourism";
import { toApiErrorState } from "@/services/api";

export default function EmergencyContactsPage() {
  const routesQuery = useTourRoutes();
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  if (routesQuery.isLoading) {
    return <Loading label="Memuat daftar jalur & kontak darurat..." />;
  }

  if (routesQuery.error) {
    const err = toApiErrorState(routesQuery.error);
    return (
      <ErrorState
        kind={err.kind}
        message={err.message}
        status={err.status}
        errors={err.errors}
        onRetry={() => void routesQuery.refetch()}
      />
    );
  }

  const routes = routesQuery.data ?? [];
  const activeSlug = selectedSlug || routes[0]?.slug || "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Keselamatan & Tanggap Darurat TNGL"
        title="Kontak Darurat, Detail Pos & Alert AI"
        description="Akses langsung untuk seluruh role: nomor posko BBTNGL, frekuensi radio VHF, detail pos jalur, pantauan ancaman AI, dan tombol sinyal SOS instan."
        className="mb-0"
      />

      {routes.length > 0 ? (
        <section className="ui-panel p-4">
          <div className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <PhoneCall className="size-3.5 text-primary" />
            <span>Pilih Rute / Koridor Jalur</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {routes.map((route) => {
              const selected = route.slug === activeSlug;
              return (
                <button
                  key={route.route_id}
                  type="button"
                  onClick={() => setSelectedSlug(route.slug)}
                  aria-pressed={selected}
                  className={
                    selected
                      ? "rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm"
                      : "rounded-xl border border-line bg-surface-muted px-3.5 py-2 text-xs font-semibold text-ink-soft hover:border-primary hover:text-ink"
                  }
                >
                  {route.code} · {route.name}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeSlug ? (
        <TrailSafetyPanel slug={activeSlug} />
      ) : (
        <section className="ui-panel p-5">
          <p className="text-sm text-muted">Belum ada rute wisata aktif untuk menampilkan kontak darurat.</p>
        </section>
      )}
    </div>
  );
}
