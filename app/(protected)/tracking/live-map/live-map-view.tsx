
"use client";

import {useCallback, useEffect, useMemo, useRef, useState,} from "react";

import type {Map as LeafletMap,Marker,FeatureGroup,} from "leaflet";
import { useTrackingDevices } from "@/hooks/tracking-device.hook";
import { useGpsReadings } from "@/hooks/gps-reading.hook";
import { useGeoZones } from "@/hooks/use-geo-zones";

import type { GeoZone } from "@/types/geo-zone";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { StatusBadge } from "@/components/ui/status-badge";

import { toApiErrorState } from "@/services/api-client";
import { formatDate } from "@/utils/format";

type MapAnimal = {
  id: string;
  deviceId: number;
  animalId: number;
  name: string;
  speciesId: number;
  speciesName: string;
  latitude: number;
  longitude: number;
  recordedAt: string;
  isActive: boolean;
  status: string;
};

type RealMapProps = {
  animals: MapAnimal[];
  zones: GeoZone[];
  selectedAnimalId: string | null;
  onSelect: (id: string) => void;
};

const ZONE_COLORS: Record<string, string> = {
  jalan_raya: "#eab308",
  koridor_ekologis: "#16a34a",
  perkebunan: "#ca8a04",
  permukiman: "#2563eb",
};

