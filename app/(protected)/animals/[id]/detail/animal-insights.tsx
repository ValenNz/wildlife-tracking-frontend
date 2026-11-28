"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";

import {
  AiThreatBadge,
  AiVerificationBadge,
} from "@/app/(protected)/ai/vision/ai-status";
import { useToast } from "@/components/toast";
import { Panel } from "@/components/ui/panel";
import {
  useAnimalAiObservations,
  useAnimalReferencePhotoCreate,
  useAnimalReferencePhotoDelete,
  useAnimalReferencePhotoFile,
  useAnimalReferencePhotos,
} from "@/hooks/use-ai";
import { useAnimalIncidents } from "@/hooks/use-animals";
import { useAnimalZoneVisits } from "@/hooks/use-zone-visits";
import { cn } from "@/lib/utils";
import { formatApiError } from "@/services/api";
import { formatDateTime } from "@/utils/format";

type Tab = "photos" | "observations" | "visits" | "incidents";

const TABS: { key: Tab; label: string }[] = [
  { key: "photos", label: "Foto referensi" },
  { key: "observations", label: "Observasi AI" },
  { key: "visits", label: "Kunjungan zona" },
  { key: "incidents", label: "Insiden" },
];


export function AnimalInsights({ animalId, canManage }: { animalId: number; canManage: boolean }) {
  const [tab, setTab] = useState<Tab>("photos");

  return (
    <Panel>
      <div role="tablist" aria-label="Data satwa" className="mb-5 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((item) => (
          <button
            key={item.key}
            role="tab"
            type="button"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition",
              tab === item.key ? "border-forest-deep text-forest-deep" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === "photos" ? <ReferencePhotos animalId={animalId} canManage={canManage} /> : null}
        {tab === "observations" ? <Observations animalId={animalId} /> : null}
        {tab === "visits" ? <Visits animalId={animalId} /> : null}
        {tab === "incidents" ? <Incidents animalId={animalId} /> : null}
      </div>
    </Panel>
  );
}

function ReferencePhotos({ animalId, canManage }: { animalId: number; canManage: boolean }) {
  const { showToast } = useToast();
  const photos = useAnimalReferencePhotos(animalId);
  const add = useAnimalReferencePhotoCreate(animalId);
  const list = photos.data?.data ?? [];

  const upload = async (files: File[]) => {
    for (const file of files) {
      try {
        await add.mutateAsync(file);
      } catch (error) {
        showToast(`${file.name}: ${formatApiError(error, "gagal diproses")}`, "error");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-2xl text-sm text-ink-soft">
        AI mengenali individu ini dari kemiripan penampilan dengan foto-foto di bawah. Daftarkan 3-5 foto jelas dari sisi berbeda.
        Deteksi yang diverifikasi petugas ikut masuk otomatis.
      </p>
      {canManage ? (
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-line-strong px-3 py-2 text-xs font-semibold text-ink-soft hover:border-primary hover:text-primary">
          {add.isPending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <ImagePlus aria-hidden="true" className="size-4" />}
          {add.isPending ? "Memproses foto..." : "Tambah foto referensi"}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={add.isPending}
            onChange={(event) => void upload(Array.from(event.target.files ?? []))}
          />
        </label>
      ) : null}
      {photos.isPending ? (
        <p className="text-sm text-muted">Memuat foto...</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted">Belum ada foto referensi. Tanpa foto, individu hanya dikenali dari GPS dan zona.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
          {list.map((photo) => (
            <ReferenceThumb key={photo.embedding_id} animalId={animalId} id={photo.embedding_id} source={photo.source} canManage={canManage} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ReferenceThumb({ animalId, id, source, canManage }: { animalId: number; id: number; source: string; canManage: boolean }) {
  const file = useAnimalReferencePhotoFile(animalId, id);
  const remove = useAnimalReferencePhotoDelete(animalId);
  const url = useMemo(() => (file.data ? URL.createObjectURL(file.data.blob) : null), [file.data]);

  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <li className="group relative">
      <div className="aspect-square overflow-hidden rounded-lg border border-line bg-surface-muted">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob URL dari storage privat
          <img src={url} alt={`Foto referensi #${id}`} className="h-full w-full object-cover" />
        ) : file.isError ? (
          <span className="flex h-full items-center justify-center text-[11px] text-muted">Tanpa berkas</span>
        ) : (
          <span className="flex h-full items-center justify-center">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-muted" />
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-muted">{source === "verified" ? "Dari verifikasi" : "Referensi"}</p>
      {canManage ? (
        <button
          type="button"
          aria-label={`Keluarkan foto #${id} dari galeri`}
          onClick={() => remove.mutate(id)}
          className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-white/90 text-forest-black opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : null}
    </li>
  );
}

function Observations({ animalId }: { animalId: number }) {
  const query = useAnimalAiObservations(animalId);
  const rows = query.data?.data ?? [];
  if (query.isPending) return <p className="text-sm text-muted">Memuat...</p>;
  if (rows.length === 0) return <p className="text-sm text-muted">AI belum pernah mengenali individu ini.</p>;

  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => (
        <li key={row.prediction_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <Link href={`/ai/vision/${row.prediction_id}/detail`} className="text-sm font-semibold text-primary underline-offset-2 hover:underline">
              {formatDateTime(row.media?.captured_at ?? row.processed_at)}
            </Link>
            <p className="text-xs text-muted">
              {[row.media?.zone?.zone_name, row.physical_condition, row.behavior].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex gap-2">
            {row.threat_level && row.threat_level !== "none" ? <AiThreatBadge level={row.threat_level} /> : null}
            <AiVerificationBadge status={row.verification_status} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Visits({ animalId }: { animalId: number }) {
  const query = useAnimalZoneVisits(animalId);
  const rows = query.data?.data ?? [];
  if (query.isPending) return <p className="text-sm text-muted">Memuat...</p>;
  if (rows.length === 0) return <p className="text-sm text-muted">Belum ada catatan masuk/keluar zona.</p>;

  return (
    <ul className="divide-y divide-line">
      {rows.map((row, index) => (
        <li key={index} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
          <span className="font-semibold text-ink">{row.zone?.zone_name ?? "-"}</span>
          <span className="text-ink-soft">
            {formatDateTime(row.entered_at)} sampai {row.is_inside ? "sekarang (masih di dalam)" : formatDateTime(row.exited_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Incidents({ animalId }: { animalId: number }) {
  const query = useAnimalIncidents(animalId);
  const rows = query.data?.data ?? [];
  if (query.isPending) return <p className="text-sm text-muted">Memuat...</p>;
  if (rows.length === 0) return <p className="text-sm text-muted">Tidak ada insiden untuk satwa ini.</p>;

  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => (
        <li key={row.report_id} className="py-3">
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <span className="font-semibold text-ink">{row.incident_type}</span>
            <span className="text-xs text-muted">{formatDateTime(row.timestamp)} · {row.status}</span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">{row.description}</p>
        </li>
      ))}
    </ul>
  );
}
