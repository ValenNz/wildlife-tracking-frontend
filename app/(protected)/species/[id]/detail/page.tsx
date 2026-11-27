"use client";

import Link from "next/link";
import { useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import { useSpeciesById } from "@/hooks/use-species";
import { useAnimals } from "@/hooks/use-animals";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/status";
import { toApiErrorState } from "@/services/api";
import type { BadgeVariant } from "@/components/status";
import type { TYPE_CONSERVATION_STATUS } from "@/types/species.type";
import { TYPE_CONSERVATION_STATUS_LABELS } from "@/types/species.type";
import type { TYPE_ANIMAL } from "@/types/animal.type";

const CONSERVATION_VARIANT: Record<TYPE_CONSERVATION_STATUS, BadgeVariant> = {
  "Least Concern": "success",
  "Near Threatened": "info",
  Vulnerable: "info",
  Endangered: "warning",
  "Critically Endangered": "danger",
  "Extinct in the Wild": "danger",
  Extinct: "neutral",
  "Data Deficient": "neutral",
};

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
    <dd className="mt-0.5 text-sm text-ink">{value}</dd>
  </div>
);

export default function SpeciesDetailPage() {
  const params = useParams<{ id: string }>();
  const rawId = params.id;
  const speciesId = typeof rawId === "string" ? Number(rawId) : Number.NaN;

  if (!Number.isInteger(speciesId) || speciesId <= 0) notFound();

  const speciesQuery = useSpeciesById(speciesId);

  const animalsParams = useMemo(
    () => ({ species_id: speciesId }),
    [speciesId],
  );

  const animals = useAnimals(animalsParams);

  if (speciesQuery.isPending) {
    return <Loading label="Memuat detail spesies..." />;
  }

  if (speciesQuery.isError) {
    const error = toApiErrorState(speciesQuery.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void speciesQuery.refetch()}
      />
    );
  }

  const record = speciesQuery.data?.data.items;

  if (record === undefined || record === null) {
    return (
      <EmptyState
        title={`Spesies dengan ID ${speciesId} tidak ditemukan`}
        description="Data tidak tersedia di backend."
      />
    );
  }

  const relatedAnimals = animals.data?.data.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/species"
            className="text-xs font-medium text-muted underline-offset-2 hover:underline"
          >
            Kembali ke daftar
          </Link>
          <h2 className="text-2xl font-semibold text-ink">
            {record.common_name}
          </h2>
          <p className="text-sm italic text-ink-soft">{record.scientific_name}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge
            label={TYPE_CONSERVATION_STATUS_LABELS[record.conservation_status]}
            variant={CONSERVATION_VARIANT[record.conservation_status]}
          />
          <Link
            href={`/species/${speciesId}/model`}
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            Profil &amp; model 3D
          </Link>
        </div>
      </div>

      <section className="ui-panel p-5">
        <dl className="grid grid-cols-2 gap-5 lg:grid-cols-3">
          <DetailField label="Nama Umum" value={record.common_name} />
          <DetailField label="Nama Ilmiah" value={record.scientific_name} />
          <DetailField
            label="Status Konservasi"
            value={TYPE_CONSERVATION_STATUS_LABELS[record.conservation_status]}
          />
        </dl>
      </section>

      <section aria-label="Satwa terkait" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Satwa dari Spesies Ini
          </h3>
          <StatCard
            label="Jumlah"
            value={String(record.animal_count ?? relatedAnimals.length)}
          />
        </div>

        {animals.isError ? (
          <ErrorState
            {...toApiErrorState(animals.error)}
            onRetry={() => void animals.refetch()}
          />
        ) : animals.isPending ? (
          <Loading label="Memuat satwa terkait..." className="min-h-40" />
        ) : relatedAnimals.length === 0 ? (
          <EmptyState
            title="Belum ada satwa tercatat"
            description="Tidak ada individu yang tercatat untuk spesies ini."
          />
        ) : (
          <ul className="divide-y divide-line overflow-hidden ui-panel">
            {relatedAnimals.map((animal: TYPE_ANIMAL) => (
              <li key={animal.animal_id}>
                <Link
                  href={`/animals/${animal.animal_id}/detail`}
                  className="flex items-center justify-between gap-2 px-4 py-3 text-sm transition hover:bg-natural-muted/30"
                >
                  <span className="font-medium text-ink">
                    {animal.animal_code}
                  </span>
                  <StatusBadge
                    label={animal.is_active ? "Aktif" : "Tidak Aktif"}
                    variant={animal.is_active ? "success" : "danger"}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
