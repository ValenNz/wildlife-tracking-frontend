"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSpeciesById } from "@/hooks/species.hook";
import { useAnimal } from "@/hooks/animal.hook";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { toApiErrorState } from "@/services/api-client";
import type { BadgeVariant } from "@/components/ui/status-badge";
import type { TYPE_CONSERVATION_STATUS } from "@/types/species.type";

type SpeciesDetailViewProps = {
  speciesId: number;
};

const CONSERVATION_VARIANT: Record<TYPE_CONSERVATION_STATUS, BadgeVariant> = {
  "Critically Endangered": "danger",
  Endangered: "warning",
  Vulnerable: "info",
};

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
    <dd className="mt-0.5 text-sm text-zinc-900">{value}</dd>
  </div>
);

export function SpeciesDetailView({ speciesId }: SpeciesDetailViewProps) {
  const speciesQuery = useSpeciesById(speciesId);

  const animalsParams = useMemo(
    () => ({ page: 1, per_page: 100, species_id: speciesId }),
    [speciesId],
  );

  const animals = useAnimal(animalsParams);

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

  if (record === undefined) {
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
            href="/master-data/species"
            className="text-xs font-medium text-zinc-500 underline-offset-2 hover:underline"
          >
            Kembali ke daftar
          </Link>
          <h2 className="text-2xl font-semibold text-zinc-900">
            {record.common_name}
          </h2>
          <p className="text-sm italic text-zinc-600">{record.scientific_name}</p>
        </div>

        <StatusBadge
          label={record.conservation_status}
          variant={CONSERVATION_VARIANT[record.conservation_status]}
        />
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <dl className="grid grid-cols-2 gap-5 lg:grid-cols-3">
          <DetailField label="Nama Umum" value={record.common_name} />
          <DetailField label="Nama Ilmiah" value={record.scientific_name} />
          <DetailField
            label="Status Konservasi"
            value={record.conservation_status}
          />
        </dl>
      </section>

      <section aria-label="Satwa terkait" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Satwa dari Spesies Ini
          </h3>
          <StatCard label="Jumlah" value={String(relatedAnimals.length)} />
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
          <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {relatedAnimals.map((animal) => (
              <li key={animal.animal_id}>
                <Link
                  href={`/master-data/animals/${animal.animal_id}/detail`}
                  className="flex items-center justify-between gap-2 px-4 py-3 text-sm transition hover:bg-zinc-50"
                >
                  <span className="font-medium text-zinc-900">
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