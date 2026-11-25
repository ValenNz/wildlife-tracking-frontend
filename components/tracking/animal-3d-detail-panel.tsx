"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  Clock,
  Compass,
  ExternalLink,
  Gauge,
  Info,
  MapPin,
  Radio,
  Ruler,
  Sun,
  Users,
  X,
} from "lucide-react";

import { StatusBadge } from "@/components/status";
import { IucnBadge, SpeciesViewer, type SpeciesViewerHandle } from "@/components/wildlife";
import { useSpeciesModelUrl, useWildlifeSpeciesDetail } from "@/hooks/use-wildlife";
import { cn } from "@/lib/utils";
import { MODEL_SOURCE_LABELS } from "@/types/wildlife.type";
import { formatDate } from "@/utils/format";
import type { LiveMapAnimal3D } from "./leuser-mountain-3d";

type Animal3DDetailPanelProps = {
  animal: LiveMapAnimal3D;
  onClose: () => void;
};

export function Animal3DDetailPanel({ animal, onClose }: Animal3DDetailPanelProps) {
  const detailQuery = useWildlifeSpeciesDetail(animal.speciesId, true);
  const species = detailQuery.data;
  const model = useSpeciesModelUrl(
    animal.speciesId,
    Boolean(species?.has_model),
    `${species?.model_credit ?? ""}|${species?.model_source ?? ""}`,
    true,
  );
  const viewerRef = useRef<SpeciesViewerHandle>(null);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const hotspots = species?.model_hotspots ?? [];
  const facts = species
    ? [
        { icon: Ruler, label: "Ukuran & Berat", value: species.size_weight },
        { icon: Clock, label: "Umur", value: species.lifespan },
        { icon: Sun, label: "Aktivitas", value: species.activity_pattern },
        { icon: Users, label: "Populasi", value: species.population_estimate },
      ].filter((fact) => fact.value)
    : [];

  return (
    <section
      aria-label={`Informasi dan Model 3D ${animal.name}`}
      className="ui-panel overflow-hidden border-primary/30 p-4 sm:p-5"
    >
      {/* Header strip */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
              {animal.id}
            </span>
            <StatusBadge
              label={animal.status}
              variant={animal.isActive ? "success" : "danger"}
            />
            {species ? <IucnBadge status={species.conservation_status} /> : null}
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-ink sm:text-xl">
            {species?.common_name ?? animal.name}
          </h2>
          {species?.scientific_name ? (
            <p className="text-xs italic text-muted">{species.scientific_name}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/animals/${animal.animalId}/detail`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-ink-soft transition hover:border-primary hover:text-primary"
          >
            <span>Detail Satwa</span>
            <ExternalLink className="size-3.5" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel satwa"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition hover:bg-surface-muted"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Live 10-second GPS telemetry bar */}
      <dl className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface-muted/70 p-2.5">
          <dt className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <MapPin className="size-3 text-primary" /> Koordinat Live
          </dt>
          <dd className="mt-1 font-mono text-xs font-bold text-ink">
            {animal.latitude.toFixed(5)}, {animal.longitude.toFixed(5)}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-surface-muted/70 p-2.5">
          <dt className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <Gauge className="size-3 text-primary" /> Kecepatan
          </dt>
          <dd className="mt-1 font-mono text-xs font-bold text-ink">
            {animal.speedKmh.toFixed(1)} km/jam
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-surface-muted/70 p-2.5">
          <dt className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <Compass className="size-3 text-primary" /> Arah Gerak
          </dt>
          <dd className="mt-1 text-xs font-bold text-ink">{animal.heading}</dd>
        </div>
        <div className="rounded-xl border border-line bg-surface-muted/70 p-2.5">
          <dt className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <Radio className="size-3 text-primary" /> Perangkat #{animal.deviceId}
          </dt>
          <dd className="mt-1 text-xs font-medium text-ink-soft">
            {formatDate(animal.recordedAt)}
          </dd>
        </div>
      </dl>

      {/* Interactive 3D Model + Ecological Info Grid */}
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col gap-2">
          {detailQuery.isLoading ? (
            <div className="flex h-[340px] items-center justify-center rounded-2xl border border-line bg-surface-muted text-sm text-muted">
              Memuat model 3D satwa...
            </div>
          ) : species?.has_model ? (
            <SpeciesViewer
              ref={viewerRef}
              src={model.url}
              alt={`Model 3D ${species.common_name}`}
              hotspots={hotspots}
              activeHotspot={activeHotspot}
              onHotspotClick={setActiveHotspot}
              className="h-[min(420px,55dvh)] min-h-[300px]"
            />
          ) : (
            <div className="flex h-[320px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface-muted/50 p-6 text-center text-sm text-muted">
              <p className="font-semibold text-ink">Model 3D belum diunggah untuk spesies ini</p>
              <p className="max-w-sm text-xs">
                Informasi spesies dan pelacakan GPS live per 10 detik tetap aktif dan ditampilkan di samping.
              </p>
            </div>
          )}

          {species?.has_model ? (
            <p className="flex items-start gap-1.5 text-[11px] leading-4 text-muted">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Seret untuk memutar model 3D · scroll/cubit untuk memperbesar · klik nomor untuk ciri tubuh.
                {species.model_source ? ` ${MODEL_SOURCE_LABELS[species.model_source]}` : ""}
                {species.model_credit ? ` — ${species.model_credit}` : ""}
              </span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          {facts.length > 0 ? (
            <dl className="grid grid-cols-2 gap-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-line bg-surface p-2.5">
                  <dt className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    <Icon className="size-3 text-primary" />
                    {label}
                  </dt>
                  <dd className="mt-1 text-xs font-semibold leading-5 text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {species?.description ? (
            <div className="rounded-xl border border-line bg-surface p-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Informasi Satwa
              </h3>
              <p className="mt-1.5 text-xs leading-6 text-ink-soft">
                {species.description}
              </p>
            </div>
          ) : null}

          {species?.habitat ? (
            <div className="rounded-xl border border-line bg-surface p-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Habitat & Ekologi
              </h3>
              <p className="mt-1.5 text-xs leading-6 text-ink-soft">{species.habitat}</p>
            </div>
          ) : null}

          {hotspots.length > 0 ? (
            <div className="rounded-xl border border-line bg-surface p-3">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                Ciri pada Model 3D
              </h3>
              <ol className="flex flex-col gap-1">
                {hotspots.map((hotspot, index) => (
                  <li key={`${hotspot.position}-${index}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveHotspot(index);
                        viewerRef.current?.focusHotspot(index);
                      }}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-lg p-1.5 text-left text-xs transition",
                        activeHotspot === index ? "bg-primary-soft text-ink" : "hover:bg-surface-muted",
                      )}
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink">{hotspot.label}</span>
                        {hotspot.description ? (
                          <span className="block text-[11px] text-muted">{hotspot.description}</span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
