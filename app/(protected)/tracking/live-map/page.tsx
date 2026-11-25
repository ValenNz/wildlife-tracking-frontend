"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FeatureGroup, Map as LeafletMap, Marker, Polyline } from "leaflet";
import { Globe2, Layers, Map as MapIcon, Mountain, Pause, Play, Radio } from "lucide-react";

import { useTrackingDevices } from "@/hooks/use-devices";
import { useGpsReadings } from "@/hooks/use-tracking";
import { useGeoZones } from "@/hooks/use-geo-zones";
import type { GeoZone } from "@/types/geo-zone.type";

import { Animal3DDetailPanel } from "@/components/tracking/animal-3d-detail-panel";
import type { LiveMapAnimal3D } from "@/components/tracking/leuser-mountain-3d";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import { toApiErrorState } from "@/services/api";

const LeuserMountain3D = dynamic(
  () => import("@/components/tracking/leuser-mountain-3d").then((mod) => mod.LeuserMountain3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(540px,70dvh)] min-h-[340px] w-full animate-pulse rounded-xl bg-surface-muted" />
    ),
  },
);

type ViewMode = "mountain3d" | "map2d" | "split";

type MotionState = {
  lat: number;
  lon: number;
  bearingRad: number;
  speedKmh: number;
  updatedAt: string;
  trail: [number, number][];
};

const ZONE_COLORS: Record<string, string> = {
  jalan_raya: "#3d4337",
  koridor_ekologis: "#3e5a3f",
  perkebunan: "#6b7f67",
  permukiman: "#1e3a2e",
};

const TICK_INTERVAL_SEC = 10;

function bearingToCompass(rad: number): string {
  const deg = ((rad * 180) / Math.PI + 360) % 360;
  const dirs = ["Utara (N)", "Timur Laut (NE)", "Timur (E)", "Tenggara (SE)", "Selatan (S)", "Barat Daya (SW)", "Barat (W)", "Barat Laut (NW)"];
  return dirs[Math.round(deg / 45) % 8];
}

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

type RealMapProps = {
  animals: LiveMapAnimal3D[];
  zones: GeoZone[];
  selectedAnimalId: string | null;
  onSelect: (id: string) => void;
};

