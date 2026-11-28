"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { GeoJSONSource, Map as MlMap, Marker, StyleSpecification } from "maplibre-gl";
import { Compass, Layers, Mountain, Pause, Play, RotateCcw, Square, Tag } from "lucide-react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { cn } from "@/lib/utils";

export type Map3DRoute = {
  id: number;
  name: string;
  color: string;

  waypoints: [number, number, number][];
  meeting?: { lat: number; lon: number; label: string } | null;
};

export type RouteMap3DHandle = { flyThrough: (id: number) => void; stop: () => void; focus: (id: number | null) => void };

export type Basemap = "hybrid" | "topo" | "street";
export type ReliefScale = 1 | 1.8 | 2.5;


const TERRARIUM =
  process.env.NEXT_PUBLIC_MAP_TERRAIN_URL ||
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const SATELLITE =
  process.env.NEXT_PUBLIC_MAP_SATELLITE_URL ||
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const LABELS_OVERLAY =
  process.env.NEXT_PUBLIC_MAP_LABELS_URL ||
  "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const ROADS_OVERLAY =
  process.env.NEXT_PUBLIC_MAP_ROADS_URL ||
  "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";
const TOPO =
  process.env.NEXT_PUBLIC_MAP_TOPO_URL ||
  "https://a.tile.opentopomap.org/{z}/{x}/{y}.png";
const STREET =
  process.env.NEXT_PUBLIC_MAP_STREET_URL ||
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{x}/{y}";
const SATELLITE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_SATELLITE_ATTRIBUTION || "Citra © Esri, Maxar, Earthstar Geographics";
const DEFAULT_EXAGGERATION: ReliefScale = 1.8;

export const LEUSER: [number, number] = [97.6, 3.75];

export const buildStyle = (basemap: Basemap, showLabels: boolean, exaggeration: ReliefScale): StyleSpecification => ({
  version: 8,
  sources: {
    satellite: { type: "raster", tiles: [SATELLITE], tileSize: 256, maxzoom: 18, attribution: SATELLITE_ATTRIBUTION },
    roadsOverlay: { type: "raster", tiles: [ROADS_OVERLAY], tileSize: 256, maxzoom: 18 },
    labelsOverlay: { type: "raster", tiles: [LABELS_OVERLAY], tileSize: 256, maxzoom: 18 },
    topo: { type: "raster", tiles: [TOPO], tileSize: 256, maxzoom: 17, attribution: "© OpenTopoMap (CC-BY-SA)" },
    street: { type: "raster", tiles: [STREET], tileSize: 256, maxzoom: 19, attribution: "© OpenStreetMap contributors, © CARTO" },
    terrainDem: {
      type: "raster-dem",
      tiles: [TERRARIUM],
      encoding: "terrarium",
      tileSize: 256,
      maxzoom: 15,
      attribution: "Elevasi: Mapzen Terrain Tiles (AWS Open Data)",
    },
    hillshadeDem: { type: "raster-dem", tiles: [TERRARIUM], encoding: "terrarium", tileSize: 256, maxzoom: 15 },
  },
  layers: [
    { id: "satellite", type: "raster", source: "satellite", layout: { visibility: basemap === "hybrid" ? "visible" : "none" } },
    {
      id: "roadsOverlay",
      type: "raster",
      source: "roadsOverlay",
      layout: { visibility: basemap === "hybrid" && showLabels ? "visible" : "none" },
      paint: { "raster-opacity": 0.75 },
    },
    {
      id: "labelsOverlay",
      type: "raster",
      source: "labelsOverlay",
      layout: { visibility: basemap === "hybrid" && showLabels ? "visible" : "none" },
      paint: { "raster-opacity": 0.92 },
    },
    { id: "topo", type: "raster", source: "topo", layout: { visibility: basemap === "topo" ? "visible" : "none" } },
    { id: "street", type: "raster", source: "street", layout: { visibility: basemap === "street" ? "visible" : "none" } },
    {
      id: "hillshade",
      type: "hillshade",
      source: "hillshadeDem",
      paint: {
        "hillshade-shadow-color": "#0e1d14",
        "hillshade-highlight-color": "#ffffff",
        "hillshade-exaggeration": basemap === "hybrid" ? 0.38 : 0.25,
      },
    },
  ],
  terrain: { source: "terrainDem", exaggeration },
  sky: {
    "sky-color": "#7cb5db",
    "horizon-color": "#dceae3",
    "fog-color": "#d2e1d9",
    "sky-horizon-blend": 0.55,
    "horizon-fog-blend": 0.65,
    "fog-ground-blend": 0.3,
  },
});

