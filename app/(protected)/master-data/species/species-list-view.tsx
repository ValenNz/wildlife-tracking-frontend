
"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, SlidersHorizontal } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { DataFilters } from "@/components/ui/data-filters";
import { ErrorState } from "@/components/ui/error-state";
import { getSpeciesColumns } from "@/app/(protected)/master-data/species/columns";
import {
  CONSERVATION_OPTIONS,
  DEFAULT_SPECIES_FILTERS,
} from "@/app/(protected)/master-data/species/filter";
import { useSpecies } from "@/hooks/species.hook";
import { toApiErrorState } from "@/services/api-client";
import type {
  TYPE_CONSERVATION_STATUS,
  TYPE_SPECIES,
} from "@/types/species.type";

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
    return (
      <DataTable
        data={[]}
        columns={columns}
        loading
        label="daftar spesies"
      />
    );
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

  const items = query.data?.data?.items ?? [];

  return (
    <div className="min-h-full space-y-6 bg-[#F7F9F6] p-1">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#E5F0E7] p-2 text-[#174C35]">
            <Leaf size={22} />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#174C35]">
            Data Spesies
          </h2>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-zinc-600">
          Kelola informasi spesies satwa endemik Taman Nasional Gunung
          Leuser beserta status konservasinya.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#DDE8DE] bg-white shadow-sm">
        <div className="border-b border-[#E7EEE7] bg-[#F4F8F3] px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[#E1EDE2] p-2 text-[#286747]">
              <SlidersHorizontal size={20} />
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#174C35]">
                Cari dan Filter Spesies
              </h3>
              <p className="mt-1 text-sm leading-5 text-zinc-600">
                Cari berdasarkan nama umum, nama ilmiah, atau status konservasi.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <DataFilters
            fields={[
              {
                key: "search",
                kind: "search",
                label: "Cari Spesies",
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
            onFilterChange={(values) =>
              setFilters({ ...DEFAULT_SPECIES_FILTERS, ...values })
            }
            onReset={() => setFilters(DEFAULT_SPECIES_FILTERS)}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#DDE8DE] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#E7EEE7] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-[#174C35]">
              Daftar Spesies
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Menampilkan {items.length} spesies pada halaman ini.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D8E8DA] bg-[#F0F7F0] px-3 py-1.5 text-xs font-medium text-[#286747]">
            <span className="h-2 w-2 rounded-full bg-[#43845A]" />
            Data spesies
          </div>
        </div>

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
      </section>
    </div>
  );
}