function RealMap({
  animals,
  zones,
  selectedAnimalId,
  onSelect,
}: RealMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const zoneLayersRef = useRef<FeatureGroup | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const handleZoomAllZones = useCallback(async () => {
  const currentMap = mapRef.current;
  const zoneLayer = zoneLayersRef.current;

  if (!currentMap || !zoneLayer) return;

  const bounds = zoneLayer.getBounds();

  if (!bounds.isValid()) return;

  currentMap.fitBounds(bounds, {
    padding: [50, 50],
    maxZoom: 12,
    animate: true,
  });
}, []);
  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      const L = await import("leaflet");

      if (cancelled || !containerRef.current) return;
      if (mapRef.current !== null) return;

      const currentMap = L.map(containerRef.current, {
        zoomControl: false,
      }).setView([3.55, 97.35], 10);

      mapRef.current = currentMap;

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
      ).addTo(currentMap!);

      L.control.zoom({ position: "topright" }).addTo(currentMap);

      setMapReady(true);
    }

    void initializeMap();

    return () => {
      cancelled = true;

      zoneLayersRef.current?.remove();
      zoneLayersRef.current = null;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      mapRef.current?.remove();
      mapRef.current = null;

      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const currentMap = mapRef.current;

    if (currentMap === null || !mapReady) return;

    let cancelled = false;

    async function renderZones() {
      const L = await import("leaflet");

      if (cancelled) return;

      zoneLayersRef.current?.remove();

      const zoneLayer = L.featureGroup().addTo(currentMap!);
      zoneLayersRef.current = zoneLayer;

      zones.forEach((zone) => {
        const color =
          ZONE_COLORS[zone.zone_type] ?? "#64748b";

        const popupContent = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = zone.zone_name;

        const type = document.createElement("p");
        type.textContent = `Jenis zona: ${zone.zone_type}`;

        const radiusInfo = document.createElement("p");
        radiusInfo.textContent =
          zone.radius_km !== null
            ? `Radius: ${zone.radius_km} km`
            : "Radius: Tidak tersedia";

        popupContent.append(title, type, radiusInfo);

        if (zone.polygon_geojson !== null) {
          try {
            const geoJson =
              typeof zone.polygon_geojson === "string"
                ? JSON.parse(zone.polygon_geojson)
                : zone.polygon_geojson;

            if (
              typeof geoJson === "object" &&
              geoJson !== null
            ) {
              L.geoJSON(geoJson as never, {
                style: {
                  color,
                  weight: 2,
                  fillColor: color,
                  fillOpacity: 0.25,
                },
              })
                .bindPopup(popupContent)
                .addTo(zoneLayer);

              return;
            }
          } catch (error) {
            console.error(
              `GeoJSON zona ${zone.zone_name} tidak valid:`,
              error,
            );
          }
        }

        if (
          zone.center_lat === null ||
          zone.center_lon === null ||
          zone.radius_km === null
        ) {
          return;
        }

        const latitude = Number(zone.center_lat);
        const longitude = Number(zone.center_lon);
        const radius = Number(zone.radius_km);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          !Number.isFinite(radius) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180 ||
          radius <= 0
        ) {
          return;
        }

        L.circle([latitude, longitude], {
          radius: radius * 1000,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.15,
        })
          .bindPopup(popupContent)
          .addTo(zoneLayer);
      });
    }

    void renderZones();

    return () => {
      cancelled = true;
      zoneLayersRef.current?.removeFrom(currentMap);
      zoneLayersRef.current = null;
    };
  }, [zones, mapReady]);

  useEffect(() => {
    const currentMap = mapRef.current;

    if (currentMap === null || !mapReady) return;

    let cancelled = false;

    async function renderMarkers() {
      const L = await import("leaflet");

      if (cancelled) return;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      animals.forEach((animal) => {
        const species = animal.speciesName.toLowerCase();

        const icon = species.includes("orangutan")
          ? "🐒"
          : species.includes("harimau")
            ? "🐅"
            : species.includes("gajah")
              ? "🐘"
              : species.includes("badak")
                ? "🦏"
                : "🐾";

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
            ">${icon}</div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker(
          [animal.latitude, animal.longitude],
          { icon: markerIcon },
        ).addTo(currentMap!);

        const popupContent = document.createElement("div");

        const name = document.createElement("strong");
        name.textContent = animal.name;

        const code = document.createElement("p");
        code.textContent = `Kode: ${animal.id}`;

        const speciesText = document.createElement("p");
        speciesText.textContent = `Spesies: ${animal.speciesName}`;

        const status = document.createElement("p");
        status.textContent = `Status: ${animal.status}`;

        popupContent.append(
          name,
          code,
          speciesText,
          status,
        );

        marker.bindPopup(popupContent);

        marker.on("click", () => onSelect(animal.id));

        markersRef.current.set(animal.id, marker);
      });

      if (cancelled) return;

      if (animals.length > 1) {
        const bounds = animals.map(
          (animal) =>
            [animal.latitude, animal.longitude] as [number, number],
        );

        currentMap!.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 11,
        });
      } else if (animals.length === 1) {
        currentMap!.setView(
          [animals[0].latitude, animals[0].longitude],
          12,
        );
      }
    }

    void renderMarkers();

    return () => {
      cancelled = true;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
    };
  }, [animals, mapReady, onSelect]);

  useEffect(() => {
    const currentMap = mapRef.current;

    if (currentMap === null || !mapReady || !selectedAnimalId) {
      return;
    }

    const animal = animals.find(
      (item) => item.id === selectedAnimalId,
    );

    const marker = markersRef.current.get(selectedAnimalId);

    if (!animal || !marker) return;

    currentMap.flyTo(
      [animal.latitude, animal.longitude],
      12,
      { duration: 0.7 },
    );

    marker.openPopup();
  }, [selectedAnimalId, animals, mapReady]);

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-xl">
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label="Peta interaktif lokasi satwa dan zona geografis"
      />

      <button
        type="button"
        onClick={() => void handleZoomAllZones()}
        className="absolute left-3 top-3 z-[1000] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-md transition hover:bg-gray-100"
      >
        Zoom ke Semua Zona
      </button>
    </div>
  );
}

