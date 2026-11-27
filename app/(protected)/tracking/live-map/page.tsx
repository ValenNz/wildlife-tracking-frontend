"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";

import { AnimalDetail, relativeTime } from "@/components/tracking/animal-detail";
import type { TrackedAnimal } from "@/components/tracking/live-terrain-map";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import { useTrackingDevices } from "@/hooks/use-devices";
import { useGeoZones } from "@/hooks/use-geo-zones";
import { useGpsReadings } from "@/hooks/use-tracking";
import { cn } from "@/lib/utils";
import { toApiErrorState } from "@/services/api";
import type { GpsReading } from "@/types/tracking.type";

const LiveTerrainMap = dynamic(
  () => import("@/components/tracking/live-terrain-map").then((mod) => mod.LiveTerrainMap),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-surface-muted" /> },
);

const REFRESH_MS = 10_000;
/** Titik yang lebih tua dari ini tidak lagi dianggap "live". */
const LIVE_WINDOW_MS = 60_000;
const TRAIL_WINDOW_MS = 15 * 60_000;
const TRAIL_MAX_POINTS = 90;

/** Warna per spesies — cukup kontras di atas citra satelit hijau tua. */
const SPECIES_COLORS = ["#f97316", "#facc15", "#38bdf8", "#f472b6", "#a78bfa", "#fb7185", "#2dd4bf", "#fde68a"];

const toNumber = (value: number | string | null | undefined) => {
  const n = Number(value);
  return value === null || value === undefined || !Number.isFinite(n) ? null : n;
};

const distanceM = (a: [number, number], b: [number, number]) => {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
};

const bearingDeg = (a: [number, number], b: [number, number]) => {
  const rad = Math.PI / 180;
  const y = Math.sin((b[0] - a[0]) * rad) * Math.cos(b[1] * rad);
  const x = Math.cos(a[1] * rad) * Math.sin(b[1] * rad) - Math.sin(a[1] * rad) * Math.cos(b[1] * rad) * Math.cos((b[0] - a[0]) * rad);
  return (Math.atan2(y, x) / rad + 360) % 360;
};

