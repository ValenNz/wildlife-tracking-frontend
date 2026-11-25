"use client";

import Link from "next/link";
import { useState } from "react";
import { Crosshair } from "lucide-react";

import { Button } from "@/components/button";
import { FormField, TextInput } from "@/components/form";
import { Panel, SectionHeader } from "@/components/ui/panel";
import {
  useGeoZoneAnimals,
  useGeoZoneDevices,
  useLocateGeoZones,
} from "@/hooks/use-geo-zones";
import { useGeoZoneVisits } from "@/hooks/use-zone-visits";
import { DEVICE_TYPE_LABELS, type DeviceType } from "@/types/device.type";
import { formatDateTime } from "@/utils/format";

/** Isi zona: satwa di dalamnya, perangkat terpasang, riwayat kunjungan (GET /geo-zones/{id}/...). */
export function ZoneContents({ zoneId }: { zoneId: number }) {
  const animals = useGeoZoneAnimals(zoneId);
  const devices = useGeoZoneDevices(zoneId);
  const visitsQuery = useGeoZoneVisits(zoneId);
  const visits = { data: visitsQuery.data?.data };

  return (
    <div className="grid gap-4 text-sm sm:grid-cols-3">
      <div>
        <p className="mb-1 text-xs font-semibold text-muted">Satwa di dalam zona</p>
        {(animals.data ?? []).length === 0 ? (
          <p className="text-muted">Tidak ada.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {(animals.data ?? []).map((animal) => (
              <li key={animal.animal_id}>
                <Link href={`/animals/${animal.animal_id}/detail`} className="font-semibold text-primary underline-offset-2 hover:underline">
                  {animal.name_animal}
                </Link>{" "}
                <span className="text-xs text-muted">{animal.species?.common_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-muted">Perangkat</p>
        {(devices.data ?? []).length === 0 ? (
          <p className="text-muted">Tidak ada.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {(devices.data ?? []).map((device) => (
              <li key={device.device_id}>
                <Link href={`/devices/${device.device_id}/detail`} className="text-primary underline-offset-2 hover:underline">
                  {device.model}
                </Link>{" "}
                <span className="text-xs text-muted">
                  {DEVICE_TYPE_LABELS[device.device_type as DeviceType] ?? device.device_type}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-muted">Kunjungan terakhir</p>
        {(visits.data ?? []).length === 0 ? (
          <p className="text-muted">Belum ada.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {(visits.data ?? []).slice(0, 6).map((visit) => (
              <li key={visit.visit_id} className="text-xs text-ink-soft">
                {visit.animal?.name_animal ?? "-"}: {formatDateTime(visit.entered_at)}
                {visit.exited_at ? "" : " (masih di dalam)"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** GET /geo-zones/locate: zona mana yang memuat sebuah koordinat. */
export function ZoneLocator() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [point, setPoint] = useState<{ lat: number; lon: number } | null>(null);
  const result = useLocateGeoZones(point);

  return (
    <Panel>
      <SectionHeader title="Cek Koordinat" description="Cari zona yang memuat sebuah titik, mis. lokasi temuan di lapangan." />
      <div className="flex flex-wrap items-end gap-2">
        <FormField label="Lintang" htmlFor="loc-lat" className="w-36">
          <TextInput id="loc-lat" inputMode="decimal" placeholder="3.6714" value={lat} onChange={(event) => setLat(event.target.value)} />
        </FormField>
        <FormField label="Bujur" htmlFor="loc-lon" className="w-36">
          <TextInput id="loc-lon" inputMode="decimal" placeholder="98.15" value={lon} onChange={(event) => setLon(event.target.value)} />
        </FormField>
        <Button variant="outline" icon={<Crosshair className="size-4" />} disabled={lat === "" || lon === ""} onClick={() => setPoint({ lat: Number(lat), lon: Number(lon) })}>
          Cek Zona
        </Button>
      </div>
      {point && result.data ? (
        <p className="mt-3 text-sm text-ink-soft">
          {result.data.length === 0
            ? "Titik ini tidak berada di zona mana pun."
            : `Berada di: ${result.data.map((zone) => `${zone.zone_name} (${zone.zone_type})`).join(", ")}.`}
        </p>
      ) : null}
      {point && result.isError ? <p className="mt-3 text-sm text-danger">Koordinat tidak valid.</p> : null}
    </Panel>
  );
}
