"use client";

import { useState } from "react";

import { TrailSafetyPanel } from "@/components/tourism/trail-safety-panel";
import { ErrorState, Loading, PageHeader } from "@/components/ui";
import { useTourRoutes } from "@/hooks/use-tourism";
import { cn } from "@/lib/utils";
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
        description="Nomor posko BBTNGL, frekuensi radio VHF, detail pos jalur, pantauan ancaman AI, dan tombol sinyal SOS instan."
        className="mb-0"
      />

      {routes.length > 0 ? (
        <nav
          aria-label="Pilih koridor jalur"
          className="flex items-center gap-5 overflow-x-auto border-b border-line"
        >
          {routes.map((route) => {
            const selected = route.slug === activeSlug;
            return (
              <button
                key={route.route_id}
                type="button"
                onClick={() => setSelectedSlug(route.slug)}
                aria-pressed={selected}
                className={cn(
                  "-mb-px shrink-0 border-b-2 pb-2.5 pt-1 text-sm font-medium transition-colors",
                  selected
                    ? "border-primary font-semibold text-ink"
                    : "border-transparent text-muted hover:border-line-strong/40 hover:text-ink",
                )}
              >
                {route.name}
              </button>
            );
          })}
        </nav>
      ) : null}

      {activeSlug ? (
        <TrailSafetyPanel slug={activeSlug} />
      ) : (
        <p className="py-8 text-sm text-muted">
          Belum ada rute wisata aktif untuk menampilkan kontak darurat.
        </p>
      )}
    </div>
  );
}