export function LiveMapView() {
  const [selectedAnimalId, setSelectedAnimalId] =
    useState<string | null>(null);

  const [speciesId, setSpeciesId] = useState("all");
  const [onlyActive, setOnlyActive] = useState(true);

  const {
    data: devicesData,
    isLoading: devicesLoading,
    error: devicesError,
    refetch: refetchDevices,
  } = useTrackingDevices();

  const {
    data: readingsData,
    isLoading: readingsLoading,
    error: readingsError,
    refetch: refetchReadings,
  } = useGpsReadings();

  const {
    data: geoZones = [],
    error: geoZonesError,
    refetch: refetchGeoZones,
  } = useGeoZones();

  const devices = devicesData?.data ?? [];
  const readings = readingsData?.data ?? [];

  const animalItems = useMemo<MapAnimal[]>(() => {
    return devices.flatMap((device) => {
      const animal = device.animal;

      if (!animal || device.animal_id === null) {
        return [];
      }

      const latestReading = readings.find(
        (reading) =>
          reading.device_id === device.device_id,
      );

      if (!latestReading) {
        return [];
      }

      const latitude = Number(latestReading.latitude);
      const longitude = Number(latestReading.longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return [];
      }

      const isActive =
        (device.is_active === true ||
          device.is_active === 1) &&
        animal.is_active === true;

      return [
        {
          id: animal.animal_code,
          deviceId: device.device_id,
          animalId: animal.animal_id,
          name:
            animal.species?.common_name ??
            animal.animal_code,
          speciesId: animal.species_id,
          speciesName:
            animal.species?.common_name ??
            "Tidak diketahui",
          latitude,
          longitude,
          recordedAt: latestReading.recorded_at,
          isActive,
          status: isActive ? "Terpantau" : "Tidak Aktif",
        },
      ];
    });
  }, [devices, readings]);

  const speciesOptions = useMemo(() => {
    const speciesMap = new Map<number, string>();

    devices.forEach((device) => {
      const animal = device.animal;

      if (animal) {
        speciesMap.set(
          animal.species_id,
          animal.species?.common_name ??
            `Spesies #${animal.species_id}`,
        );
      }
    });

    return Array.from(speciesMap.entries()).map(
      ([id, name]) => ({ id, name }),
    );
  }, [devices]);

  const filteredAnimals = useMemo(() => {
    return animalItems.filter((animal) => {
      const matchesSpecies =
        speciesId === "all" ||
        animal.speciesId === Number(speciesId);

      const matchesStatus =
        !onlyActive || animal.isActive;

      return matchesSpecies && matchesStatus;
    });
  }, [animalItems, speciesId, onlyActive]);

  const selectedAnimal = filteredAnimals.find(
    (animal) => animal.id === selectedAnimalId,
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedAnimalId(id);
  }, []);

  if (devicesLoading || readingsLoading) {
    return (
      <Loading label="Memuat data lokasi satwa..." />
    );
  }

  if (devicesError || readingsError) {
    const apiError = toApiErrorState(
      devicesError ?? readingsError,
    );

    return (
      <ErrorState
        kind={apiError.kind}
        message={apiError.message}
        status={apiError.status}
        errors={apiError.errors}
        onRetry={() => {
          void refetchDevices();
          void refetchReadings();
        }}
      />
    );
  }

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
          Data backend
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

                {speciesOptions.map((species) => (
                  <option
                    key={species.id}
                    value={species.id}
                  >
                    {species.name}
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
            {filteredAnimals.map((animal) => {
              const active =
                selectedAnimalId === animal.id;

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

            {filteredAnimals.length === 0 && (
              <li className="p-3 text-sm text-zinc-500">
                Tidak ada data lokasi GPS yang cocok dengan filter.
              </li>
            )}
          </ul>

          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">
              Legenda Peta
            </h3>

            <div className="space-y-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-yellow-500" />
                Jalan Raya
              </div>

              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-green-600" />
                Koridor Ekologis
              </div>

              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-yellow-700" />
                Perkebunan
              </div>

              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-blue-600" />
                Permukiman
              </div>

              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-emerald-800" />
                Lokasi Satwa
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              {geoZones.length} zona dari backend
            </p>

            {geoZonesError && (
              <div className="mt-2 text-xs text-red-600">
                Gagal memuat zona geografis.

                <button
                  type="button"
                  onClick={() => void refetchGeoZones()}
                  className="ml-1 font-medium underline"
                >
                  Coba lagi
                </button>
              </div>
            )}
          </div>
        </aside>

        <section className="min-w-0 space-y-3">
          <div className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-100 p-1 shadow-sm">
            <RealMap
              animals={filteredAnimals}
              zones={geoZones}
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

                <p className="mt-1 text-xs text-zinc-500">
                  Perangkat #{selectedAnimal.deviceId}
                </p>
              </div>

              <StatusBadge
                label={selectedAnimal.status}
                variant={
                  selectedAnimal.isActive
                    ? "success"
                    : "danger"
                }
              />
            </div>
          ) : (
            <EmptyState
              title="Pilih satwa"
              description="Pilih satwa dari daftar atau klik marker pada peta untuk melihat detail lokasinya."
            />
          )}
        </section>
      </div>
    </div>
  );
}
