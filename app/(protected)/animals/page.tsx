"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  PawPrint,
  Radio,
  Trees,
  SlidersHorizontal,
  Plus,
} from "lucide-react";

import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { DataFilters } from "@/components/filter";

import {
  useAnimals,
  useAnimalDelete,
} from "@/hooks/use-animals";
import { useSpecies } from "@/hooks/use-species";
import { useGpsReadings } from "@/hooks/use-tracking";
import { useToast } from "@/components/toast";
import { formatApiError, toApiErrorState } from "@/services/api";

import {
  getAnimalColumns,
  type AnimalGpsReading,
} from "./column";
import {
  ANIMAL_INITIAL_FILTERS,
  getAnimalFilterFields,
  type AnimalFilterValues,
} from "./filter";

import type { TYPE_ANIMAL } from "@/types/animal.type";

export default function AnimalListPage() {
  const router = useRouter();
  const [filters, setFilters] =
    useState<AnimalFilterValues>(ANIMAL_INITIAL_FILTERS);

  const [selectedDeleteAnimal, setSelectedDeleteAnimal] =
    useState<TYPE_ANIMAL | null>(null);

  const { showToast } = useToast();

  const animalQuery = useAnimals();
  const speciesQuery = useSpecies();
  const gpsQuery = useGpsReadings();

  const deleteAnimalMutation = useAnimalDelete(
    selectedDeleteAnimal?.animal_id ?? 0,
  );


  const animals = useMemo(() => animalQuery.data?.data?.items ?? [], [animalQuery.data]);
  const speciesList = useMemo(() => speciesQuery.data?.data?.items ?? [], [speciesQuery.data]);
  const gpsReadings = useMemo(() => gpsQuery.data?.data ?? [], [gpsQuery.data]);

  const isLoading =
    animalQuery.isLoading ||
    speciesQuery.isLoading ||
    gpsQuery.isLoading;

  const closeDeleteDialog = () => {
    if (deleteAnimalMutation.isPending) return;

    setSelectedDeleteAnimal(null);
    deleteAnimalMutation.reset();
  };

  const handleDeleteAnimal = () => {
    if (!selectedDeleteAnimal) return;

    deleteAnimalMutation.mutate(undefined, {
      onSuccess: () => {
        showToast("Satwa berhasil dihapus.", "success");
        setSelectedDeleteAnimal(null);
      },
      onError: (error) => {
        showToast(
          formatApiError(error, "Gagal menghapus satwa. Silakan coba lagi."),
          "error",
        );
      },
    });
  };

  const latestGpsByDevice = useMemo(() => {
    const gpsMap = new Map<number, AnimalGpsReading>();

    const sortedReadings = [...gpsReadings].sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() -
        new Date(a.recorded_at).getTime(),
    );

    sortedReadings.forEach((reading) => {
      const deviceId = Number(reading.device_id);

      if (!gpsMap.has(deviceId)) {
        gpsMap.set(deviceId, reading);
      }
    });

    return gpsMap;
  }, [gpsReadings]);

  const filterFields = useMemo(
    () => getAnimalFilterFields(speciesList),
    [speciesList],
  );

  const filteredAnimals = useMemo(() => {
    const search = filters.search.toLowerCase().trim();

    return animals.filter((animal) => {
      const matchesSearch =
        !search ||
        animal.animal_code.toLowerCase().includes(search) ||
        String(animal.animal_id).includes(search) ||
        (animal.species?.common_name
          .toLowerCase()
          .includes(search) ?? false) ||
        (animal.trackingDevice?.model
          .toLowerCase()
          .includes(search) ?? false);

      const matchesSpecies =
        filters.species_id === "all" ||
        animal.species_id === Number(filters.species_id);

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active"
          ? animal.is_active
          : !animal.is_active);

      return (
        matchesSearch &&
        matchesSpecies &&
        matchesStatus
      );
    });
  }, [animals, filters]);

  const columns = useMemo(
    () =>
      getAnimalColumns({
        latestGpsByDevice,
        onEdit: (animal) => {
          router.push(`/animals/${animal.animal_id}/edit`);
        },
        onDelete: (animal) => {
          setSelectedDeleteAnimal(animal);
        },
      }),
    [latestGpsByDevice, router],
  );

  const activeCount = animals.filter(
    (animal) => animal.is_active,
  ).length;

  const sourceError =
    animalQuery.error ?? speciesQuery.error ?? gpsQuery.error;

  if (sourceError) {
    const error = toApiErrorState(sourceError);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => {
          void animalQuery.refetch();
          void speciesQuery.refetch();
          void gpsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Master Data"
        title="Data Satwa"
        description="Pantau individu satwa, informasi spesies, dan aktivitas pelacakan di Taman Nasional Gunung Leuser."
        actions={
          <Button
            icon={<Plus className="size-4" />}
            onClick={() => router.push("/animals/create")}
          >
            Tambah Satwa
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Satwa"
          value={isLoading ? "..." : String(animals.length)}
          hint="Seluruh individu terdaftar"
          icon={<PawPrint className="size-5" />}
        />
        <StatCard
          label="Satwa Terpantau"
          value={isLoading ? "..." : String(activeCount)}
          hint="Status aktif menurut data satwa"
          tone="positive"
          icon={<Radio className="size-5" />}
        />
        <StatCard
          label="Total Spesies"
          value={speciesQuery.isLoading ? "..." : String(speciesList.length)}
          hint="Jenis spesies terdaftar"
          icon={<Trees className="size-5" />}
        />
      </div>

      <section className="ui-panel">
        <div className="border-b border-line bg-surface-muted px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-soft p-2 text-primary">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Cari dan Filter Satwa</h2>
              <p className="mt-1 text-sm text-muted">
                Temukan data berdasarkan kode, spesies, atau status.
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
            onReset={() =>
              setFilters({ ...ANIMAL_INITIAL_FILTERS })
            }
          />
        </div>
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-ink">Daftar Individu Satwa</h2>
            <p className="mt-1 text-sm text-muted">
              Menampilkan {filteredAnimals.length} dari {animals.length} data satwa.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark">
            <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
            Data API
          </span>
        </div>

        <div className="p-4 sm:p-5">
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

      <ConfirmationDialog
        open={selectedDeleteAnimal !== null}
        title="Hapus Data Satwa?"
        description={
          <>
            <p>Apakah kamu yakin ingin menghapus satwa berikut?</p>
            <p className="mt-2 rounded-lg bg-natural-muted/30 p-3 text-sm font-semibold text-olive-dark">
              {selectedDeleteAnimal?.animal_code}
            </p>
            <p className="mt-3 text-xs text-danger">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </>
        }
        isPending={deleteAnimalMutation.isPending}
        error={
          deleteAnimalMutation.isError
            ? formatApiError(
                deleteAnimalMutation.error,
                "Gagal menghapus data satwa. Silakan coba lagi.",
              )
            : null
        }
        onConfirm={handleDeleteAnimal}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
