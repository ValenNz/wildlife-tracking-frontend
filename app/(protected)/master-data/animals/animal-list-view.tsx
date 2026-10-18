"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { DataFilters } from "@/components/ui/data-filters";
import { ErrorState } from "@/components/ui/error-state";
import { getAnimalColumns } from "@/app/(protected)/master-data/animals/columns";
import {
  DEFAULT_ANIMAL_FILTERS,
  STATUS_OPTIONS,
  toSpeciesId,
} from "@/app/(protected)/master-data/animals/filter";
import { useAnimals } from "@/hooks/useAnimals";
import { toApiErrorState } from "@/services/api-client";
import type { TYPE_ANIMAL } from "@/types/wildlife/animal.type";

export function AnimalListView() {
  const router = useRouter();
  const [filters, setFilters] = useState(DEFAULT_ANIMAL_FILTERS);

  const params = useMemo(
    () => ({
      page: 1,
      per_page: 25,
      search: filters.search,
      species_id: toSpeciesId(filters.species_id),
      is_active:
        filters.status === "all" ? undefined : filters.status === "active",
    }),
    [filters.search, filters.species_id, filters.status],
  );

  const query = useAnimals(params);

  const speciesOptions = useMemo(
    () => [
      { label: "Semua spesies", value: "all" },
      ...(query.data?.data.items ?? []).map((animal) => ({
        label: animal.species_name ?? `Spesies #${animal.species_id}`,
        value: String(animal.species_id),
      })),
    ],
    [query.data],
  );

  const columns = useMemo(() => getAnimalColumns(), []);

  const handleRowClick = useCallback(
    (row: TYPE_ANIMAL) => {
      router.push(`/master-data/animals/${row.animal_id}/detail`);
    },
    [router],
  );

  if (query.isPending) {
    return <DataTable data={[]} columns={columns} loading label="daftar satwa" />;
  }

  if (query.isError) {
    const error = toApiErrorState(query.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const items = query.data?.data.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Satwa Terpantau</h2>
        <p className="text-sm text-zinc-600">
          Data individu satwa yang dilacak di Taman Nasional Gunung Leuser.
        </p>
      </div>

      <DataFilters
        fields={[
          {
            key: "search",
            kind: "search",
            label: "Cari",
            placeholder: "Kode satwa atau spesies",
          },
          {
            key: "species_id",
            kind: "select",
            label: "Spesies",
            options: speciesOptions,
          },
          { key: "status", kind: "select", label: "Status", options: STATUS_OPTIONS },
        ]}
        values={filters}
        onFilterChange={(values) => setFilters({ ...DEFAULT_ANIMAL_FILTERS, ...values })}
        onReset={() => setFilters(DEFAULT_ANIMAL_FILTERS)}
      />

      <DataTable
        data={items}
        columns={columns}
        loading={query.isFetching}
        onRowClick={handleRowClick}
        getRowId={(row) => String(row.animal_id)}
        label="daftar satwa"
        emptyTitle="Belum ada satwa"
        emptyDescription="Tidak ada satwa yang cocok dengan filter saat ini."
      />
    </div>
  );
}