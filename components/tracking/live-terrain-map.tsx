"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, LngLatBoundsLike, Map as MlMap, Marker } from "maplibre-gl";

import { buildStyle, LEUSER } from "@/components/tourism/route-map-3d";
import { cn } from "@/lib/utils";
import type { GeoZone } from "@/types/geo-zone.type";

export type TrackedAnimal = {
  key: string;
  animalId: number;
  deviceId: number;
  speciesId: number;
  name: string;
  speciesName: string;
  latitude: number;
  longitude: number;
  recordedAt: string;
  isActive: boolean;

  trail: [number, number][];
  speedKmh: number | null;
  headingDeg: number | null;
  batteryLevel: number | null;
  color: string;
};

type Props = {
  animals: TrackedAnimal[];
  zones: GeoZone[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
};

const RELIEF = 1.8 as const;


const ZONE_COLORS: Record<string, string> = {
  permukiman: "#f59e0b",
  perkebunan: "#eab308",
  jalan_raya: "#f97316",
  koridor_ekologis: "#86efac",
  hutan_lindung: "#4ade80",
  zona_inti: "#22c55e",
};

const circlePolygon = (lat: number, lon: number, radiusKm: number): [number, number][] => {
  const points: [number, number][] = [];
  const dLat = radiusKm / 110.574;
  const dLon = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    points.push([lon + dLon * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return points;
};

const zonesGeoJson = (zones: GeoZone[]) => ({
  type: "FeatureCollection" as const,
  features: zones.flatMap((zone) => {
    const properties = { name: zone.zone_name, color: ZONE_COLORS[zone.zone_type] ?? "#e5e7eb" };
    let polygon = zone.polygon_geojson as unknown;
    if (typeof polygon === "string") {
      try {
        polygon = JSON.parse(polygon);
      } catch {
        polygon = null;
      }
    }
    if (polygon && typeof polygon === "object") {
      const geo = polygon as { type?: string; geometry?: unknown; features?: { geometry: unknown }[] };
      if (geo.type === "FeatureCollection" && Array.isArray(geo.features)) {
        return geo.features.map((f) => ({ type: "Feature" as const, properties, geometry: f.geometry as never }));
      }
      if (geo.type === "Feature") return [{ type: "Feature" as const, properties, geometry: geo.geometry as never }];
      if (geo.type === "Polygon" || geo.type === "MultiPolygon") {
        return [{ type: "Feature" as const, properties, geometry: polygon as never }];
      }
    }
    const lat = Number(zone.center_lat);
    const lon = Number(zone.center_lon);
    const radius = Number(zone.radius_km);
    if (zone.center_lat === null || zone.radius_km === null || !Number.isFinite(lat) || !Number.isFinite(lon) || !(radius > 0)) {
      return [];
    }
    return [{ type: "Feature" as const, properties, geometry: { type: "Polygon" as const, coordinates: [circlePolygon(lat, lon, radius)] } }];
  }),
});

const trailsGeoJson = (animals: TrackedAnimal[], selectedKey: string | null) => ({
  type: "FeatureCollection" as const,
  features: animals
    .filter((a) => a.trail.length > 1)
    .map((a) => ({
      type: "Feature" as const,
      properties: { color: a.color, selected: a.key === selectedKey ? 1 : 0 },
      geometry: { type: "LineString" as const, coordinates: a.trail },
    })),
});

function markerElement(animal: TrackedAnimal, onSelect: (key: string) => void) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "live-marker";
  el.setAttribute("aria-label", `${animal.name === animal.key ? animal.speciesName : animal.name} ${animal.key}`);
  el.innerHTML = `<span class="live-marker__dot"></span><span class="live-marker__label"></span>`;
  el.addEventListener("click", (event) => {
    event.stopPropagation();
    onSelect(animal.key);
  });
  return el;
}

function paintMarker(el: HTMLElement, animal: TrackedAnimal, selected: boolean) {
  const dot = el.querySelector<HTMLElement>(".live-marker__dot");
  const label = el.querySelector<HTMLElement>(".live-marker__label");
  if (dot) dot.style.background = animal.isActive ? animal.color : "#9ca3af";
  if (label) label.textContent = animal.key;
  el.dataset.selected = selected ? "true" : "false";
}

export function LiveTerrainMap({ animals, zones, selectedKey, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef(new Map<string, { marker: Marker; from: [number, number]; to: [number, number] }>());
  const fittedRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [relief, setRelief] = useState(true);
  const [basemap, setBasemap] = useState<"hybrid" | "topo">("hybrid");

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;
    (async () => {
      const maplibregl = await import("maplibre-gl");
      maplibregl.setWorkerUrl("/maplibre-gl-worker.js");
      if (cancelled || !containerRef.current) return;
      let map: MlMap;
      try {
        map = new maplibregl.Map({
          container: containerRef.current,
          style: buildStyle("hybrid", false, RELIEF),
          center: LEUSER,
          zoom: 9,
          pitch: 55,
          maxPitch: 75,
          attributionControl: { compact: true },
        });
      } catch {
        setFailed(true);
        return;
      }
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
      map.addControl(new maplibregl.FullscreenControl(), "top-right");
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

      map.on("load", () => {

        containerRef.current?.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
        map.addSource("zones", { type: "geojson", data: zonesGeoJson([]) });
        map.addLayer({ id: "zone-fill", type: "fill", source: "zones", paint: { "fill-color": ["get", "color"], "fill-opacity": 0.12 } });
        map.addLayer({ id: "zone-line", type: "line", source: "zones", paint: { "line-color": ["get", "color"], "line-width": 1.5, "line-dasharray": [3, 2] } });
        map.addSource("trails", { type: "geojson", data: trailsGeoJson([], null) });
        map.addLayer({
          id: "trail-line",
          type: "line",
          source: "trails",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": ["get", "color"],
            "line-width": ["case", ["==", ["get", "selected"], 1], 4, 2.5],
            "line-opacity": ["case", ["==", ["get", "selected"], 1], 1, 0.75],
          },
        });
        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      markers.forEach(({ marker }) => marker.remove());
      markers.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    (map.getSource("zones") as GeoJSONSource | undefined)?.setData(zonesGeoJson(zones));
  }, [zones, ready]);


  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    (map.getSource("trails") as GeoJSONSource | undefined)?.setData(trailsGeoJson(animals, selectedKey));

    let frame = 0;
    let active = true;
    void import("maplibre-gl").then((maplibregl) => {
      if (!active) return;
      const store = markersRef.current;
      const keys = new Set(animals.map((a) => a.key));
      store.forEach((entry, key) => {
        if (!keys.has(key)) {
          entry.marker.remove();
          store.delete(key);
        }
      });

      animals.forEach((animal) => {
        const target: [number, number] = [animal.longitude, animal.latitude];
        const entry = store.get(animal.key);
        if (!entry) {
          const element = markerElement(animal, (key) => onSelectRef.current(key));
          paintMarker(element, animal, animal.key === selectedKey);
          const marker = new maplibregl.Marker({ element, anchor: "center" }).setLngLat(target).addTo(map);
          store.set(animal.key, { marker, from: target, to: target });
          return;
        }
        paintMarker(entry.marker.getElement(), animal, animal.key === selectedKey);
        const current = entry.marker.getLngLat();
        entry.from = [current.lng, current.lat];
        entry.to = target;
      });

      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 1000);
        const ease = t * (2 - t);
        store.forEach(({ marker, from, to }) => {
          marker.setLngLat([from[0] + (to[0] - from[0]) * ease, from[1] + (to[1] - from[1]) * ease]);
        });
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);

      if (!fittedRef.current && animals.length > 0) {
        fittedRef.current = true;
        const lons = animals.map((a) => a.longitude);
        const lats = animals.map((a) => a.latitude);
        const bounds: LngLatBoundsLike = [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ];
        map.fitBounds(bounds, { padding: 80, maxZoom: 12, pitch: relief ? 55 : 0, duration: 0 });
      }
    });

    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- relief hanya dibaca untuk pitch awal
  }, [animals, selectedKey, ready]);

  const animalsRef = useRef(animals);
  useEffect(() => {
    animalsRef.current = animals;
  }, [animals]);
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !selectedKey) return;
    const animal = animalsRef.current.find((a) => a.key === selectedKey);
    if (!animal) return;
    map.flyTo({ center: [animal.longitude, animal.latitude], zoom: 14, duration: 1200, essential: true });
  }, [selectedKey, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setTerrain(relief ? { source: "terrainDem", exaggeration: RELIEF } : null);
    map.easeTo({ pitch: relief ? 55 : 0, duration: 600 });
  }, [relief, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setLayoutProperty("satellite", "visibility", basemap === "hybrid" ? "visible" : "none");
    map.setLayoutProperty("topo", "visibility", basemap === "topo" ? "visible" : "none");
  }, [basemap, ready]);

  if (failed) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center p-6 text-center text-sm text-muted">
        Browser ini tidak mendukung WebGL, jadi peta relief tidak bisa ditampilkan. Daftar posisi satwa tetap tersedia di samping.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" aria-label="Peta posisi satwa di TN Gunung Leuser" />

      <div className="absolute left-3 top-3 flex overflow-hidden rounded-md bg-[#111814]/85 text-xs font-medium text-white shadow-sm ring-1 ring-white/15">
        <MapToggle pressed={basemap === "hybrid"} onClick={() => setBasemap("hybrid")}>Satelit</MapToggle>
        <MapToggle pressed={basemap === "topo"} onClick={() => setBasemap("topo")}>Topografi</MapToggle>
        <span className="w-px bg-white/20" aria-hidden="true" />
        <MapToggle pressed={relief} onClick={() => setRelief((v) => !v)}>Relief 3D</MapToggle>
      </div>

      <style>{`
        .live-marker { display:flex; align-items:center; gap:6px; padding:0; border:0; background:none; cursor:pointer; }
        .live-marker__dot { width:14px; height:14px; border-radius:9999px; border:2px solid #fff; box-shadow:0 0 0 1px rgba(0,0,0,.35); }
        .live-marker__label { font:600 11px/1 ui-sans-serif,system-ui,sans-serif; color:#fff; background:rgba(17,24,20,.78); padding:3px 5px; border-radius:3px; white-space:nowrap; }
        .live-marker[data-selected="true"] .live-marker__dot { width:18px; height:18px; box-shadow:0 0 0 3px rgba(255,255,255,.55), 0 0 0 1px rgba(0,0,0,.4); }
        .live-marker[data-selected="true"] .live-marker__label { background:#fff; color:#111814; }
        .live-marker:focus-visible { outline:2px solid #fff; outline-offset:3px; border-radius:4px; }
      `}</style>
    </div>
  );
}

function MapToggle({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn("px-3 py-2 transition-colors", pressed ? "bg-[#f4f6f2] text-[#111814]" : "text-white/85 hover:bg-white/10")}
    >
      {children}
    </button>
  );
}
