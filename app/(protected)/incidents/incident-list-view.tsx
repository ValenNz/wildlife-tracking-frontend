"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataFilters } from "@/components/ui/data-filters";
import { ErrorState } from "@/components/ui/error-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { useIncidentReports } from "@/hooks/incident-report.hook";
import { formatDate } from "@/utils/format";
import { toApiErrorState } from "@/services/api-client";
import type { IncidentReport } from "@/types/incident-report";
import type { IncidentSyncStatus } from "@/types/incident-report";
import type { ApiErrorState } from "@/types/api.type";

const SYNC_LABEL: Record<IncidentSyncStatus, string> = {
  synced: "Tersinkron",
  pending_sync: "Menunggu Sinkron",
  failed: "Gagal Sinkron",
};

const SYNC_VARIANT = {
  synced: "success",
  pending_sync: "warning",
  failed: "danger",
} as const;

const INCIDENT_TYPES = [
  { label: "Semua jenis", value: "all" },
  { label: "Pengamatan", value: "observasi" },
  { label: "Konflik", value: "konflik" },
  { label: "Perambahan", value: "perambahan" },
  { label: "Peringatan Perangkat", value: "device_alert" },
];

const SYNC_OPTIONS = [
  { label: "Semua status", value: "all" },
  { label: "Tersinkron", value: "synced" },
  { label: "Menunggu sinkron", value: "pending_sync" },
  { label: "Gagal sinkron", value: "failed" },
];

const DEFAULT_FILTERS = {
  date_from: "",
  date_to: "",
  incident_type: "all",
  sync_status: "all",
};

const COLUMNS: ColumnDef<IncidentReport, unknown>[] = [
  {
    accessorKey: "timestamp",
    header: "Tanggal",
    cell: ({ row }) => (
      <span className="tabular-nums text-zinc-700">
        {formatDate(row.original.timestamp)}
      </span>
    ),
  },
  {
    accessorKey: "incident_type",
    header: "Jenis",
    cell: ({ row }) => (
      <span className="text-zinc-800">{row.original.incident_type}</span>
    ),
  },
  {
    accessorKey: "location",
    header: "Lokasi",
    cell: ({ row }) => (
      <span className="text-zinc-700">{row.original.location}</span>
    ),
  },
  {
    accessorKey: "animal_code",
    header: "Kode Satwa",
    cell: ({ row }) =>
      row.original.animal_code ? (
        <span className="font-medium text-zinc-900">{row.original.animal_code}</span>
      ) : (
        <span className="text-zinc-400">-</span>
      ),
  },
  {
    accessorKey: "sync_status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        label={row.original.sync_status}
        variant={
          row.original.sync_status === "synced"
            ? "success"
            : row.original.sync_status === "pending_sync"
            ? "warning"
            : "danger"
        }
      />
    ),
  },
];

const isWithinRange = (value: string, from: string, to: string): boolean => {
  const time = new Date(value).getTime();

  if (Number.isNaN(time)) return true;
  if (from !== "" && time < new Date(from).getTime()) return false;
  if (to !== "" && time > new Date(`${to}T23:59:59`).getTime()) return false;

  return true;
};

export function IncidentListView() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { data, isLoading, error, refetch } = useIncidentReports();

  const visibleReports = useMemo(
    () =>
      (data?.data ?? []).filter((report: IncidentReport) => {
        const matchesType =
          filters.incident_type === "all" ||
          report.incident_type === filters.incident_type;

        const matchesSync =
          filters.sync_status === "all" ||
          report.sync_status === filters.sync_status;

        const matchesRange = isWithinRange(
          report.timestamp,
          filters.date_from,
          filters.date_to,
        );

        return matchesType && matchesSync && matchesRange;
      }),
    [data, filters],
  );

  
return (
  <div className="flex flex-col gap-6">
    {/* Header */}
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
        Laporan Insiden
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Pantau kejadian lapangan dan status sinkronisasi laporan.
      </p>
    </div>

    {/* Ringkasan */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        {
          label: "Total Insiden",
          value: visibleReports.length,
          icon: "📋",
          style: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Tersinkron",
          value: visibleReports.filter(
            (item) => item.sync_status === "synced",
          ).length,
          icon: "✓",
          style: "bg-green-50 text-green-700",
        },
        {
          label: "Menunggu Sinkron",
          value: visibleReports.filter(
            (item) => item.sync_status === "pending_sync",
          ).length,
          icon: "◷",
          style: "bg-amber-50 text-amber-700",
        },
        {
          label: "Gagal Sinkron",
          value: visibleReports.filter(
            (item) => item.sync_status === "failed",
          ).length,
          icon: "!",
          style: "bg-red-50 text-red-700",
        },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-500">
              {item.label}
            </p>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold ${item.style}`}
            >
              {item.icon}
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-zinc-900">
            {item.value}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Berdasarkan laporan yang ditampilkan
          </p>
        </div>
      ))}
    </div>

    {/* Filter */}
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-zinc-900">
          Filter Laporan
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Cari laporan berdasarkan tanggal, jenis, dan status sinkron.
        </p>
      </div>

      <DataFilters
        fields={[
          { key: "date_from", kind: "date", label: "Dari Tanggal" },
          { key: "date_to", kind: "date", label: "Sampai Tanggal" },
          {
            key: "incident_type",
            kind: "select",
            label: "Jenis Insiden",
            options: [
              { label: "Semua jenis", value: "all" },
              { label: "Observasi", value: "observasi" },
              { label: "Konflik", value: "konflik" },
              { label: "Perambahan", value: "perambahan" },
              {
                label: "Peringatan Perangkat",
                value: "device_alert",
              },
            ],
          },
          {
            key: "sync_status",
            kind: "select",
            label: "Status Sinkron",
            options: [
              { label: "Semua status", value: "all" },
              { label: "Tersinkron", value: "synced" },
              {
                label: "Menunggu sinkron",
                value: "pending_sync",
              },
              { label: "Gagal sinkron", value: "failed" },
            ],
          },
        ]}
        values={filters}
        onFilterChange={(values) =>
          setFilters({ ...filters, ...values })
        }
        onReset={() =>
          setFilters({
            date_from: "",
            date_to: "",
            incident_type: "all",
            sync_status: "all",
          })
        }
      />
    </section>

    {/* Daftar laporan */}
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h3 className="font-semibold text-zinc-900">
          Daftar Laporan Insiden
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Informasi kejadian dan status sinkronisasi data.
        </p>
      </div>

      <div className="p-4">
        {error ? (
          <ErrorState
            kind={toApiErrorState(error).kind}
            message={toApiErrorState(error).message}
            status={toApiErrorState(error).status}
            errors={toApiErrorState(error).errors}
            onRetry={refetch}
          />
        ) : (
          <DataTable
            data={visibleReports}
            columns={COLUMNS}
            loading={isLoading}
            getRowId={(row) => String(row.report_id)}
            label="daftar laporan insiden"
            emptyTitle="Belum ada laporan insiden"
            emptyDescription="Belum ada laporan yang sesuai dengan filter yang dipilih."
          />
        )}
      </div>
    </section>
  </div>
);
}