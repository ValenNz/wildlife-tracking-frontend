"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import {
  DataFilters,
  type FilterField,
  type FilterValues,
} from "@/components/ui/data-filters";
import {
  PawPrint,
  Radio,
  Trees,
  SlidersHorizontal,
} from "lucide-react";

import { DUMMY_ANIMALS } from "@/constant/animal/animal";
import { DUMMY_SPECIES } from "@/constant/species/species";

type DummyAnimal = (typeof DUMMY_ANIMALS)[number];

const INITIAL_FILTERS: FilterValues = {
  search: "",
  species_id: "all",
  status: "all",
};

export default function AnimalListView() {
  const [filters, setFilters] = useState<FilterValues>(INITIAL_FILTERS);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        key: "search",
        kind: "search",
        label: "Cari Satwa",
        placeholder: "Cari nama, kode, atau perangkat GPS...",
      },
      {
        key: "species_id",
        kind: "select",
        label: "Spesies",
        options: [
          { label: "Semua Spesies", value: "all" },
          ...DUMMY_SPECIES.map((species) => ({
            label: species.name,
            value: species.id,
          })),
        ],
      },
      {
        key: "status",
        kind: "select",
        label: "Status",
        options: [
          { label: "Semua Status", value: "all" },
          { label: "Terpantau", value: "active" },
          { label: "Tidak Terpantau", value: "inactive" },
        ],
      },
    ],
    [],
  );

  const filteredAnimals = useMemo(() => {
    const search = (filters.search ?? "").toLowerCase().trim();

    return DUMMY_ANIMALS.filter((animal) => {
      const species = DUMMY_SPECIES.find(
        (item) => item.id === animal.speciesId,
      );

      const matchesSearch =
        !search ||
        animal.id.toLowerCase().includes(search) ||
        animal.name.toLowerCase().includes(search) ||
        animal.deviceId.toLowerCase().includes(search) ||
        (species?.name.toLowerCase().includes(search) ?? false);

      const matchesSpecies =
        !filters.species_id ||
        filters.species_id === "all" ||
        animal.speciesId === filters.species_id;

      const matchesStatus =
        !filters.status ||
        filters.status === "all" ||
        (filters.status === "active"
          ? animal.status === "Terpantau"
          : animal.status !== "Terpantau");

      return matchesSearch && matchesSpecies && matchesStatus;
    });
  }, [filters]);

  const columns = useMemo<ColumnDef<DummyAnimal>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Kode Satwa",
        cell: ({ row }) => (
          <span className="font-medium text-zinc-900">
            {row.original.id}
          </span>
        ),
      },
      {
        id: "species",
        header: "Spesies",
        accessorFn: (animal) =>
          DUMMY_SPECIES.find((item) => item.id === animal.speciesId)?.name ??
          animal.name,
        cell: ({ row }) => {
          const species = DUMMY_SPECIES.find(
            (item) => item.id === row.original.speciesId,
          );

          return (
            <div>
              <p className="font-medium text-zinc-800">
                {species?.name ?? row.original.name}
              </p>
              {species?.scientificName && (
                <p className="text-xs italic text-zinc-500">
                  {species.scientificName}
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "deviceId",
        header: "Perangkat GPS",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const isTracked = row.original.status === "Terpantau";

          return (
            <span
              className={
                isTracked
                  ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                  : "inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
              }
            >
              {row.original.status}
            </span>
          );
        },
      },
      {
        id: "coordinates",
        header: "Koordinat",
        cell: ({ row }) =>
          `${row.original.latitude.toFixed(4)}, ${row.original.longitude.toFixed(4)}`,
      },
      {
        accessorKey: "recordedAt",
        header: "Waktu Pencatatan",
        cell: ({ row }) =>
          new Date(row.original.recordedAt).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
      },
    ],
    [],
  );

  return (
    <div className="min-h-full space-y-6 bg-[#F7F9F6] p-1">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#E5F0E7] p-2 text-[#174C35]">
            <Trees size={22} />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#174C35]">
            Data Satwa
          </h2>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-zinc-600">
          Pantau individu satwa, informasi spesies, dan aktivitas pelacakan
          di Taman Nasional Gunung Leuser.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="group rounded-2xl border border-[#DDE8DE] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#A8C8AE] hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Total Satwa
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#174C35]">
                {DUMMY_ANIMALS.length}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Seluruh individu terdaftar
              </p>
            </div>

            <div className="rounded-2xl bg-[#EAF4EC] p-3.5 text-[#286747] transition-colors group-hover:bg-[#DCEFE0]">
              <PawPrint size={25} />
            </div>
          </div>

          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-[#EAF4EC]">
            <div className="h-full w-full rounded-full bg-[#43845A]" />
          </div>
        </div>

        <div className="group rounded-2xl border border-[#DDE8DE] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#A8C8AE] hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Satwa Terpantau
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#174C35]">
                {
                  DUMMY_ANIMALS.filter(
                    (animal) => animal.status === "Terpantau"
                  ).length
                }
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Status pelacakan aktif
              </p>
            </div>

            <div className="rounded-2xl bg-[#EAF4EC] p-3.5 text-[#286747] transition-colors group-hover:bg-[#DCEFE0]">
              <Radio size={25} />
            </div>
          </div>

          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-[#EAF4EC]">
            <div className="h-full w-full rounded-full bg-[#43845A]" />
          </div>
        </div>

        <div className="group rounded-2xl border border-[#DDE8DE] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#A8C8AE] hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Total Spesies
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#174C35]">
                {DUMMY_SPECIES.length}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Jenis spesies terdaftar
              </p>
            </div>

            <div className="rounded-2xl bg-[#EAF4EC] p-3.5 text-[#286747] transition-colors group-hover:bg-[#DCEFE0]">
              <Trees size={25} />
            </div>
          </div>

          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-[#EAF4EC]">
            <div className="h-full w-full rounded-full bg-[#43845A]" />
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#DDE8DE] bg-white shadow-sm">
        <div className="border-b border-[#E7EEE7] bg-[#F4F8F3] px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[#E1EDE2] p-2 text-[#286747]">
              <SlidersHorizontal size={20} />
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#174C35]">
                Cari dan Filter Satwa
              </h3>
              <p className="mt-1 text-sm leading-5 text-zinc-600">
                Temukan data berdasarkan nama, kode, perangkat GPS, spesies,
                atau status pelacakan.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <DataFilters
            fields={filterFields}
            values={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({ ...INITIAL_FILTERS })}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#DDE8DE] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#E7EEE7] bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-[#174C35]">
              Daftar Individu Satwa
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Menampilkan {filteredAnimals.length} dari{" "}
              {DUMMY_ANIMALS.length} data satwa.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D8E8DA] bg-[#F0F7F0] px-3 py-1.5 text-xs font-medium text-[#286747]">
            <span className="h-2 w-2 rounded-full bg-[#43845A]" />
            Data satwa
          </div>
        </div>

        <div className="p-0">
          <DataTable
            data={filteredAnimals}
            columns={columns}
            loading={false}
            getRowId={(row) => row.id}
            label="daftar satwa"
            emptyTitle="Belum ada satwa"
            emptyDescription="Tidak ada satwa yang cocok dengan filter saat ini."
          />
        </div>
      </section>
    </div>
  );
}
