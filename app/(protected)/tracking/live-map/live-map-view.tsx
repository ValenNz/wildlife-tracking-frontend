"use client";

import { useCallback, useMemo, useState } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAnimals } from "@/hooks/useAnimals";
import { useGPSReadingsByAnimal } from "@/hooks/useGPSReadings";
import { toApiErrorState } from "@/services/api-client";
import { formatDate } from "@/utils/format";
import type { TYPE_ANIMAL } from "@/types/wildlife/animal.type";

type AnimalPosition = {
  animal: TYPE_ANIMAL;
  latitude: number;
  longitude: number;
  recordedAt: string;
};

const MapCanvas = ({ positions }: { positions: AnimalPosition[] }) => {
  const latitudes = positions.map((position) => position.latitude);
  const longitudes = positions.map((position) => position.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  const latSpan = maxLat - minLat || 0.01;
  const lonSpan = maxLon - minLon || 0.01;

  return (
    <div
      role="img"
      aria-label="Peta posisi satwa. Integrasi provider peta akan menyusul."
      className="relative h-96 w-full overflow-hidden rounded-xl border border-zinc-300 bg-[#eef2f7]"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
      >
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="0.3"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>

      {positions.map((position) => {
        const x = ((position.longitude - minLon) / lonSpan) * 92 + 4;
        const y = 96 - ((position.latitude - minLat) / latSpan) * 92;

        return (
          <span
            key={position.animal.animal_id}
            title={`${position.animal.animal_code} (${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)})`}
            className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600 ring-2 ring-white"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        );
      })}

      <p className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs text-zinc-600">
        {positions.length} posisi ditampilkan. Provider peta belum diintegrasikan.
      </p>
    </div>
  );
};

export function LiveMapView() {
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);
  const [speciesId, setSpeciesId] = useState<string>("all");
  const [onlyActive, setOnlyActive] = useState<boolean>(true);

  const animalsParams = useMemo(
    () => ({
      page: 1,
      per_page: 100,
      species_id: speciesId === "all" ? undefined : Number(speciesId),
      is_active: onlyActive ? true : undefined,
    }),
    [speciesId, onlyActive],
  );

  const animals = useAnimals(animalsParams);
  const selected = useGPSReadingsByAnimal(selectedAnimalId ?? -1);

  const animalItems = useMemo(
    () => animals.data?.data.items ?? [],
    [animals.data],
  );

  const positions = useMemo<AnimalPosition[]>(() => {
    if (selectedAnimalId === null || selected.isEmpty) return [];

    const animal = animalItems.find(
      (item) => item.animal_id === selectedAnimalId,
    );

    const latest = selected.data[0];

    if (animal === undefined || latest === undefined) return [];

    const latitude = Number(latest.latitude);
    const longitude = Number(latest.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];

    return [
      {
        animal,
        latitude,
        longitude,
        recordedAt: latest.recorded_at,
      },
    ];
  }, [animalItems, selected.data, selected.isEmpty, selectedAnimalId]);

  const handleSelect = useCallback((animal: TYPE_ANIMAL) => {
    setSelectedAnimalId(animal.animal_id);
  }, []);

  if (animals.isPending) {
    return <Loading label="Memuat satwa..." className="min-h-40" />;
  }

  if (animals.isError) {
    const error = toApiErrorState(animals.error);

    return (
      <ErrorState
        {...error}
        onRetry={() => void animals.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Live Map</h2>
          <p className="text-sm text-zinc-600">
            Posisi terakhir yang dilaporkan perangkat pelacak.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
          Pembaruan saat halaman dimuat
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <aside className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-2 rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex min-w-[9rem] flex-1 flex-col gap-1">
              <label htmlFor="map-species" className="text-xs font-medium text-zinc-600">
                Spesies
              </label>
              <select
                id="map-species"
                value={speciesId}
                onChange={(event) => setSpeciesId(event.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm"
              >
                <option value="all">Semua spesies</option>
                {Array.from(
                  new Map(
                    animalItems.map((animal) => [animal.species_id, animal]),
                  ).values(),
                ).map((animal) => (
                  <option key={animal.species_id} value={String(animal.species_id)}>
                    {animal.species_name ?? `Spesies #${animal.species_id}`}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(event) => setOnlyActive(event.target.checked)}
                className="size-3.5 rounded border-zinc-300"
              />
              Hanya aktif
            </label>
          </div>

          {animalItems.length === 0 ? (
            <EmptyState
              title="Belum ada satwa"
              description="Tidak ada satwa yang cocok dengan filter."
            />
          ) : (
            <ul className="max-h-96 overflow-y-auto rounded-xl border border-zinc-200 bg-white">
              {animalItems.map((animal) => {
                const active = selectedAnimalId === animal.animal_id;

                return (
                  <li key={animal.animal_id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(animal)}
                      aria-pressed={active}
                      className={
                        active
                          ? "flex w-full flex-col gap-0.5 border-l-2 border-emerald-600 bg-emerald-50 px-3 py-2 text-left"
                          : "flex w-full flex-col gap-0.5 border-l-2 border-transparent px-3 py-2 text-left transition hover:bg-zinc-50"
                      }
                    >
                      <span className="text-sm font-medium text-zinc-900">
                        {animal.animal_code}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {animal.species_name ?? `Spesies #${animal.species_id}`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="flex flex-col gap-3">
          {selectedAnimalId === null ? (
            <EmptyState
              title="Pilih satwa"
              description="Klik salah satu satwa di daftar untuk melihat posisi terakhirnya."
            />
          ) : selected.error ? (
            <ErrorState
              {...selected.error}
              onRetry={selected.refetch}
            />
          ) : selected.isEmpty ? (
            <EmptyState
              title="Belum ada posisi"
              description="Perangkat untuk satwa ini belum mengirim pembacaan GPS."
            />
          ) : positions.length > 0 ? (
            <>
              <MapCanvas positions={positions} />
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <span className="text-sm font-medium text-zinc-900">
                  {positions[0].animal.animal_code}
                </span>
                <span className="tabular-nums text-xs text-zinc-600">
                  {positions[0].latitude.toFixed(5)},{" "}
                  {positions[0].longitude.toFixed(5)}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatDate(positions[0].recordedAt)}
                </span>
                <StatusBadge label="Live" variant="success" />
              </div>
            </>
          ) : (
            <EmptyState
              title="Koordinat tidak valid"
              description="Pembacaan GPS terakhir memuat koordinat di luar range yang valid."
            />
          )}
        </section>
      </div>
    </div>
  );
}