const toLngLat = ([lat, lon]: [number, number, number]): [number, number] => [lon, lat];

const distance = (a: [number, number], b: [number, number]) => {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
};

const bearing = (a: [number, number], b: [number, number]) => {
  const rad = Math.PI / 180;
  const y = Math.sin((b[0] - a[0]) * rad) * Math.cos(b[1] * rad);
  const x = Math.cos(a[1] * rad) * Math.sin(b[1] * rad) - Math.sin(a[1] * rad) * Math.cos(b[1] * rad) * Math.cos((b[0] - a[0]) * rad);
  return (Math.atan2(y, x) / rad + 360) % 360;
};


const pointAt = (points: [number, number, number][], cumulative: number[], d: number) => {
  let index = cumulative.findIndex((value) => value >= d);
  if (index <= 0) index = 1;
  const span = cumulative[index] - cumulative[index - 1] || 1;
  const t = Math.min(1, Math.max(0, (d - cumulative[index - 1]) / span));
  const [lat1, lon1, e1] = points[index - 1];
  const [lat2, lon2, e2] = points[index];
  return { lngLat: [lon1 + (lon2 - lon1) * t, lat1 + (lat2 - lat1) * t] as [number, number], elevation: e1 + (e2 - e1) * t };
};

const routesGeoJson = (routes: Map3DRoute[]) => ({
  type: "FeatureCollection" as const,
  features: routes
    .filter((route) => route.waypoints.length > 1)
    .map((route) => ({
      type: "Feature" as const,
      properties: { id: route.id, color: route.color, name: route.name },
      geometry: { type: "LineString" as const, coordinates: route.waypoints.map(toLngLat) },
    })),
});

export const RouteMap3D = forwardRef<
  RouteMap3DHandle,
  { routes: Map3DRoute[]; selectedId?: number | null; onSelect?: (id: number) => void; className?: string }
