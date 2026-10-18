"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataFilters } from "@/components/ui/data-filters";
import { ErrorState } from "@/components/ui/error-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { useIncidentReports } from "@/hooks/useIncidentReports";
import { formatDate } from "@/utils/format";
import type { IncidentReport } from "@/types/incident-report";
import type { IncidentSyncStatus } from "@/types/incident-report";

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
  { label: "Pengamatan", value: "demo_observation" },
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
        label={SYNC_LABEL[row.original.sync_status]}
        variant={SYNC_VARIANT[row.original.sync_status]}
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
  const incidents = useIncidentReports();

  const visibleReports = useMemo(
    () =>
      incidents.data.filter((report) => {
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
    [incidents.data, filters],
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Laporan Insiden</h2>
        <p className="text-sm text-zinc-600">
          Kejadian lapangan yang dilaporkan oleh konservasionis.
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
            options: INCIDENT_TYPES,
          },
          {
            key: "sync_status",
            kind: "select",
            label: "Status Sinkron",
            options: SYNC_OPTIONS,
          },
        ]}
        values={filters}
        onFilterChange={(values) => setFilters({ ...DEFAULT_FILTERS, ...values })}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {incidents.error ? (
        <ErrorState
          kind={incidents.error.kind}
          message={incidents.error.message}
          status={incidents.error.status}
          errors={incidents.error.errors}
          onRetry={incidents.refetch}
        />
      ) : (
        <DataTable
          data={visibleReports}
          columns={COLUMNS}
          loading={incidents.isLoading}
          getRowId={(row) => String(row.report_id)}
          label="daftar laporan insiden"
          emptyTitle="Belum ada laporan insiden"
          emptyDescription="Tidak ada laporan yang cocok dengan filter saat ini."
        />
      )}
    </div>
  );
}