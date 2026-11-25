"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Plus,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { DataFilters } from "@/components/filter";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { useIncidentReports } from "@/hooks/use-incidents";
import { toApiErrorState } from "@/services/api";
import type { IncidentReport } from "@/types/incident.type";
import { COLUMNS } from "./column";
import {
  DEFAULT_FILTERS,
  FILTER_FIELDS,
  isWithinRange,
  type IncidentFilters,
} from "./filter";

export default function IncidentListPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<IncidentFilters>(DEFAULT_FILTERS);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useIncidentReports();

  const reports = useMemo(() => data?.data ?? [], [data]);

  const visibleReports = useMemo(
    () =>
      reports.filter((report: IncidentReport) => {
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
    [reports, filters],
  );

  const statistics = [
    {
      label: "Total Insiden",
      value: visibleReports.length,
      tone: "neutral" as const,
      icon: <ClipboardList className="size-5" />,
    },
    {
      label: "Tersinkron",
      value: visibleReports.filter((item) => item.sync_status === "synced").length,
      tone: "positive" as const,
      icon: <CheckCircle2 className="size-5" />,
    },
    {
      label: "Menunggu Sinkron",
      value: visibleReports.filter((item) => item.sync_status === "pending_sync").length,
      tone: "warning" as const,
      icon: <Clock3 className="size-5" />,
    },
    {
      label: "Gagal Sinkron",
      value: visibleReports.filter((item) => item.sync_status === "failed").length,
      tone: "danger" as const,
      icon: <XCircle className="size-5" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operasional"
        title="Laporan Insiden"
        description="Pantau kejadian lapangan dan status sinkronisasi laporan."
        actions={
          <Button
            icon={<Plus className="size-4" />}
            onClick={() => router.push("/incidents/create")}
          >
            Tambah Laporan
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={String(item.value)}
            tone={item.tone}
            icon={item.icon}
          />
        ))}
      </div>

      <section className="ui-panel p-5">
        <div className="mb-4">
          <h3 className="font-bold text-ink">
            Filter Laporan
          </h3>
          <p className="mt-1 text-sm text-muted">
            Cari laporan berdasarkan tanggal, jenis, dan status sinkron.
          </p>
        </div>

        <DataFilters
          fields={FILTER_FIELDS}
          values={filters}
          onFilterChange={(values) =>
            setFilters((previous) => ({
              ...previous,
              ...values,
            }))
          }
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-bold text-ink">
            Daftar Laporan Insiden
          </h3>
          <p className="mt-1 text-sm text-muted">
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
