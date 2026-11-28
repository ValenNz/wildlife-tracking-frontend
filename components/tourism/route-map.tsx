"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

type RouteMapProps = {
  waypoints: [number, number, number][];
  meeting: { lat: number; lon: number; label: string } | null;
};


export function RouteMap({ waypoints, meeting }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const points = waypoints.map(([lat, lon]) => [lat, lon] as [number, number]);
      const center: [number, number] = meeting ? [meeting.lat, meeting.lon] : points[0] ?? [3.55, 98.11];
      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(center, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      if (points.length > 1) {
        const line = L.polyline(points, { color: "#2f5d46", weight: 4, opacity: 0.9, dashArray: "6 6" }).addTo(map);
        map.fitBounds(line.getBounds(), { padding: [24, 24] });
        L.circleMarker(points[points.length - 1], { radius: 6, color: "#fff", weight: 2, fillColor: "#b45309", fillOpacity: 1 })
          .bindTooltip("Titik akhir")
          .addTo(map);
      }

      if (meeting) {
        L.circleMarker([meeting.lat, meeting.lon], { radius: 8, color: "#fff", weight: 2, fillColor: "#1f3d2e", fillOpacity: 1 })
          .bindTooltip(meeting.label)
          .addTo(map);
      }

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [waypoints, meeting]);

  return <div ref={containerRef} className="h-72 w-full overflow-hidden rounded-2xl border border-line" />;
}


export function ElevationProfile({ waypoints }: { waypoints: [number, number, number][] }) {
  if (waypoints.length < 2) return null;

  const elevations = waypoints.map((point) => point[2]);
  const min = Math.min(...elevations);
  const max = Math.max(...elevations);
  const range = Math.max(1, max - min);
  const width = 300;
  const height = 70;
  const step = width / (elevations.length - 1);
  const path = elevations
    .map((value, index) => `${index === 0 ? "M" : "L"}${(index * step).toFixed(1)},${(height - ((value - min) / range) * (height - 10) - 5).toFixed(1)}`)
    .join(" ");

  return (
    <figure className="rounded-2xl border border-line bg-surface-muted p-4">
      <figcaption className="mb-2 flex justify-between text-xs text-muted">
        <span className="font-semibold text-ink">Profil ketinggian</span>
        <span>{min}–{max} m dpl</span>
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-20 w-full" preserveAspectRatio="none" aria-hidden="true">
        <path d={`${path} L${width},${height} L0,${height} Z`} className="fill-primary/15" />
        <path d={path} className="fill-none stroke-primary" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
    </figure>
  );
}
