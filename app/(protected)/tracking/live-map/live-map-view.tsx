
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { DUMMY_ANIMALS } from "@/constant/animal/animal";
import { formatDate } from "@/utils/format";

type DummyAnimal = (typeof DUMMY_ANIMALS)[number];

function RealMap({
  animals,
  selectedAnimalId,
  onSelect,
}: {
  animals: DummyAnimal[];
  selectedAnimalId: string | null;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<
    Map<string, import("leaflet").Marker>
  >(new Map());

  useEffect(() => {
    let cancelled = false;
    let currentMap: LeafletMap | null = null;

    async function initializeMap() {
      const L = await import("leaflet");

      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: false,
      }).setView([3.55, 97.35], 10);

      currentMap = map;
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);

      const markerEntries = DUMMY_ANIMALS.map((animal) => {
        const markerIcon = L.divIcon({
          className: "",
          html: `
            <div style="
              width: 34px;
              height: 34px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              border-radius: 50%;
              background: #166534;
              color: white;
              font-size: 17px;
              box-shadow: 0 2px 8px #0004;
            ">${animal.id.startsWith("ORN") ? "🐒" : animal.id.startsWith("HRM") ? "🐅" : "🦏"}</div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker(
          [animal.latitude, animal.longitude],
          { icon: markerIcon },
        ).addTo(map);

        marker.bindPopup(
          `<strong>${animal.name}</strong><br/>Kode: ${animal.id}<br/>Status: ${animal.status}`,
        );

        marker.on("click", () => onSelect(animal.id));

        return [animal.id, marker] as const;
      });

      markersRef.current = new Map(markerEntries);

      if (markerEntries.length > 1) {
        const bounds = L.latLngBounds(
          DUMMY_ANIMALS.map((animal) => [
            animal.latitude,
            animal.longitude,
          ]),
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;
      currentMap?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, [onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedAnimalId) return;

    const animal = animals.find((item) => item.id === selectedAnimalId);
    const marker = markersRef.current.get(selectedAnimalId);

    if (!animal || !marker) return;

    map.flyTo([animal.latitude, animal.longitude], 12, {
      duration: 0.7,
    });
    marker.openPopup();
  }, [selectedAnimalId, animals]);

  return (
    <div
      ref={containerRef}
      className="h-[520px] w-full overflow-hidden rounded-xl"
      aria-label="Peta interaktif lokasi simulasi satwa"
    />
  );
}

export function LiveMapView() {
  const [selectedAnimalId, setSelectedAnimalId] =
    useState<string | null>(null);
  const [speciesId, setSpeciesId] = useState("all");
  const [onlyActive, setOnlyActive] = useState(true);

  const handleSelect = (id: string) => {
    setSelectedAnimalId(id);
  };

  const animalItems = useMemo(
    () =>
      DUMMY_ANIMALS.filter((animal) => {
        const matchesSpecies =
          speciesId === "all" || animal.speciesId === speciesId;
        const matchesStatus =
          !onlyActive || animal.status === "Terpantau";

        return matchesSpecies && matchesStatus;
      }),
    [speciesId, onlyActive],
  );

  const selectedAnimal = animalItems.find(
    (animal) => animal.id === selectedAnimalId,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Live Map
          </h2>
          <p className="text-sm text-zinc-600">
            Pemantauan lokasi satwa di kawasan TNGL.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 text-xs text-emerald-700">
          <span className="size-2 rounded-full bg-emerald-500" />
          Mode demo
        </span>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="map-species"
                className="text-xs font-medium text-zinc-600"
              >
                Spesies
              </label>

              <select
                id="map-species"
                value={speciesId}
                onChange={(event) => {
                  setSpeciesId(event.target.value);
                  setSelectedAnimalId(null);
                }}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">Semua spesies</option>
                {DUMMY_ANIMALS.map((animal) => (
                  <option key={animal.speciesId} value={animal.speciesId}>
                    {animal.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(event) => {
                  setOnlyActive(event.target.checked);
                  setSelectedAnimalId(null);
                }}
                className="size-4 rounded border-zinc-300"
              />
              Hanya aktif
            </label>
          </div>

          <ul className="overflow-hidden rounded-xl border border-emerald-200 bg-white">
            {animalItems.map((animal) => {
              const active = selectedAnimalId === animal.id;

              return (
                <li key={animal.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(animal.id)}
                    aria-pressed={active}
                    className={`flex w-full flex-col gap-1 border-l-2 px-3 py-3 text-left transition ${
                      active
                        ? "border-emerald-700 bg-emerald-100"
                        : "border-transparent hover:bg-emerald-50"
                    }`}
                  >
                    <span className="text-sm font-semibold text-zinc-900">
                      {animal.id}
                    </span>
                    <span className="text-sm text-zinc-600">
                      {animal.name}
                    </span>
                    <span className="text-xs text-emerald-700">
                      {animal.status}
                    </span>
                  </button>
                </li>
              );
            })}

            {animalItems.length === 0 && (
              <li className="p-3 text-sm text-zinc-500">
                Tidak ada satwa yang cocok dengan filter.
              </li>
            )}
          </ul>
        </aside>

        <section className="min-w-0 space-y-3">
          <div className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-100 p-1 shadow-sm">
            <RealMap
              animals={animalItems}
              selectedAnimalId={selectedAnimalId}
              onSelect={handleSelect}
            />
          </div>

          {selectedAnimal ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {selectedAnimal.id} — {selectedAnimal.name}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {selectedAnimal.latitude.toFixed(5)},{" "}
                  {selectedAnimal.longitude.toFixed(5)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {formatDate(selectedAnimal.recordedAt)}
                </p>
              </div>

              <StatusBadge label="Simulasi" variant="success" />
            </div>
          ) : (
            <EmptyState
              title="Pilih satwa"
              description="Pilih satwa dari daftar atau klik marker pada peta untuk melihat detailnya."
            />
          )}
        </section>
      </div>
    </div>
  );
}
