"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";

import { useTrackingDeviceById } from "@/hooks/use-devices";
import { useGpsReadingsByDevice } from "@/hooks/use-tracking";

import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/status";

import { toApiErrorState } from "@/services/api";
import { formatDate } from "@/utils/format";

import type { DeviceCondition } from "@/types/device.type";

import { useUserRole } from "@/components/providers/preferences-provider";
import { roleHasPermission } from "@/types/auth.type";
import { DeviceTokenPanel } from "./device-token";
import { DeviceOperations } from "./device-operations";

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

const DetailField = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-muted">
      {label}
    </dt>

    <dd className="mt-0.5 text-sm text-ink">
      {value}
    </dd>
  </div>
);

export default function DeviceDetailPage() {
  const userRole = useUserRole();
  const canManage = userRole ? roleHasPermission(userRole, "manage_master_data") : false;
  const canWrite = userRole ? roleHasPermission(userRole, "create_data") : false;
  const params = useParams<{ id: string }>();
  const deviceId = Number(params.id);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useTrackingDeviceById(deviceId);

  const {
    data: readingsData,
    isLoading: readingsLoading,
    error: readingsError,
    refetch: refetchReadings,
  } = useGpsReadingsByDevice(deviceId);

  if (!Number.isInteger(deviceId) || deviceId <= 0) notFound();

  const record = data?.data ?? null;

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
        onRetry={() => void refetch()}
      />
    );
  }

  if (!record) {
    return (
      <EmptyState
        title={`Perangkat dengan ID ${deviceId} tidak ditemukan`}
        description="Data tidak tersedia di backend."
      />
    );
  }

  const isActive =
    record.is_active === true;

  const condition = record.device_condition;

  const animal = record.animal;

  const animalName =
    animal?.animal_code ?? `Satwa #${record.animal_id}`;

  const animalSpecies =
    animal?.species?.common_name ??
    `Spesies #${animal?.species_id ?? "-"}`;

  const readingCount = readingsData?.data?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/devices"
            className="text-xs font-medium text-muted underline-offset-2 hover:underline"
          >
            Kembali ke daftar
          </Link>

          <h2 className="text-2xl font-semibold text-ink">
            {record.model}
          </h2>

          <p className="text-sm text-ink-soft">
            Perangkat #{record.device_id}
          </p>
        </div>

        <div className="flex gap-2">
          <StatusBadge
            label={CONDITION_LABEL[condition]}
            variant={CONDITION_VARIANT[condition]}
          />

          <StatusBadge
            label={isActive ? "Aktif" : "Tidak Aktif"}
            variant={isActive ? "success" : "danger"}
          />
        </div>
      </div>

      <section className="ui-panel p-5">
        <dl className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <DetailField
            label="Model"
            value={record.model}
          />

          <DetailField
            label="Tanggal Pasang"
            value={
              record.installation_date
                ? formatDate(record.installation_date)
                : "-"
            }
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
            value={
              record.last_recorded_at
                ? formatDate(record.last_recorded_at)
                : "-"
            }
          />
        </dl>
      </section>

      <section
        aria-label="Data terkait"
        className="grid grid-cols-2 gap-3 lg:grid-cols-3"
      >
        <StatCard
          label="Level Baterai"
          value={
            record.battery_level === null
              ? "Tidak Diketahui"
              : `${record.battery_level}%`
          }
          tone={
            record.battery_level !== null &&
            record.battery_level < 20
              ? "warning"
              : "neutral"
          }
        />

        <StatCard
          label="Kekuatan Sinyal"
          value={
            record.signal_strength === null
              ? "-"
              : `${record.signal_strength} / 100`
          }
        />

        <StatCard
          label="Pembacaan GPS"
          value={
            readingsLoading
              ? "Memuat..."
              : String(readingCount)
          }
        />
      </section>

      {readingsError ? (
        <ErrorState
          {...toApiErrorState(readingsError)}
          onRetry={() => void refetchReadings()}
        />
      ) : null}

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Satwa Terhubung
        </h3>

        {animal ? (
          <Link
            href={`/animals/${animal.animal_id}/detail`}
            className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm transition hover:border-primary"
          >
            <span className="font-medium text-ink">
              {animalName}
            </span>

            <span className="text-xs text-muted">
              {animalSpecies}
            </span>
          </Link>
        ) : (
          <EmptyState
            title="Belum dipasangkan"
            description="Perangkat ini belum terhubung ke satwa mana pun."
          />
        )}
      </section>

      <DeviceOperations device={record} canManage={canManage} canWrite={canWrite} />

      {canManage ? <DeviceTokenPanel deviceId={record.device_id} /> : null}
    </div>
  );
}
