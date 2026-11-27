"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Clock, Home, Info, Leaf, Ruler, ShieldCheck, Sparkles, Sun, Users } from "lucide-react";

import { ErrorState, Loading } from "@/components/ui";
import { IucnBadge, SpeciesViewer, type SpeciesViewerHandle } from "@/components/wildlife";
import { useSpeciesModelUrl, useWildlifeSpeciesDetail } from "@/hooks/use-wildlife";
import { cn } from "@/lib/utils";
import { toApiErrorState } from "@/services/api";
import { MODEL_SOURCE_LABELS, type TYPE_MODEL_HOTSPOT } from "@/types/wildlife.type";

import { useUserRole } from "@/components/providers/preferences-provider";
import { roleHasPermission } from "@/types/auth.type";
import { ManagePanel } from "./manage";

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="ui-panel p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">{icon}{title}</h2>
      <div className="text-sm leading-7 text-ink-soft">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] | null }) {
  if (!items?.length) return <p className="text-muted">Belum ada data.</p>;
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function SpeciesDetailPage() {
  const userRole = useUserRole();
  const canManage = userRole ? roleHasPermission(userRole, "manage_master_data") : false;
  const params = useParams<{ id: string }>();
  const id = Number(params.id ?? 0);
  // Pengelola melihat versi staf (termasuk spesies yang disembunyikan dari publik).
  const detailQuery = useWildlifeSpeciesDetail(id, canManage);
  const species = detailQuery.data;
  const model = useSpeciesModelUrl(id, Boolean(species?.has_model), `${species?.model_credit ?? ""}|${species?.model_source ?? ""}`, canManage);
  const viewerRef = useRef<SpeciesViewerHandle>(null);
  const [active, setActive] = useState<number | null>(null);
  const [draftHotspots, setDraftHotspots] = useState<TYPE_MODEL_HOTSPOT[] | null>(null);
  const [picking, setPicking] = useState(false);
  const [pickHandler, setPickHandler] = useState<((point: { position: string; normal: string }) => void) | null>(null);

  if (detailQuery.isLoading) return <Loading label="Memuat satwa…" />;
  if (detailQuery.error || !species) {
    const error = toApiErrorState(detailQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void detailQuery.refetch()} />;
  }

  const hotspots = draftHotspots ?? species.model_hotspots ?? [];
  const facts = [
    { icon: Ruler, label: "Ukuran & berat", value: species.size_weight },
    { icon: Clock, label: "Umur", value: species.lifespan },
    { icon: Sun, label: "Pola aktivitas", value: species.activity_pattern },
    { icon: Users, label: "Populasi", value: species.population_estimate },
  ].filter((fact) => fact.value);

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/species/${id}/detail`} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="size-4" /> Kembali ke data spesies
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-3">
          {species.has_model ? (
            <div id="species-viewer" className="scroll-mt-24">
            <SpeciesViewer
              ref={viewerRef}
              src={model.url}
              alt={`Model 3D ${species.common_name}`}
              hotspots={hotspots}
              activeHotspot={active}
              onHotspotClick={setActive}
              picking={picking}
              onPick={(point) => pickHandler?.(point)}
              className="h-[min(460px,65dvh)] min-h-[300px] sm:h-[560px]"
            />
            </div>
          ) : (
            <div className="flex h-[360px] items-center justify-center rounded-2xl border border-dashed border-line text-sm text-muted">
              Model 3D belum tersedia untuk satwa ini.
            </div>
          )}
          <p className="flex items-start gap-2 text-xs leading-5 text-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Seret untuk memutar · scroll/cubit untuk memperbesar · klik kanan/dua jari untuk menggeser · klik nomor untuk melihat ciri.
              {species.model_source ? ` ${MODEL_SOURCE_LABELS[species.model_source]}` : ""}
              {species.model_credit ? ` — ${species.model_credit}` : ""}
            </span>
          </p>
        </div>

        <aside className="flex flex-col gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <IucnBadge status={species.conservation_status} />
              {!species.is_public ? <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-bold text-muted">Tersembunyi dari publik</span> : null}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">{species.common_name}</h1>
            <p className="text-sm italic text-muted">{species.scientific_name}</p>
            {species.local_names ? <p className="mt-1 text-sm text-ink-soft">Nama daerah: {species.local_names}</p> : null}
            <p className="mt-2 text-xs text-muted">{[species.taxon_class, species.taxon_order, species.taxon_family].filter(Boolean).join(" › ")}</p>
          </div>

          {facts.length ? (
            <dl className="grid grid-cols-2 gap-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-line bg-surface p-3">
                  <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted"><Icon className="size-3.5 text-primary" />{label}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-5 text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {hotspots.length ? (
            <section className="ui-panel p-4">
              <h2 className="mb-2 text-sm font-bold text-ink">Kenali ciri di model</h2>
              <ol className="flex flex-col gap-1">
                {hotspots.map((hotspot, index) => (
                  <li key={`${hotspot.position}-${index}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setActive(index);
                        viewerRef.current?.focusHotspot(index);
                      }}
                      className={cn("flex w-full gap-3 rounded-xl p-2 text-left transition", active === index ? "bg-primary-soft" : "hover:bg-surface-muted")}
                    >
                      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", active === index ? "bg-[#e0662d]" : "bg-primary")}>{index + 1}</span>
                      <span>
                        <span className="block text-sm font-semibold text-ink">{hotspot.label}</span>
                        {hotspot.description ? <span className="block text-xs leading-5 text-muted">{hotspot.description}</span> : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <button type="button" onClick={() => { setActive(null); viewerRef.current?.reset(); }} className="mt-2 text-xs font-semibold text-primary hover:underline">
                Lihat seluruh tubuh
              </button>
            </section>
          ) : null}

          {species.legal_protection ? (
            <p className="flex items-start gap-2 rounded-2xl bg-primary-soft/60 p-3 text-sm text-ink-soft">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              <span><b className="text-ink">Status perlindungan:</b> {species.legal_protection}</span>
            </p>
          ) : null}
        </aside>
      </div>

      {species.description ? <p className="max-w-4xl text-base leading-8 text-ink-soft">{species.description}</p> : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Ciri-ciri fisik" icon={<Ruler className="size-4 text-primary" />}><Bullets items={species.characteristics} /></Section>
        <Section title="Perilaku & kebiasaan" icon={<Sun className="size-4 text-primary" />}>{species.behavior ?? "Belum ada data."}</Section>
        <Section title="Makanan" icon={<Leaf className="size-4 text-primary" />}>{species.diet ?? "Belum ada data."}</Section>
        <Section title="Habitat & sebaran" icon={<Home className="size-4 text-primary" />}>
          <p>{species.habitat ?? "Belum ada data."}</p>
          {species.distribution ? <p className="mt-2"><b className="text-ink">Sebaran:</b> {species.distribution}</p> : null}
        </Section>
        <Section title="Ancaman" icon={<AlertTriangle className="size-4 text-primary" />}><Bullets items={species.threats} /></Section>
        <Section title="Fakta menarik" icon={<Sparkles className="size-4 text-primary" />}><Bullets items={species.fun_facts} /></Section>
      </div>

      {canManage ? (
        <ManagePanel
          species={species}
          hotspots={hotspots}
          onHotspotsChange={setDraftHotspots}
          picking={picking}
          onPickingChange={(value, handler) => {
            setPicking(value);
            setPickHandler(() => handler ?? null);
            // Panel kelola ada di bawah; bawa model ke layar agar bisa diklik.
            if (value) document.getElementById("species-viewer")?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        />
      ) : null}
    </div>
  );
}
