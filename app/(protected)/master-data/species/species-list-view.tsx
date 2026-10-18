"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { DataFilters } from "@/components/ui/data-filters";
import { ErrorState } from "@/components/ui/error-state";
import { getSpeciesColumns } from "@/app/(protected)/master-data/species/columns";
import {
  CONSERVATION_OPTIONS,
  DEFAULT_SPECIES_FILTERS,
} from "@/app/(protected)/master-data/species/filter";
import { useSpecies } from "@/hooks/useSpecies";
import { toApiErrorState } from "@/services/api-client";
import type { TYPE_CONSERVATION_STATUS, TYPE_SPECIES } from "@/types/wildlife/species.type";

export function SpeciesListView() {
  const router = useRouter();
  const [filters, setFilters] = useState(DEFAULT_SPECIES_FILTERS);

  const params = useMemo(
    () => ({
      page: 1,
      per_page: 25,
      search: filters.search,
      conservation_status:
        filters.conservation_status === "all"
          ? undefined
          : (filters.conservation_status as TYPE_CONSERVATION_STATUS),
    }),
    [filters.search, filters.conservation_status],
  );

  const query = useSpecies(params);
  const columns = useMemo(() => getSpeciesColumns(), []);

  const handleRowClick = useCallback(
    (row: TYPE_SPECIES) => {
      router.push(`/master-data/species/${row.species_id}/detail`);
    },
    [router],
  );

  if (query.isPending) {
    return <DataTable data={[]} columns={columns} loading label="daftar spesies" />;
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
        <h2 className="text-lg font-semibold text-zinc-900">Spesies</h2>
        <p className="text-sm text-zinc-600">
          Spesies endemik Taman Nasional Gunung Leuser beserta status konservasinya.
        </p>
      </div>

      <DataFilters
        fields={[
          {
            key: "search",
            kind: "search",
            label: "Cari",
            placeholder: "Nama umum atau ilmiah",
          },
          {
            key: "conservation_status",
            kind: "select",
            label: "Status Konservasi",
            options: CONSERVATION_OPTIONS,
          },
        ]}
        values={filters}
        onFilterChange={(values) => setFilters({ ...DEFAULT_SPECIES_FILTERS, ...values })}
        onReset={() => setFilters(DEFAULT_SPECIES_FILTERS)}
      />

      <DataTable
        data={items}
        columns={columns}
        loading={query.isFetching}
        onRowClick={handleRowClick}
        getRowId={(row) => String(row.species_id)}
        label="daftar spesies"
        emptyTitle="Belum ada spesies"
        emptyDescription="Tidak ada spesies yang cocok dengan filter saat ini."
      />
    </div>
  );
}