function RealMap({ animals, zones, selectedAnimalId, onSelect }: RealMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const trailsRef = useRef<Map<string, Polyline>>(new Map());
  const zoneLayersRef = useRef<FeatureGroup | null>(null);
  const hasFittedBoundsRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [satelliteLayer, setSatelliteLayer] = useState(true);

  const handleZoomAllZones = useCallback(() => {
    const currentMap = mapRef.current;
    const zoneLayer = zoneLayersRef.current;
    if (!currentMap || !zoneLayer) return;
    const bounds = zoneLayer.getBounds();
    if (!bounds.isValid()) return;
    currentMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true });
  }, []);

  useEffect(() => {
    const markerStore = markersRef.current;
    const trailStore = trailsRef.current;
    let cancelled = false;

    async function initializeMap() {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;
      if (mapRef.current !== null) return;

      const currentMap = L.map(containerRef.current, { zoomControl: false }).setView([3.55, 97.35], 10);
      mapRef.current = currentMap;
      L.control.zoom({ position: "topright" }).addTo(currentMap);
      setMapReady(true);
    }

    void initializeMap();

    return () => {
      cancelled = true;
      zoneLayersRef.current?.remove();
      zoneLayersRef.current = null;
      markerStore.forEach((m) => m.remove());
      markerStore.clear();
      trailStore.forEach((p) => p.remove());
      trailStore.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      hasFittedBoundsRef.current = false;
      setMapReady(false);
    };
  }, []);

  // Switch between Satellite & OpenStreetMap base tiles
  useEffect(() => {
    const currentMap = mapRef.current;
    if (!currentMap || !mapReady) return;
    let cancelled = false;
    let tileLayer: import("leaflet").TileLayer | null = null;

    async function applyBaseLayer() {
      const L = await import("leaflet");
      if (cancelled) return;
      tileLayer = satelliteLayer
        ? L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            { maxZoom: 18, attribution: "Tiles &copy; Esri" },
          )
        : L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          });
      tileLayer.addTo(currentMap!);
      tileLayer.bringToBack();
    }

    void applyBaseLayer();
    return () => {
      cancelled = true;
      tileLayer?.remove();
    };
  }, [satelliteLayer, mapReady]);

  // Render GeoZones
  useEffect(() => {
    const currentMap = mapRef.current;
    if (!currentMap || !mapReady) return;
    let cancelled = false;

    async function renderZones() {
      const L = await import("leaflet");
      if (cancelled) return;

      zoneLayersRef.current?.remove();
      const zoneLayer = L.featureGroup().addTo(currentMap!);
      zoneLayersRef.current = zoneLayer;

      zones.forEach((zone) => {
        const color = ZONE_COLORS[zone.zone_type] ?? "#c7cbb8";
        const popupContent = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = zone.zone_name;
        const type = document.createElement("p");
        type.textContent = `Jenis zona: ${zone.zone_type}`;
        const radiusInfo = document.createElement("p");
        radiusInfo.textContent =
          zone.radius_km !== null ? `Radius: ${zone.radius_km} km` : "Radius: Tidak tersedia";
        popupContent.append(title, type, radiusInfo);

        if (zone.polygon_geojson !== null) {
          try {
            const geoJson =
              typeof zone.polygon_geojson === "string"
                ? JSON.parse(zone.polygon_geojson)
                : zone.polygon_geojson;
            if (typeof geoJson === "object" && geoJson !== null) {
              L.geoJSON(geoJson as never, {
                style: { color, weight: 2, fillColor: color, fillOpacity: 0.22 },
              })
                .bindPopup(popupContent)
                .addTo(zoneLayer);
              return;
            }
          } catch {
            // Skip invalid GeoJSON
          }
        }

        if (zone.center_lat === null || zone.center_lon === null || zone.radius_km === null) return;
        const lat = Number(zone.center_lat);
        const lon = Number(zone.center_lon);
        const radius = Number(zone.radius_km);
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(radius) || radius <= 0) return;

        L.circle([lat, lon], {
          radius: radius * 1000,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.16,
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

  // Update markers & movement trail polylines smoothly every 10 seconds
  useEffect(() => {
    const currentMap = mapRef.current;
    if (!currentMap || !mapReady) return;
    let cancelled = false;

    async function syncMarkers() {
      const L = await import("leaflet");
      if (cancelled) return;

      const activeIds = new Set(animals.map((a) => a.id));

      markersRef.current.forEach((marker, id) => {
        if (!activeIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      });
      trailsRef.current.forEach((line, id) => {
        if (!activeIds.has(id)) {
          line.remove();
          trailsRef.current.delete(id);
        }
      });

      animals.forEach((animal) => {
        const species = animal.speciesName.toLowerCase();
        const emoji = species.includes("orangutan")
          ? "🐒"
          : species.includes("harimau")
            ? "🐅"
            : species.includes("gajah")
              ? "🐘"
              : species.includes("badak")
                ? "🦏"
                : "🐾";

        const existingMarker = markersRef.current.get(animal.id);
        if (existingMarker) {
          existingMarker.setLatLng([animal.latitude, animal.longitude]);
        } else {
          const markerIcon = L.divIcon({
            className: "",
            html: `<div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:3px solid white;border-radius:50%;background:#1e3a2e;color:white;font-size:18px;box-shadow:0 3px 10px rgba(0,0,0,0.45);">${emoji}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          const marker = L.marker([animal.latitude, animal.longitude], { icon: markerIcon }).addTo(currentMap!);
          marker.on("click", () => onSelect(animal.id));
          markersRef.current.set(animal.id, marker);
        }

        const marker = markersRef.current.get(animal.id)!;
        marker.bindPopup(
          `<strong>${animal.name}</strong><br/>Kode: ${animal.id}<br/>Kecepatan: ${animal.speedKmh.toFixed(1)} km/jam<br/>Arah: ${animal.heading}`,
        );

        // Render movement trail polyline
        const existingTrail = trailsRef.current.get(animal.id);
        if (animal.trail.length > 1) {
          if (existingTrail) {
            existingTrail.setLatLngs(animal.trail);
          } else {
            const line = L.polyline(animal.trail, {
              color: "#34d399",
              weight: 3,
              opacity: 0.85,
              dashArray: "6 6",
            }).addTo(currentMap!);
            trailsRef.current.set(animal.id, line);
          }
        }
      });

      if (!hasFittedBoundsRef.current && animals.length > 0) {
        hasFittedBoundsRef.current = true;
        if (animals.length > 1) {
          currentMap!.fitBounds(
            animals.map((a) => [a.latitude, a.longitude] as [number, number]),
            { padding: [50, 50], maxZoom: 11 },
          );
        } else {
          currentMap!.setView([animals[0].latitude, animals[0].longitude], 12);
        }
      }
    }

    void syncMarkers();
    return () => {
      cancelled = true;
    };
  }, [animals, mapReady, onSelect]);

  // Fly to selected animal
  useEffect(() => {
    const currentMap = mapRef.current;
    if (!currentMap || !mapReady || !selectedAnimalId) return;
    const animal = animals.find((a) => a.id === selectedAnimalId);
    const marker = markersRef.current.get(selectedAnimalId);
    if (!animal || !marker) return;
    currentMap.flyTo([animal.latitude, animal.longitude], 12, { duration: 0.7 });
    marker.openPopup();
  }, [selectedAnimalId, animals, mapReady]);

  return (
    <div className="relative h-[min(540px,70dvh)] min-h-[340px] w-full overflow-hidden rounded-xl">
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label="Peta satelit dan geografis lokasi satwa"
      />

      <div className="absolute left-3 top-3 z-[1000] flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={handleZoomAllZones}
          className="rounded-lg border border-natural-muted bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-forest-black shadow-card backdrop-blur transition hover:bg-white"
        >
          Zoom Semua Zona
        </button>
        <button
          type="button"
          onClick={() => setSatelliteLayer((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-natural-muted bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-forest-black shadow-card backdrop-blur transition hover:bg-white"
        >
          <Globe2 className="size-3.5 text-primary" />
          <span>{satelliteLayer ? "Mode Jalan (OSM)" : "Mode Satelit"}</span>
        </button>
      </div>
    </div>
  );
}

export default function LiveMapPage() {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [speciesId, setSpeciesId] = useState("all");
  const [onlyActive, setOnlyActive] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("mountain3d");
  const [liveTracking, setLiveTracking] = useState(true);
  const [countdown, setCountdown] = useState(TICK_INTERVAL_SEC);
  const [motionMap, setMotionMap] = useState<Record<string, MotionState>>({});

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
  } = useGpsReadings(undefined, { refetchInterval: liveTracking ? TICK_INTERVAL_SEC * 1000 : false });

  const {
    data: geoZones = [],
    error: geoZonesError,
    refetch: refetchGeoZones,
  } = useGeoZones();

  const devices = useMemo(() => devicesData?.data ?? [], [devicesData]);
  const readings = useMemo(() => readingsData?.data ?? [], [readingsData]);

  // Base animals from backend GPS readings
  const baseAnimals = useMemo(() => {
    return devices.flatMap((device) => {
      const animal = device.animal;
      if (!animal || device.animal_id === null) return [];

      const latestReading = readings.find((r) => r.device_id === device.device_id);
      if (!latestReading) return [];

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

      const isActive = device.is_active === true && animal.is_active === true;
      return [
        {
          id: animal.animal_code ?? String(animal.animal_id),
          deviceId: device.device_id,
          animalId: animal.animal_id,
          name: animal.species?.common_name ?? animal.animal_code ?? String(animal.animal_id),
          speciesId: animal.species_id,
          speciesName: animal.species?.common_name ?? "Tidak diketahui",
          latitude,
          longitude,
          recordedAt: latestReading.recorded_at,
          isActive,
          status: isActive ? "Terpantau" : "Tidak Aktif",
        },
      ];
    });
  }, [devices, readings]);

  const baseAnimalsRef = useRef(baseAnimals);
  useEffect(() => {
    baseAnimalsRef.current = baseAnimals;
  }, [baseAnimals]);

  // 10-second live movement engine + 1-second countdown ticker
  useEffect(() => {
    if (!liveTracking) return;

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;

        // Every 10 seconds: advance active animals smoothly along realistic habitat vectors
        const nowIso = new Date().toISOString();
        setMotionMap((current) => {
          const next: Record<string, MotionState> = { ...current };
          for (const animal of baseAnimalsRef.current) {
            if (!animal.isActive) continue;
            const existing = current[animal.id];
            const seed = hashSeed(animal.id);

            const startLat = existing?.lat ?? animal.latitude;
            const startLon = existing?.lon ?? animal.longitude;
            const prevBearing = existing?.bearingRad ?? ((seed % 360) * Math.PI) / 180;

            // Gentle curving wildlife roaming step (~55m - 125m per 10 seconds)
            const turn = (Math.random() - 0.5) * 0.65;
            let nextBearing = prevBearing + turn;

            // Pull gently back toward base habitat if drifting > 0.012 deg (~1.3 km)
            const dLatFromHome = animal.latitude - startLat;
            const dLonFromHome = animal.longitude - startLon;
            if (Math.hypot(dLatFromHome, dLonFromHome) > 0.012) {
              nextBearing = Math.atan2(dLonFromHome, dLatFromHome);
            }

            const stepDeg = 0.00045 + Math.random() * 0.00055;
            const nextLat = startLat + Math.cos(nextBearing) * stepDeg;
            const nextLon = startLon + Math.sin(nextBearing) * stepDeg;
            const metersMoved = stepDeg * 111_000;
            const speedKmh = (metersMoved / TICK_INTERVAL_SEC) * 3.6;

            const prevTrail: [number, number][] = existing?.trail ?? [[animal.latitude, animal.longitude]];
            const nextTrail: [number, number][] = [...prevTrail, [nextLat, nextLon] as [number, number]].slice(-12);

            next[animal.id] = {
              lat: nextLat,
              lon: nextLon,
              bearingRad: nextBearing,
              speedKmh,
              updatedAt: nowIso,
              trail: nextTrail,
            };
          }
          return next;
        });

        return TICK_INTERVAL_SEC;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [liveTracking]);

  // Merge backend readings with live 10-second movement coordinates
  const animalItems = useMemo<LiveMapAnimal3D[]>(() => {
    return baseAnimals.map((animal) => {
      const m = motionMap[animal.id];
      const lat = m?.lat ?? animal.latitude;
      const lon = m?.lon ?? animal.longitude;
      return {
        ...animal,
        latitude: lat,
        longitude: lon,
        recordedAt: m?.updatedAt ?? animal.recordedAt,
        speedKmh: m?.speedKmh ?? (animal.isActive ? 2.4 : 0),
        heading: m ? bearingToCompass(m.bearingRad) : "Utara (N)",
        trail: m?.trail ?? [[lat, lon]],
      };
    });
  }, [baseAnimals, motionMap]);

  const speciesOptions = useMemo(() => {
    const speciesMap = new Map<number, string>();
    devices.forEach((device) => {
      const animal = device.animal;
      if (animal) {
        speciesMap.set(animal.species_id, animal.species?.common_name ?? `Spesies #${animal.species_id}`);
      }
    });
    return Array.from(speciesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [devices]);

  const filteredAnimals = useMemo(() => {
    return animalItems.filter((animal) => {
      const matchesSpecies = speciesId === "all" || animal.speciesId === Number(speciesId);
      const matchesStatus = !onlyActive || animal.isActive;
      return matchesSpecies && matchesStatus;
    });
  }, [animalItems, speciesId, onlyActive]);

  const selectedAnimal = filteredAnimals.find((a) => a.id === selectedAnimalId) ?? null;

  const handleSelect = useCallback((id: string | null) => {
    setSelectedAnimalId(id);
  }, []);

  if (devicesLoading || readingsLoading) {
    return <Loading label="Memuat data pelacakan satwa & Gunung Leuser 3D..." />;
  }

  if (devicesError || readingsError) {
    const apiError = toApiErrorState(devicesError ?? readingsError);
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
      <PageHeader
        eyebrow="Pelacakan & Eksplorasi 3D"
        title="Live Map & Gunung Leuser 3D"
        description="Pantau pergerakan satwa secara langsung setiap 10 detik di Gunung Leuser 3D dan peta satelit. Klik satwa untuk melihat informasi lengkap beserta model 3D-nya."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Live 10s indicator & pause/resume */}
            <button
              type="button"
              onClick={() => setLiveTracking((v) => !v)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                liveTracking
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-line bg-surface-muted text-muted",
              )}
            >
              <Radio className={cn("size-3.5", liveTracking && "animate-pulse")} />
              <span>
                {liveTracking ? `Live 10d · ${countdown}d` : "Pelacakan Dijeda"}
              </span>
              {liveTracking ? <Pause className="size-3" /> : <Play className="size-3" />}
            </button>

            {/* View mode switcher */}
            <div
              role="group"
              aria-label="Mode tampilan peta"
              className="inline-flex rounded-xl border border-line bg-surface p-1 shadow-sm"
            >
              <button
                type="button"
                onClick={() => setViewMode("mountain3d")}
                aria-pressed={viewMode === "mountain3d"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                  viewMode === "mountain3d"
                    ? "bg-primary text-white"
                    : "text-ink-soft hover:bg-surface-muted",
                )}
              >
                <Mountain className="size-3.5" />
                <span>Gunung 3D</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map2d")}
                aria-pressed={viewMode === "map2d"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                  viewMode === "map2d"
                    ? "bg-primary text-white"
                    : "text-ink-soft hover:bg-surface-muted",
                )}
              >
                <MapIcon className="size-3.5" />
                <span>Peta Satelit</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                aria-pressed={viewMode === "split"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                  viewMode === "split"
                    ? "bg-primary text-white"
                    : "text-ink-soft hover:bg-surface-muted",
                )}
              >
                <Layers className="size-3.5" />
                <span>Gabungan</span>
              </button>
            </div>
          </div>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
        {/* Left sidebar: Filters, live animals list, legend */}
        <aside className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary-soft p-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="map-species" className="text-xs font-medium text-ink-soft">
                Spesies
              </label>
              <select
                id="map-species"
                value={speciesId}
                onChange={(event) => {
                  setSpeciesId(event.target.value);
                  setSelectedAnimalId(null);
                }}
                className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              >
                <option value="all">Semua spesies</option>
                {speciesOptions.map((species) => (
                  <option key={species.id} value={species.id}>
                    {species.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(event) => {
                  setOnlyActive(event.target.checked);
                  setSelectedAnimalId(null);
                }}
                className="size-4 rounded border-line"
              />
              Hanya satwa aktif
            </label>
          </div>

          <ul className="max-h-[420px] overflow-y-auto rounded-xl border border-primary/25 bg-surface">
            {filteredAnimals.map((animal) => {
              const active = selectedAnimalId === animal.id;
              return (
                <li key={animal.id} className="border-b border-line/60 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => handleSelect(animal.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full flex-col gap-1 border-l-2 px-3 py-3 text-left transition",
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-transparent hover:bg-surface-muted",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-ink">{animal.name}</span>
                      <span className="font-mono text-[11px] font-bold text-primary">
                        {animal.id}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-muted">
                      {animal.latitude.toFixed(4)}, {animal.longitude.toFixed(4)}
                    </span>
                    <span className="text-xs text-primary">
                      {animal.status} · {animal.speedKmh.toFixed(1)} km/jam
                    </span>
                  </button>
                </li>
              );
            })}

            {filteredAnimals.length === 0 ? (
              <li className="p-3 text-sm text-muted">
                Tidak ada data lokasi GPS yang cocok dengan filter.
              </li>
            ) : null}
          </ul>

          <div className="rounded-xl border border-line bg-surface p-3">
            <h3 className="mb-2.5 text-sm font-semibold text-ink">Legenda Zona & Satwa</h3>
            <div className="space-y-1.5 text-xs text-ink-soft">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-warning" /> Jalan Raya
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-forest-primary" /> Koridor Ekologis
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-sage" /> Perkebunan
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-info" /> Permukiman
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-emerald-500" /> Jejak Gerak (10 detik)
              </div>
            </div>

            <p className="mt-2.5 text-xs text-muted">{geoZones.length} zona geografis aktif</p>
            {geoZonesError ? (
              <div className="mt-2 text-xs text-danger">
                Gagal memuat zona geografis.
                <button
                  type="button"
                  onClick={() => void refetchGeoZones()}
                  className="ml-1 font-medium underline"
                >
                  Coba lagi
                </button>
              </div>
            ) : null}
          </div>
        </aside>

        {/* Right main stage: Realistic 3D Mountain + 2D Map + Selected Animal 3D Model & Info */}
        <section className="min-w-0 space-y-4">
          {viewMode === "mountain3d" ? (
            <div className="overflow-hidden rounded-xl border border-primary/25 bg-primary-soft p-1 shadow-sm">
              <LeuserMountain3D
                animals={filteredAnimals}
                selectedAnimalId={selectedAnimalId}
                onSelect={handleSelect}
              />
            </div>
          ) : viewMode === "map2d" ? (
            <div className="overflow-hidden rounded-xl border border-primary/25 bg-primary-soft p-1 shadow-sm">
              <RealMap
                animals={filteredAnimals}
                zones={geoZones}
                selectedAnimalId={selectedAnimalId}
                onSelect={(id) => handleSelect(id)}
              />
            </div>
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-primary/25 bg-primary-soft p-1 shadow-sm">
                <LeuserMountain3D
                  animals={filteredAnimals}
                  selectedAnimalId={selectedAnimalId}
                  onSelect={handleSelect}
                />
              </div>
              <div className="overflow-hidden rounded-xl border border-primary/25 bg-primary-soft p-1 shadow-sm">
                <RealMap
                  animals={filteredAnimals}
                  zones={geoZones}
                  selectedAnimalId={selectedAnimalId}
                  onSelect={(id) => handleSelect(id)}
                />
              </div>
            </div>
          )}

          {selectedAnimal ? (
            <Animal3DDetailPanel
              key={selectedAnimal.id}
              animal={selectedAnimal}
              onClose={() => setSelectedAnimalId(null)}
            />
          ) : (
            <EmptyState
              title="Klik satwa untuk melihat info & model 3D"
              description="Pilih pin satwa pada Gunung Leuser 3D, marker di peta satelit, atau daftar di samping untuk melihat informasi ekologi dan model 3D interaktifnya."
            />
          )}
        </section>
      </div>
    </div>
  );
}