export default function LiveMapPage() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [speciesId, setSpeciesId] = useState("all");
  const [onlyActive, setOnlyActive] = useState(true);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const devicesQuery = useTrackingDevices();
  const readingsQuery = useGpsReadings(undefined, { refetchInterval: paused ? false : REFRESH_MS });
  const zonesQuery = useGeoZones();

  // Jam 1 detik untuk teks "x dtk lalu".
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const devices = useMemo(() => devicesQuery.data?.data ?? [], [devicesQuery.data]);

  const animals = useMemo<TrackedAnimal[]>(() => {
    const byDevice = new Map<number, GpsReading[]>();
    for (const reading of readingsQuery.data?.data ?? []) {
      const list = byDevice.get(reading.device_id);
      if (list) list.push(reading);
      else byDevice.set(reading.device_id, [reading]);
    }

    const speciesOrder = [...new Set(devices.map((d) => d.animal?.species_id).filter((id): id is number => id != null))].sort((a, b) => a - b);

    return devices.flatMap((device) => {
      const animal = device.animal;
      if (!animal || device.animal_id === null) return [];

      const readings = (byDevice.get(device.device_id) ?? [])
        .map((r) => ({ lat: toNumber(r.latitude), lon: toNumber(r.longitude), at: new Date(r.recorded_at).getTime(), iso: r.recorded_at }))
        .filter((r): r is { lat: number; lon: number; at: number; iso: string } => r.lat !== null && r.lon !== null && Number.isFinite(r.at))
        .sort((a, b) => b.at - a.at);
      const latest = readings[0];
      if (!latest) return [];

      const recent = readings.filter((r) => latest.at - r.at <= TRAIL_WINDOW_MS).slice(0, TRAIL_MAX_POINTS);
      const trail = recent.map((r) => [r.lon, r.lat] as [number, number]).reverse();

      let speedKmh: number | null = null;
      let headingDeg: number | null = null;
      const previous = readings[1];
      if (previous && latest.at - previous.at <= LIVE_WINDOW_MS && latest.at > previous.at) {
        const a: [number, number] = [previous.lon, previous.lat];
        const b: [number, number] = [latest.lon, latest.lat];
        const meters = distanceM(a, b);
        speedKmh = (meters / ((latest.at - previous.at) / 1000)) * 3.6;
        headingDeg = meters > 0.5 ? bearingDeg(a, b) : null;
      }

      const speciesIndex = speciesOrder.indexOf(animal.species_id);
      return [
        {
          key: animal.animal_code ?? `SAT-${animal.animal_id}`,
          animalId: animal.animal_id,
          deviceId: device.device_id,
          speciesId: animal.species_id,
          name: animal.name_animal || animal.name || animal.animal_code || `Satwa #${animal.animal_id}`,
          speciesName: animal.species?.common_name ?? "Spesies tidak diketahui",
          latitude: latest.lat,
          longitude: latest.lon,
          recordedAt: latest.iso,
          isActive: device.is_active === true && Boolean(animal.is_active),
          trail,
          speedKmh,
          headingDeg,
          batteryLevel: device.battery_level,
          color: SPECIES_COLORS[(speciesIndex < 0 ? 0 : speciesIndex) % SPECIES_COLORS.length],
        },
      ];
    });
  }, [devices, readingsQuery.data]);

  const speciesOptions = useMemo(() => {
    const map = new Map<number, { name: string; color: string }>();
    animals
      .filter((a) => !onlyActive || a.isActive)
      .forEach((a) => map.set(a.speciesId, { name: a.speciesName, color: a.color }));
    return [...map.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => a.name.localeCompare(b.name));
  }, [animals, onlyActive]);

  const visible = useMemo(
    () =>
      animals
        .filter((a) => (speciesId === "all" || a.speciesId === Number(speciesId)) && (!onlyActive || a.isActive))
        .sort((a, b) => a.speciesName.localeCompare(b.speciesName) || a.key.localeCompare(b.key)),
    [animals, speciesId, onlyActive],
  );

  const selected = visible.find((a) => a.key === selectedKey) ?? null;
  const handleSelect = useCallback((key: string) => {
    setSelectedKey(key);
    // Di ponsel panel detail berada di bawah peta; bawa ke layar.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => document.getElementById("live-map-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, []);

  if (devicesQuery.isLoading || readingsQuery.isLoading) {
    return <Loading label="Memuat posisi satwa…" />;
  }

  if (devicesQuery.error || readingsQuery.error) {
    const apiError = toApiErrorState(devicesQuery.error ?? readingsQuery.error);
    return (
      <ErrorState
        kind={apiError.kind}
        message={apiError.message}
        status={apiError.status}
        errors={apiError.errors}
        onRetry={() => {
          void devicesQuery.refetch();
          void readingsQuery.refetch();
        }}
      />
    );
  }

  const liveCount = visible.filter((a) => now - new Date(a.recordedAt).getTime() <= LIVE_WINDOW_MS).length;
  const fetchedAt = readingsQuery.dataUpdatedAt;

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Pelacakan"
        title="Live Map"
        description="Posisi kalung GPS satwa di TN Gunung Leuser. Pilih satwa untuk melihat profil spesies dan model 3D-nya."
        actions={
          <div className="flex items-center gap-3 text-[13px] text-muted">
            <span aria-live="polite">
              {paused ? "Pembaruan dijeda" : "Diperbarui tiap 10 detik"}
              {fetchedAt ? ` · terakhir ${new Date(fetchedAt).toLocaleTimeString("id-ID")}` : ""}
            </span>
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 font-medium text-ink hover:bg-surface-muted"
            >
              {paused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
              {paused ? "Lanjutkan" : "Jeda"}
            </button>
          </div>
        }
        className="mb-4"
      />

      <div className="grid overflow-hidden rounded-lg border border-line bg-surface lg:h-[calc(100dvh-13rem)] lg:min-h-[560px] lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="order-1 h-[60dvh] min-h-[360px] lg:order-2 lg:h-full">
          <LiveTerrainMap animals={visible} zones={zonesQuery.data ?? []} selectedKey={selected?.key ?? null} onSelect={handleSelect} />
        </div>

        <aside id="live-map-panel" className="order-2 scroll-mt-16 min-h-0 overflow-y-auto border-t border-line lg:order-1 lg:border-r lg:border-t-0">
          {selected ? (
            <AnimalDetail key={selected.key} animal={selected} now={now} onBack={() => setSelectedKey(null)} />
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b border-line p-4">
                <div className="flex items-end gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <label htmlFor="map-species" className="text-[13px] text-muted">
                      Spesies
                    </label>
                    <select
                      id="map-species"
                      value={speciesId}
                      onChange={(event) => setSpeciesId(event.target.value)}
                      className="ui-input h-9 py-0 text-[13px]"
                    >
                      <option value="all">Semua spesies</option>
                      {speciesOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex h-9 items-center gap-2 text-[13px] text-ink-soft">
                    <input
                      type="checkbox"
                      checked={onlyActive}
                      onChange={(event) => setOnlyActive(event.target.checked)}
                      className="size-4"
                    />
                    Aktif saja
                  </label>
                </div>
                <p className="text-[13px] text-muted">
                  {visible.length} satwa · {liveCount} mengirim data dalam 1 menit terakhir
                </p>
              </div>

              {visible.length === 0 ? (
                <p className="p-4 text-[13px] text-muted">
                  {animals.length === 0
                    ? "Belum ada kalung GPS yang terpasang pada satwa dan mengirim titik lokasi."
                    : "Tidak ada satwa yang cocok dengan filter ini."}
                </p>
              ) : (
                <ul>
                  {visible.map((animal) => {
                    const live = now - new Date(animal.recordedAt).getTime() <= LIVE_WINDOW_MS;
                    return (
                      <li key={animal.key} className="border-b border-line last:border-b-0">
                        <button
                          type="button"
                          onClick={() => handleSelect(animal.key)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-muted focus-visible:bg-surface-muted"
                        >
                          <span
                            aria-hidden="true"
                            className="size-2.5 shrink-0 rounded-full ring-1 ring-black/20"
                            style={{ background: animal.isActive ? animal.color : "#9ca3af" }}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-baseline justify-between gap-2">
                              <span className="truncate text-sm font-medium text-ink">
                                {animal.name === animal.key ? animal.speciesName : animal.name}
                              </span>
                              <span className="shrink-0 font-mono text-xs text-muted">{animal.key}</span>
                            </span>
                            <span className="flex items-baseline justify-between gap-2 text-xs text-muted">
                              <span className="truncate">{animal.name === animal.key ? `Kalung #${animal.deviceId}` : animal.speciesName}</span>
                              <span className={cn("shrink-0 tabular-nums", live && "text-success")}>
                                {relativeTime(animal.recordedAt, now)}
                              </span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {speciesOptions.length > 0 ? (
                <div className="border-t border-line p-4 text-xs text-muted">
                  <p className="mb-2 font-medium text-ink-soft">Keterangan</p>
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {speciesOptions.map((s) => (
                      <li key={s.id} className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full ring-1 ring-black/20" style={{ background: s.color }} />
                        <span className="truncate">{s.name}</span>
                      </li>
                    ))}
                    <li className="flex items-center gap-2">
                      <span className="h-0 w-3 border-t-2 border-dashed border-[#f59e0b]" /> Zona rawan
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-0 w-3 border-t-2 border-dashed border-[#22c55e]" /> Zona lindung
                    </li>
                  </ul>
                  {zonesQuery.error ? (
                    <p className="mt-2 text-danger">
                      Zona gagal dimuat.{" "}
                      <button type="button" onClick={() => void zonesQuery.refetch()} className="underline">
                        Coba lagi
                      </button>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
