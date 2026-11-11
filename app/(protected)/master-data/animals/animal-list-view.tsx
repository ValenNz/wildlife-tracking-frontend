
"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PawPrint, Radio, Trees, SlidersHorizontal } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import {
  DataFilters,
  type FilterField,
  type FilterValues,
} from "@/components/ui/data-filters";

import { useAnimals } from "@/hooks/animal.hook";
import { useSpecies } from "@/hooks/species.hook";
import { useGpsReadings } from "@/hooks/gps-reading.hook";

import type { TYPE_ANIMAL } from "@/types/animal.type";

type AnimalFilterValues = FilterValues & {
  search: string;
  species_id: string;
  status: string;
};

const INITIAL_FILTERS: AnimalFilterValues = {
  search: "",
  species_id: "all",
  status: "all",
};

type AnimalRow = TYPE_ANIMAL;

export default function AnimalListView() {
  const [filters, setFilters] =
    useState<AnimalFilterValues>(INITIAL_FILTERS);

  const animalQuery = useAnimals();
  const speciesQuery = useSpecies();
  const gpsQuery = useGpsReadings();

  const animals = animalQuery.data?.data?.items ?? [];
  const speciesList = speciesQuery.data?.data?.items ?? [];
  const gpsReadings = gpsQuery.data?.data ?? [];

  const isLoading =
    animalQuery.isLoading ||
    speciesQuery.isLoading ||
    gpsQuery.isLoading;

  const latestGpsByDevice = useMemo(() => {
  const gpsMap = new Map<number, (typeof gpsReadings)[number]>();

  const sortedReadings = [...gpsReadings].sort(
    (a, b) =>
      new Date(b.recorded_at).getTime() -
      new Date(a.recorded_at).getTime(),
  );

  sortedReadings.forEach((reading) => {
    if (!gpsMap.has(Number(reading.device_id))) {
      gpsMap.set(Number(reading.device_id), reading);
    }
  });

  return gpsMap;
}, [gpsReadings]);

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
          ...speciesList.map((species) => ({
            label: species.common_name,
            value: String(species.species_id),
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
    [speciesList],
  );

  const filteredAnimals = useMemo(() => {
    const search = filters.search.toLowerCase().trim();

    return animals.filter((animal) => {
      const matchesSearch =
        !search ||
        animal.animal_code.toLowerCase().includes(search) ||
        String(animal.animal_id).includes(search) ||
        (animal.species?.common_name.toLowerCase().includes(search) ?? false) ||
        (animal.tracking_device?.model.toLowerCase().includes(search) ?? false);

      const matchesSpecies =
        filters.species_id === "all" ||
        animal.species_id === Number(filters.species_id);

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active"
          ? animal.is_active
          : !animal.is_active);

      return matchesSearch && matchesSpecies && matchesStatus;
    });
  }, [animals, filters]);

  const columns = useMemo<ColumnDef<AnimalRow>[]>(
    () => [
      {
        accessorKey: "animal_code",
        header: "Kode Satwa",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-zinc-900">
              {row.original.animal_code}
            </p>
            <p className="text-xs text-zinc-500">
              #{row.original.animal_id}
            </p>
          </div>
        ),
      },
      {
        id: "species",
        header: "Spesies",
        accessorFn: (animal) => animal.species?.common_name ?? "",
        cell: ({ row }) => (
          row.original.species ? (
            <div>
              <p className="font-medium text-zinc-800">
                {row.original.species.common_name}
              </p>
              <p className="text-xs italic text-zinc-500">
                {row.original.species.scientific_name}
              </p>
            </div>
          ) : (
            <span className="text-xs text-zinc-400">
              Spesies #{row.original.species_id}
            </span>
          )
        ),
      },
      {
        id: "device",
        header: "Perangkat GPS",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-700">
            {row.original.tracking_device?.model ?? "-"}
          </span>
        ),
      },
      {
        accessorKey: "gender",
        header: "Jenis Kelamin",
        cell: ({ row }) => {
          const gender = row.original.gender;

          return (
            <span className="text-sm font-semibold text-zinc-700">
              {gender === "Jantan"
                ? "♂"
                : gender === "Betina"
                  ? "♀"
                  : "?"}
            </span>
          );
        },
      },
      {
        accessorKey: "birth_date",
        header: "Tanggal Lahir",
        cell: ({ row }) => {
          const birthDate = row.original.birth_date;

          return birthDate ? (
            <span className="text-sm text-zinc-700">
              {new Date(birthDate).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          ) : (
            <span className="text-zinc-400">-</span>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.is_active;

          return (
            <span
              className={
                isActive
                  ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                  : "inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
              }
            >
              {isActive ? "Terpantau" : "Tidak Terpantau"}
            </span>
          );
        },
      },
      {
        id: "coordinates",
        header: "Koordinat",
        cell: ({ row }) => {
          const deviceId = row.original.tracking_device?.device_id;

          const reading = deviceId
            ? latestGpsByDevice.get(Number(deviceId))
            : undefined;

          return reading ? (
            <div className="text-sm text-zinc-700">
              <p>Lat: {Number(reading.latitude).toFixed(6)}</p>
              <p>Long: {Number(reading.longitude).toFixed(6)}</p>
            </div>
          ) : (
            <span className="text-zinc-400">-</span>
          );
        },
      },
      {
        id: "recordedAt",
        header: "Waktu Pencatatan",
        cell: ({ row }) => {
          const deviceId = row.original.tracking_device?.device_id;

          const reading = deviceId
            ? latestGpsByDevice.get(Number(deviceId))
            : undefined;

          const recordedAt = reading?.recorded_at;

          return recordedAt ? (
            <span className="text-sm text-zinc-700">
              {new Date(recordedAt).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          ) : (
            <span className="text-zinc-400">-</span>
          );
        },
      },
    ],
    [latestGpsByDevice],
  );

  const activeCount = animals.filter(
    (animal) => animal.is_active,
  ).length;

  if (
    animalQuery.isError ||
    speciesQuery.isError ||
    gpsQuery.isError
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Gagal mengambil data satwa atau spesies dari API.
        <button
          type="button"
          onClick={() => {
            animalQuery.refetch();
            speciesQuery.refetch();
          }}
          className="ml-2 font-semibold underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

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
        <div className="group rounded-2xl border border-[#DDE8DE] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Total Satwa
              </p>

              <p className="mt-3 text-3xl font-bold text-[#174C35]">
                {isLoading ? "..." : animals.length}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Seluruh individu terdaftar
              </p>
            </div>

            <div className="rounded-2xl bg-[#EAF4EC] p-3.5 text-[#286747]">
              <PawPrint size={25} />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-[#DDE8DE] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Satwa Terpantau
              </p>

              <p className="mt-3 text-3xl font-bold text-[#174C35]">
                {isLoading ? "..." : activeCount}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Status aktif menurut data satwa
              </p>
            </div>

            <div className="rounded-2xl bg-[#EAF4EC] p-3.5 text-[#286747]">
              <Radio size={25} />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-[#DDE8DE] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Total Spesies
              </p>

              <p className="mt-3 text-3xl font-bold text-[#174C35]">
                {speciesQuery.isLoading ? "..." : speciesList.length}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Jenis spesies terdaftar
              </p>
            </div>

            <div className="rounded-2xl bg-[#EAF4EC] p-3.5 text-[#286747]">
              <Trees size={25} />
            </div>
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
                Temukan data berdasarkan nama, kode, spesies, atau status.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <DataFilters
            fields={filterFields}
            values={filters}
            onFilterChange={(values) =>
              setFilters((previous) => ({
                ...previous,
                ...values,
              }))
            }
            onReset={() => setFilters({ ...INITIAL_FILTERS })}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#DDE8DE] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#E7EEE7] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-[#174C35]">
              Daftar Individu Satwa
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Menampilkan {filteredAnimals.length} dari {animals.length} data satwa.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D8E8DA] bg-[#F0F7F0] px-3 py-1.5 text-xs font-medium text-[#286747]">
            <span className="h-2 w-2 rounded-full bg-[#43845A]" />
            Data API
          </div>
        </div>

        <div className="p-0">
          <DataTable
            data={filteredAnimals}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => String(row.animal_id)}
            label="daftar satwa"
            emptyTitle="Belum ada satwa"
            emptyDescription="Tidak ada satwa yang cocok dengan filter saat ini."
          />
        </div>
      </section>
    </div>
  );
}
