"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { useUserRole } from "@/components/providers/preferences-provider";
import { IucnBadge, SpeciesViewer, type SpeciesViewerHandle } from "@/components/wildlife";
import { useSpeciesModelUrl, useWildlifeSpeciesDetail } from "@/hooks/use-wildlife";
import { cn } from "@/lib/utils";
import { roleHasPermission } from "@/types/auth.type";
import { MODEL_SOURCE_LABELS } from "@/types/wildlife.type";
import { formatDateTime } from "@/utils/format";

import type { TrackedAnimal } from "./live-terrain-map";

const COMPASS = ["U", "TL", "T", "Tg", "S", "BD", "B", "BL"];
const compass = (deg: number) => COMPASS[Math.round(deg / 45) % 8];

export function relativeTime(iso: string, now: number): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds} dtk lalu`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} jam lalu`;
  return `${Math.round(hours / 24)} hari lalu`;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-b-0">
      <dt className="shrink-0 text-[13px] text-muted">{label}</dt>
      <dd className="text-right text-[13px] text-ink">{children}</dd>
    </div>
  );
}

export function AnimalDetail({ animal, now, onBack }: { animal: TrackedAnimal; now: number; onBack: () => void }) {
  const role = useUserRole();
  const canManage = role ? roleHasPermission(role, "manage_master_data") : false;
  const detail = useWildlifeSpeciesDetail(animal.speciesId, true);
  const species = detail.data;
  const model = useSpeciesModelUrl(
    animal.speciesId,
    Boolean(species?.has_model),
    `${species?.model_credit ?? ""}|${species?.model_source ?? ""}`,
    true,
  );
  const viewerRef = useRef<SpeciesViewerHandle>(null);
  const [hotspot, setHotspot] = useState<number | null>(null);
  const hotspots = species?.model_hotspots ?? [];

  return (
    <div className="flex flex-col">
      <div className="border-b border-line px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 inline-flex min-h-9 items-center gap-1 rounded px-1 text-[13px] text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Semua satwa
        </button>
        <div className="mt-1 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-tight text-ink">
              {animal.name === animal.key ? (species?.common_name ?? animal.speciesName) : animal.name}
            </h2>
            <p className="mt-0.5 text-[13px] text-ink-soft">
              {animal.name === animal.key ? null : <>{species?.common_name ?? animal.speciesName} · </>}
              {species?.scientific_name ? <span className="italic text-muted">{species.scientific_name}</span> : null}
            </p>
          </div>
          {species ? <IucnBadge status={species.conservation_status} /> : null}
        </div>
      </div>

      <dl className="px-4 py-1">
        <Row label="Kode">
          <span className="font-mono">{animal.key}</span>
        </Row>
        <Row label="Posisi">
          <span className="font-mono tabular-nums">
            {animal.latitude.toFixed(5)}, {animal.longitude.toFixed(5)}
          </span>
        </Row>
        <Row label="Titik terakhir">
          <span title={formatDateTime(animal.recordedAt)}>{relativeTime(animal.recordedAt, now)}</span>
        </Row>
        <Row label="Gerak">
          {animal.speedKmh === null
            ? "—"
            : animal.speedKmh < 0.2
              ? "Diam"
              : `${animal.speedKmh.toFixed(1)} km/jam${animal.headingDeg === null ? "" : ` ke ${compass(animal.headingDeg)}`}`}
        </Row>
        <Row label="Kalung GPS">
          #{animal.deviceId}
          {animal.batteryLevel === null ? "" : ` · baterai ${animal.batteryLevel}%`}
        </Row>
      </dl>

      <section className="border-t border-line px-4 py-4" aria-labelledby="model-heading">
        <h3 id="model-heading" className="mb-2 text-[13px] font-semibold text-ink">
          Model 3D
        </h3>
        {detail.isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-md bg-surface-muted text-[13px] text-muted">Memuat…</div>
        ) : detail.error ? (
          <div className="rounded-md bg-surface-muted p-4 text-[13px] text-muted">
            Profil spesies gagal dimuat.{" "}
            <button type="button" onClick={() => void detail.refetch()} className="font-medium text-primary underline">
              Coba lagi
            </button>
          </div>
        ) : species?.has_model ? (
          <>
            <SpeciesViewer
              ref={viewerRef}
              src={model.url}
              alt={`Model 3D ${species.common_name}`}
              hotspots={hotspots}
              activeHotspot={hotspot}
              onHotspotClick={setHotspot}
              className="h-64 rounded-md sm:h-72"
            />
            <p className="mt-1.5 text-xs text-muted">
              Seret untuk memutar, scroll untuk memperbesar.
              {species.model_source ? ` ${MODEL_SOURCE_LABELS[species.model_source]}` : ""}
              {species.model_credit ? ` — ${species.model_credit}` : ""}
            </p>
          </>
        ) : (
          <p className="rounded-md bg-surface-muted p-4 text-[13px] text-muted">
            Belum ada model 3D untuk {species?.common_name ?? "spesies ini"}.
            {canManage ? (
              <>
                {" "}
                <Link href={`/species/${animal.speciesId}/model`} className="font-medium text-primary underline">
                  Unggah model
                </Link>
              </>
            ) : null}
          </p>
        )}

        {hotspots.length > 0 ? (
          <ol className="mt-3 flex flex-col">
            {hotspots.map((item, index) => (
              <li key={`${item.position}-${index}`}>
                <button
                  type="button"
                  onClick={() => {
                    setHotspot(index);
                    viewerRef.current?.focusHotspot(index);
                  }}
                  className={cn(
                    "flex w-full gap-2 rounded px-1.5 py-1.5 text-left text-[13px]",
                    hotspot === index ? "bg-primary-soft text-ink" : "text-ink-soft hover:bg-surface-muted",
                  )}
                >
                  <span className="w-4 shrink-0 font-mono text-muted">{index + 1}.</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      {species ? (
        <section className="border-t border-line px-4 py-4 text-[13px] leading-6 text-ink-soft">
          {species.description ? <p>{species.description}</p> : null}
          <dl className="mt-2">
            {species.size_weight ? <Row label="Ukuran">{species.size_weight}</Row> : null}
            {species.activity_pattern ? <Row label="Aktif">{species.activity_pattern}</Row> : null}
            {species.diet ? <Row label="Makanan">{species.diet}</Row> : null}
            {species.population_estimate ? <Row label="Populasi">{species.population_estimate}</Row> : null}
          </dl>
          {species.habitat ? (
            <p className="mt-3">
              <span className="font-medium text-ink">Habitat. </span>
              {species.habitat}
            </p>
          ) : null}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-3 text-[13px]">
        <Link href={`/animals/${animal.animalId}/detail`} className="font-medium text-primary hover:underline">
          Riwayat satwa
        </Link>
        {canManage ? (
          <Link href={`/species/${animal.speciesId}/model`} className="font-medium text-primary hover:underline">
            Kelola profil &amp; model 3D
          </Link>
        ) : null}
      </div>
    </div>
  );
}
