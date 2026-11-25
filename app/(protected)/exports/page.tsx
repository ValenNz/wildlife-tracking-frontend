"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, MapPinned } from "lucide-react";

import { Button } from "@/components/button";
import { FormField, FormGrid, TextInput } from "@/components/form";
import { useToast } from "@/components/toast";
import { PageHeader, Panel, SectionHeader } from "@/components/ui/panel";
import { useExportDownload } from "@/hooks/use-reports";
import { formatApiError } from "@/services/api";
import type { TYPE_EXPORT_ITEM } from "@/types/report.type";
import { saveBlob } from "@/utils/download";

const EXPORT_GROUPS: { title: string; description: string; items: TYPE_EXPORT_ITEM[] }[] = [
  {
    title: "Pelacakan",
    description: "Data berwaktu: mengikuti rentang tanggal di atas.",
    items: [
      { path: "/export/gps/csv", filename: "gps.csv", title: "Titik GPS (CSV)", description: "Pembacaan kalung: satwa, waktu, koordinat, ketinggian.", dated: true },
      { path: "/export/gps/geojson", filename: "gps.geojson", title: "Titik GPS (GeoJSON)", description: "Untuk QGIS atau aplikasi peta lain.", dated: true },
      { path: "/export/zone-visits/csv", filename: "zone-visits.csv", title: "Kunjungan Zona", description: "Kapan satwa masuk dan keluar tiap zona.", dated: true },
      { path: "/export/weather/csv", filename: "weather.csv", title: "Cuaca", description: "Suhu, hujan, kelembapan per titik GPS.", dated: true },
    ],
  },
  {
    title: "Kejadian & AI",
    description: "Data berwaktu: mengikuti rentang tanggal di atas.",
    items: [
      { path: "/export/incidents/csv", filename: "incidents.csv", title: "Insiden", description: "Laporan petugas dan insiden otomatis dari AI.", dated: true },
      { path: "/export/ai-predictions/csv", filename: "ai-predictions.csv", title: "Prediksi AI", description: "Spesies, individu, wajah, suara, ancaman, status verifikasi.", dated: true },
    ],
  },
  {
    title: "Master Data",
    description: "Selalu berisi seluruh data saat ini.",
    items: [
      { path: "/export/animals/csv", filename: "animals.csv", title: "Satwa", description: "Individu, spesies, dan kalung yang terpasang.", dated: false },
      { path: "/export/species/csv", filename: "species.csv", title: "Spesies", description: "Nama dan status konservasi.", dated: false },
      { path: "/export/devices/csv", filename: "devices.csv", title: "Perangkat", description: "Kalung GPS, kamera jebak, dan perekam suara.", dated: false },
      { path: "/export/geo-zones/csv", filename: "geo-zones.csv", title: "Zona (CSV)", description: "Nama, jenis, titik pusat, radius.", dated: false },
      { path: "/export/geo-zones/geojson", filename: "geo-zones.geojson", title: "Zona (GeoJSON)", description: "Poligon zona untuk aplikasi peta.", dated: false },
    ],
  },
];

export default function ExportsPage() {
  const { showToast } = useToast();
  const exportMutation = useExportDownload();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const download = (item: TYPE_EXPORT_ITEM) =>
    exportMutation.mutate(
      {
        path: item.path,
        params: item.dated
          ? { start_date: startDate || undefined, end_date: endDate || undefined }
          : undefined,
      },
      {
        onSuccess: (file) => saveBlob(file, item.filename),
        onError: (error) => showToast(formatApiError(error, `Gagal mengunduh ${item.title}.`), "error"),
      },
    );

  const busyPath = exportMutation.isPending ? exportMutation.variables?.path : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Laporan"
        title="Ekspor Data"
        description="Unduh data untuk Excel, analisis lanjutan, atau aplikasi peta. Kosongkan tanggal untuk mengunduh semua data."
      />

      <Panel>
        <FormGrid columns={2}>
          <FormField label="Dari Tanggal" htmlFor="export-start">
            <TextInput id="export-start" type="date" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} />
          </FormField>
          <FormField label="Sampai Tanggal" htmlFor="export-end">
            <TextInput id="export-end" type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} />
          </FormField>
        </FormGrid>
      </Panel>

      {EXPORT_GROUPS.map((group) => (
        <Panel key={group.title}>
          <SectionHeader title={group.title} description={group.description} />
          <ul className="divide-y divide-line">
            {group.items.map((item) => (
              <li key={item.path} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="rounded-xl bg-primary-soft p-2 text-primary">
                    {item.path.endsWith("geojson") ? (
                      <MapPinned aria-hidden="true" className="size-4" />
                    ) : (
                      <FileSpreadsheet aria-hidden="true" className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="text-xs text-muted">{item.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download className="size-3.5" />}
                  loading={busyPath === item.path}
                  disabled={busyPath !== null && busyPath !== item.path}
                  onClick={() => download(item)}
                >
                  Unduh
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
      ))}
    </div>
  );
}
