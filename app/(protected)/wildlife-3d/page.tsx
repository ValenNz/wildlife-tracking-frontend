"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Box, Search } from "lucide-react";

import { TextInput } from "@/components/form";
import { EmptyState, ErrorState, Loading, PageHeader } from "@/components/ui";
import { IucnBadge, SpeciesViewer } from "@/components/wildlife";
import { useDebounce } from "@/hooks/use-debounce";
import { useSpeciesModelUrl, useWildlifeSpecies } from "@/hooks/use-wildlife";
import { cn } from "@/lib/utils";
import { toApiErrorState } from "@/services/api";
import type { TYPE_SPECIES_PROFILE } from "@/types/wildlife.type";

const CLASSES = [
  { value: "", label: "Semua" },
  { value: "Mammalia", label: "Mamalia" },
  { value: "Aves", label: "Burung" },
  { value: "Reptilia", label: "Reptil" },
  { value: "Amphibia", label: "Amfibi" },
];

function SpeciesCard({ species }: { species: TYPE_SPECIES_PROFILE }) {
  const model = useSpeciesModelUrl(species.species_id, species.has_model, species.model_credit ?? "");
  return (
    <Link
      href={`/wildlife-3d/${species.species_id}/detail`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card"
    >
      {species.has_model ? (
        <SpeciesViewer src={model.url} alt={`Model 3D ${species.common_name}`} hotspots={[]} compact className="pointer-events-none h-48" />
      ) : (
        <div className="flex h-48 items-center justify-center bg-surface-muted text-sm text-muted">
          <Box className="mr-2 size-4" /> Model 3D belum tersedia
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-ink group-hover:text-primary">{species.common_name}</p>
            <p className="text-xs italic text-muted">{species.scientific_name}</p>
          </div>
          <IucnBadge status={species.conservation_status} />
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-ink-soft">{species.description}</p>
        <p className="mt-auto text-xs text-muted">
          {[species.taxon_class, species.taxon_family].filter(Boolean).join(" · ")}
          {species.has_model ? " · 3D" : ""}
        </p>
      </div>
    </Link>
  );
}

export default function WildlifeEncyclopediaPage() {
  const [search, setSearch] = useState("");
  const [taxonClass, setTaxonClass] = useState("");
  const debounced = useDebounce(search, 350);
  const params = useMemo(() => ({ search: debounced.trim() || undefined, taxon_class: taxonClass || undefined }), [debounced, taxonClass]);
  const speciesQuery = useWildlifeSpecies(params);
  const species = speciesQuery.data ?? [];

  if (speciesQuery.error) {
    const error = toApiErrorState(speciesQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void speciesQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Ensiklopedia"
        title="Satwa Leuser dalam 3D"
        description="Putar dan perbesar model 3D satwa, lalu pelajari ciri, perilaku, makanan, habitat, dan status konservasinya. Lokasi individu satwa sengaja tidak ditampilkan demi keamanan dari perburuan."
      />
      <section className="ui-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <TextInput aria-label="Cari satwa" placeholder="Cari nama, nama ilmiah, atau nama daerah…" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Kelompok satwa">
          {CLASSES.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={taxonClass === item.value}
              onClick={() => setTaxonClass(item.value)}
              className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold", taxonClass === item.value ? "bg-primary text-white" : "border border-line text-ink-soft hover:border-primary")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
      {speciesQuery.isLoading ? (
        <Loading label="Memuat satwa…" />
      ) : species.length === 0 ? (
        <EmptyState title="Satwa tidak ditemukan" description="Coba kata kunci lain." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {species.map((item) => (
            <SpeciesCard key={item.species_id} species={item} />
          ))}
        </div>
      )}
    </div>
  );
}