>(function RouteMap3D({ routes, selectedId = null, onSelect, className }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const detailMarkersRef = useRef<Marker[]>([]);
  const hikerRef = useRef<Marker | null>(null);
  const frameRef = useRef<number | null>(null);
  const routesRef = useRef(routes);
  const onSelectRef = useRef(onSelect);
  const tileErrorsRef = useRef(0);
  const pausedRef = useRef(false);
  const speedRef = useRef<1 | 2>(1);
  const elapsedRef = useRef(0);
  const lastTickRef = useRef(0);

  const [ready, setReady] = useState(false);
  const { t } = usePreferences();
  const [failed, setFailed] = useState<string | null>(null);
  const [tilesWarning, setTilesWarning] = useState(false);
  const [basemap, setBasemap] = useState<Basemap>("hybrid");
  const [showLabels, setShowLabels] = useState(true);
  const [terrainOn, setTerrainOn] = useState(true);
  const [reliefScale, setReliefScale] = useState<ReliefScale>(DEFAULT_EXAGGERATION);
  const [cursorHud, setCursorHud] = useState<{ lat: number; lon: number; elevation: number | null } | null>(null);
  const [flying, setFlying] = useState<{
    name: string;
    elevation: number;
    distanceKm: number;
    totalKm: number;
    progress: number;
    paused: boolean;
    speed: 1 | 2;
  } | null>(null);

  useEffect(() => {
    routesRef.current = routes;
    onSelectRef.current = onSelect;
  });

  const fitTo = useCallback((id: number | null, animate = true) => {
    const map = mapRef.current;
    if (!map) return;
    const list = routesRef.current.filter((route) => (id ? route.id === id : true));
    const points = list.flatMap((route) => [
      ...route.waypoints.map(toLngLat),
      ...(route.meeting ? [[route.meeting.lon, route.meeting.lat] as [number, number]] : []),
    ]);
    if (points.length === 0) return;
    const lons = points.map((point) => point[0]);
    const lats = points.map((point) => point[1]);
    map.fitBounds(
      [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ],
      { padding: 70, pitch: 62, bearing: -25, duration: animate ? 1500 : 0, maxZoom: 15.5 },
    );
  }, []);

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    pausedRef.current = false;
    hikerRef.current?.remove();
    hikerRef.current = null;
    setFlying(null);
  }, []);

  const flyThrough = useCallback(
    async (id: number) => {
      const map = mapRef.current;
      const route = routesRef.current.find((item) => item.id === id);
      if (!map || !route || route.waypoints.length < 2) return;
      stop();

      const maplibregl = await import("maplibre-gl");
      const points = route.waypoints;
      const cumulative = [0];
      for (let i = 1; i < points.length; i++) {
        cumulative.push(cumulative[i - 1] + distance(toLngLat(points[i - 1]), toLngLat(points[i])));
      }
      const total = cumulative[cumulative.length - 1];
      const totalKm = Math.max(0.1, total / 1000);
      const duration = Math.min(42_000, Math.max(12_000, total * 12));

      const dot = document.createElement("div");
      dot.className = "size-4 rounded-full border-2 border-white shadow-lg ring-4 ring-white/40";
      dot.style.background = route.color;
      hikerRef.current = new maplibregl.Marker({ element: dot }).setLngLat(toLngLat(points[0])).addTo(map);

      let smoothBearing = bearing(toLngLat(points[0]), toLngLat(points[1]));
      elapsedRef.current = 0;
      lastTickRef.current = performance.now();

      const step = (now: number) => {
        const dt = now - lastTickRef.current;
        lastTickRef.current = now;
        if (!pausedRef.current) {
          elapsedRef.current += dt * speedRef.current;
        }
        const progress = Math.min(1, elapsedRef.current / duration);
        const coveredMeters = progress * total;
        const here = pointAt(points, cumulative, coveredMeters);
        const ahead = pointAt(points, cumulative, Math.min(total, coveredMeters + Math.max(60, total * 0.05)));
        const target = bearing(here.lngLat, ahead.lngLat);
        const delta = ((target - smoothBearing + 540) % 360) - 180;
        if (!pausedRef.current) {
          smoothBearing = (smoothBearing + delta * 0.05 + 360) % 360;
          map.jumpTo({ center: here.lngLat, bearing: smoothBearing, pitch: 72, zoom: 15.6 });
          hikerRef.current?.setLngLat(here.lngLat);
        }
        setFlying({
          name: route.name,
          elevation: Math.round(here.elevation),
          distanceKm: Number((coveredMeters / 1000).toFixed(2)),
          totalKm: Number(totalKm.toFixed(2)),
          progress,
          paused: pausedRef.current,
          speed: speedRef.current,
        });

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(step);
        } else {
          frameRef.current = null;
          window.setTimeout(() => {
            hikerRef.current?.remove();
            hikerRef.current = null;
            setFlying(null);
            fitTo(id);
          }, 800);
        }
      };

      map.easeTo({ center: toLngLat(points[0]), zoom: 15.6, pitch: 72, bearing: smoothBearing, duration: 1400 });
      window.setTimeout(() => {
        lastTickRef.current = performance.now();
        frameRef.current = requestAnimationFrame(step);
      }, 1400);
    },
    [fitTo, stop],
  );

  useImperativeHandle(ref, () => ({ flyThrough: (id) => void flyThrough(id), stop, focus: (id) => fitTo(id) }), [fitTo, flyThrough, stop]);


  useEffect(() => {
    let cancelled = false;
    (async () => {
      const maplibregl = await import("maplibre-gl");
      maplibregl.setWorkerUrl("/maplibre-gl-worker.js");
      if (cancelled || !containerRef.current) return;
      let map: MlMap;
      try {
        map = new maplibregl.Map({
          container: containerRef.current,
          style: buildStyle("hybrid", true, DEFAULT_EXAGGERATION),
          center: LEUSER,
          zoom: 9,
          pitch: 58,
          maxPitch: 82,
          attributionControl: { compact: true },
        });
      } catch {
        setFailed("Browser ini tidak mendukung WebGL sehingga peta 3D tidak dapat ditampilkan. Gunakan peta 2D di halaman detail rute.");
        return;
      }
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
      map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false }), "top-right");
      map.addControl(new maplibregl.FullscreenControl(), "top-right");
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

      map.on("error", (event) => {
        if ("tile" in event || "sourceId" in event) {
          tileErrorsRef.current += 1;
          if (tileErrorsRef.current === 4) setTilesWarning(true);
        }
      });

      map.on("mousedown", stop);
      map.on("touchstart", stop);
      map.on("wheel", stop);

      map.on("mousemove", (event) => {
        const elev = map.queryTerrainElevation(event.lngLat);
        setCursorHud({
          lat: Number(event.lngLat.lat.toFixed(5)),
          lon: Number(event.lngLat.lng.toFixed(5)),
          elevation: elev !== null && Number.isFinite(elev) ? Math.round(elev) : null,
        });
      });
      map.on("mouseout", () => setCursorHud(null));

      map.on("load", () => {
        try {
          map.setProjection({ type: "globe" });
        } catch {

        }
        map.addSource("routes", { type: "geojson", data: routesGeoJson(routesRef.current) });
        map.addLayer({
          id: "route-shadow",
          type: "line",
          source: "routes",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#09130d", "line-width": 11, "line-opacity": 0.35, "line-blur": 3 },
        });
        map.addLayer({
          id: "route-casing",
          type: "line",
          source: "routes",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.9 },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "routes",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ["get", "color"], "line-width": 4.5 },
        });
        map.on("click", "route-line", (event) => {
          const id = Number(event.features?.[0]?.properties?.id);
          if (id) onSelectRef.current?.(id);
        });
        map.on("mouseenter", "route-line", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "route-line", () => (map.getCanvas().style.cursor = ""));
        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      markersRef.current.forEach((marker) => marker.remove());
      detailMarkersRef.current.forEach((marker) => marker.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [stop]);


  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    (map.getSource("routes") as GeoJSONSource | undefined)?.setData(routesGeoJson(routes));

    let active = true;
    void import("maplibre-gl").then((maplibregl) => {
      if (!active) return;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = routes
        .filter((route) => route.meeting)
        .map((route) => {
          const element = document.createElement("button");
          element.type = "button";
          element.className = "rounded-full border-2 border-white px-2.5 py-0.5 text-[11px] font-bold text-white shadow-lg transition hover:scale-105";
          element.style.background = route.color;
          element.textContent = route.name.length > 26 ? `${route.name.slice(0, 24)}…` : route.name;
          element.title = route.meeting?.label ?? route.name;
          element.addEventListener("click", () => onSelectRef.current?.(route.id));
          return new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat([route.meeting!.lon, route.meeting!.lat]).addTo(map);
        });
      fitTo(selectedId, false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedId sengaja tidak memicu efek ini
  }, [ready, routes, fitTo]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setPaintProperty("route-line", "line-opacity", selectedId ? ["case", ["==", ["get", "id"], selectedId], 1, 0.32] : 1);
    map.setPaintProperty("route-line", "line-width", selectedId ? ["case", ["==", ["get", "id"], selectedId], 6.5, 3.5] : 4.5);

    detailMarkersRef.current.forEach((marker) => marker.remove());
    detailMarkersRef.current = [];

    if (selectedId) {
      fitTo(selectedId);
      const selectedRoute = routes.find((r) => r.id === selectedId);
      if (selectedRoute && selectedRoute.waypoints.length >= 2) {
        let active = true;
        void import("maplibre-gl").then((maplibregl) => {
          if (!active) return;
          const startWp = selectedRoute.waypoints[0];
          const peakWp = selectedRoute.waypoints.reduce((best, cur) => (cur[2] > best[2] ? cur : best), selectedRoute.waypoints[0]);

          const createBadge = (text: string, bg: string) => {
            const el = document.createElement("div");
            el.className = "rounded-lg border border-white px-2 py-0.5 text-[10px] font-bold text-white shadow-md";
            el.style.background = bg;
            el.textContent = text;
            return el;
          };

          detailMarkersRef.current = [
            new maplibregl.Marker({ element: createBadge(`Mulai · ${Math.round(startWp[2])} mdpl`, "#14532d"), anchor: "top" })
              .setLngLat(toLngLat(startWp))
              .addTo(map),
            new maplibregl.Marker({ element: createBadge(`Puncak · ${Math.round(peakWp[2])} mdpl`, "#b45309"), anchor: "bottom" })
              .setLngLat(toLngLat(peakWp))
              .addTo(map),
          ];
        });
        return () => {
          active = false;
        };
      }
    }
  }, [ready, selectedId, routes, fitTo]);

  const switchBasemap = (value: Basemap) => {
    setBasemap(value);
    const map = mapRef.current;
    if (!map) return;
    map.setLayoutProperty("satellite", "visibility", value === "hybrid" ? "visible" : "none");
    map.setLayoutProperty("roadsOverlay", "visibility", value === "hybrid" && showLabels ? "visible" : "none");
    map.setLayoutProperty("labelsOverlay", "visibility", value === "hybrid" && showLabels ? "visible" : "none");
    map.setLayoutProperty("topo", "visibility", value === "topo" ? "visible" : "none");
    map.setLayoutProperty("street", "visibility", value === "street" ? "visible" : "none");
    map.setPaintProperty("hillshade", "hillshade-exaggeration", value === "hybrid" ? 0.38 : 0.25);
  };

  const toggleLabels = () => {
    const next = !showLabels;
    setShowLabels(next);
    const map = mapRef.current;
    if (!map) return;
    const vis = basemap === "hybrid" && next ? "visible" : "none";
    map.setLayoutProperty("roadsOverlay", "visibility", vis);
    map.setLayoutProperty("labelsOverlay", "visibility", vis);
  };

  const toggleTerrain = () => {
    const map = mapRef.current;
    if (!map) return;
    const next = !terrainOn;
    setTerrainOn(next);
    map.setTerrain(next ? { source: "terrainDem", exaggeration: reliefScale } : null);
    map.easeTo({ pitch: next ? 62 : 0, duration: 800 });
  };

  const changeReliefScale = (scale: ReliefScale) => {
    setReliefScale(scale);
    const map = mapRef.current;
    if (!map || !terrainOn) return;
    map.setTerrain({ source: "terrainDem", exaggeration: scale });
  };

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setFlying((prev) => (prev ? { ...prev, paused: pausedRef.current } : prev));
  };

  const toggleSpeed = () => {
    speedRef.current = speedRef.current === 1 ? 2 : 1;
    setFlying((prev) => (prev ? { ...prev, speed: speedRef.current } : prev));
  };

  if (failed) {
    return <div className={cn("flex items-center justify-center rounded-2xl border border-line bg-surface-muted p-6 text-center text-sm text-muted", className)}>{failed}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-line bg-forest-black", className)}>

      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute left-3 top-3 flex max-w-[calc(100%-4rem)] flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-xl bg-surface/95 text-xs font-semibold shadow backdrop-blur">
          {(
            [
              { id: "hybrid", label: t("mapSatellite") },
              { id: "topo", label: t("mapTopo") },
              { id: "street", label: t("mapStreet") },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => switchBasemap(id)}
              className={cn("inline-flex items-center gap-1.5 px-3 py-2 transition", basemap === id ? "bg-primary text-white" : "text-ink-soft hover:bg-surface-muted")}
            >
              <Layers className="size-3.5" /> {label}
            </button>
          ))}
        </div>

        {basemap === "hybrid" ? (
          <button
            type="button"
            onClick={toggleLabels}
            aria-pressed={showLabels}
            className={cn("inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow backdrop-blur transition", showLabels ? "bg-primary text-white" : "bg-surface/95 text-ink-soft")}
          >
            <Tag className="size-3.5" /> {t("mapLabels")}
          </button>
        ) : null}

        <button
          type="button"
          onClick={toggleTerrain}
          aria-pressed={terrainOn}
          className={cn("inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow backdrop-blur transition", terrainOn ? "bg-primary text-white" : "bg-surface/95 text-ink-soft")}
        >
          <Mountain className="size-3.5" /> {t("mapRelief")}
        </button>

        {terrainOn ? (
          <div className="flex overflow-hidden rounded-xl bg-surface/95 text-[11px] font-semibold shadow backdrop-blur" aria-label="Skala relief">
            {([1, 1.8, 2.5] as const).map((scale) => (
              <button
                key={scale}
                type="button"
                onClick={() => changeReliefScale(scale)}
                className={cn("px-2.5 py-2 transition", reliefScale === scale ? "bg-primary text-white" : "text-ink-soft hover:bg-surface-muted")}
              >
                {scale}×
              </button>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => fitTo(selectedId, true)}
          title={t("mapReset")}
          className="inline-flex items-center gap-1.5 rounded-xl bg-surface/95 px-3 py-2 text-xs font-semibold text-ink-soft shadow backdrop-blur hover:bg-surface"
        >
          <RotateCcw className="size-3.5" /> {t("mapReset")}
        </button>
      </div>

      {cursorHud ? (
        <div className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-2 rounded-xl bg-forest-black/80 px-3 py-1.5 font-mono text-[11px] text-white shadow backdrop-blur sm:flex">
          <Compass className="size-3.5 text-primary-soft" />
          <span>{cursorHud.lat}, {cursorHud.lon}</span>
          {cursorHud.elevation !== null ? <span className="border-l border-white/25 pl-2 font-semibold">{cursorHud.elevation} mdpl</span> : null}
        </div>
      ) : null}

      {flying ? (
        <div className="absolute inset-x-3 bottom-10 mx-auto max-w-lg rounded-2xl bg-forest-black/85 p-3 text-white shadow-xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="truncate font-semibold">{flying.name}</span>
            <div className="flex items-center gap-2">
              <span className="tabular-nums text-white/80">{flying.distanceKm} / {flying.totalKm} km</span>
              <span className="rounded bg-white/15 px-1.5 py-0.5 tabular-nums font-semibold">{flying.elevation} mdpl</span>
              <button type="button" onClick={toggleSpeed} className="rounded-lg bg-white/15 px-2 py-1 font-semibold hover:bg-white/25">
                {flying.speed}×
              </button>
              <button type="button" onClick={togglePause} className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 font-semibold hover:bg-white/25">
                {flying.paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                {flying.paused ? t("mapResume") : t("mapPause")}
              </button>
              <button type="button" onClick={stop} className="inline-flex items-center gap-1 rounded-lg bg-danger/80 px-2 py-1 font-semibold hover:bg-danger">
                <Square className="size-3" /> {t("mapStop")}
              </button>
            </div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div className="h-full bg-white transition-all duration-100" style={{ width: `${flying.progress * 100}%` }} />
          </div>
        </div>
      ) : selectedId && routes.find((route) => route.id === selectedId)?.waypoints.length ? (
        <button
          type="button"
          onClick={() => void flyThrough(selectedId)}
          className="absolute bottom-10 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-bold text-primary shadow-lg hover:bg-surface-muted"
        >
          <Play className="size-4" /> {t("mapFlyStart")}
        </button>
      ) : null}

      {tilesWarning ? (
        <p className="absolute right-3 top-36 max-w-60 rounded-xl bg-white/95 p-2.5 text-[11px] leading-4 text-ink-soft shadow">
          Sebagian citra/elevasi gagal dimuat. Periksa koneksi internet; jalur & titik kumpul tetap ditampilkan.
        </p>
      ) : null}
    </div>
  );
});
