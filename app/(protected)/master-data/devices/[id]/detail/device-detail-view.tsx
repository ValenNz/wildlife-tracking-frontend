"use client";

import Link from "next/link";
import { useTrackingDeviceById } from "@/hooks/tracking-device.hook";
import { useGpsReadingsByDevice } from "@/hooks/gps-reading.hook";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { toApiErrorState } from "@/services/api-client";
import { formatDate } from "@/utils/format";
import type { DeviceCondition } from "@/types/tracking-device.type";

type DeviceDetailViewProps = {
  deviceId: number;
};

const CONDITION_LABEL: Record<DeviceCondition, string> = {
  normal: "Normal",
  damaged: "Rusak",
  lost: "Hilang",
};

const CONDITION_VARIANT = {
  normal: "success",
  damaged: "warning",
  lost: "danger",
} as const;

export function DeviceDetailView({ deviceId }: DeviceDetailViewProps) {
  const { data, isLoading, error, refetch } = useTrackingDeviceById(deviceId);
  const { data: readingsData, isLoading: readingsLoading, error: readingsError, refetch: readingsRefetch } = useGpsReadingsByDevice(deviceId);

  if (isLoading) {
    return <Loading label="Memuat detail perangkat..." />;
  }

  if (error) {
    const apiError = toApiErrorState(error);
    return (
      <ErrorState
        kind={apiError.kind}
        message={apiError.message}
        status={apiError.status}
        errors={apiError.errors}
        onRetry={refetch}
      />
    );
  }

  if (!data?.data) {
    return (
      <EmptyState
        title={`Perangkat dengan ID ${deviceId} tidak ditemukan`}
        description="Data tidak tersedia di backend."
      />
    );
  }

  const record = data.data;
  const isActive = record.is_active === true || record.is_active === 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/master-data/devices"
            className="text-xs font-medium text-zinc-500 underline-offset-2 hover:underline"
          >
            Kembali ke daftar
          </Link>
          <h2 className="text-2xl font-semibold text-zinc-900">{record.model}</h2>
          <p className="text-sm text-zinc-600">Perangkat #{record.device_id}</p>
        </div>

        <div className="flex gap-2">
          <StatusBadge
            label={record.device_condition === "normal" ? "Normal" : record.device_condition === "damaged" ? "Rusak" : "Hilang"}
            variant={record.device_condition === "normal" ? "success" : record.device_condition === "damaged" ? "warning" : "danger"}
          />
          <StatusBadge
            label={isActive ? "Aktif" : "Tidak Aktif"}
            variant={isActive ? "success" : "danger"}
          />
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <dl className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <DetailField label="Model" value={record.model} />
          <DetailField
            label="Tanggal Pasang"
            value={record.installation_date ? formatDate(record.installation_date) : "-"}
          />
          <DetailField
            label="Daya Baterai (bulan)"
            value={
              record.battery_life_months === null
                ? "-"
                : String(record.battery_life_months)
            }
          />
          <DetailField
            label="Posisi Terakhir"
            value={record.last_recorded_at ? formatDate(record.last_recorded_at) : "-"}
          />
        </dl>
      </section>

      <section aria-label="Data terkait" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Level Baterai"
          value={record.battery_level === null ? "Tidak Diketahui" : `${record.battery_level}%`}
          tone={
            record.battery_level !== null && record.battery_level < 20
              ? "warning"
              : "neutral"
          }
        />
        <StatCard
          label="Kekuatan Sinyal"
          value={record.signal_strength === null ? "-" : `${record.signal_strength} / 5`}
        />
        <StatCard
          label="Pembacaan GPS"
          value={readingsData?.data?.length === 0 ? "0" : String(readingsData?.data?.length ?? 0)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Satwa Tertanam
        </h3>

        {record.animal ? (
          <Link
            href={`/master-data/animals/${record.animal.animal_id}/detail`}
            className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm transition hover:border-zinc-400"
          >
            <span className="font-medium text-zinc-900">{record.animal.animal_code}</span>
            <span className="text-xs text-zinc-500">
              {record.animal.species?.common_name ?? `Spesies #${record.animal.species_id}`}
            </span>
          </Link>
        ) : (
          <EmptyState
            title="Belum dipasangkan"
            description="Perangkat ini belum terhubung ke satwa mana pun."
          />
        )}
      </section>
    </div>
  );
}

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
    <dd className="mt-0.5 text-sm text-zinc-900">{value}</dd>
  </div>
);