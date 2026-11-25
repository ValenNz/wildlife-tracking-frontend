"use client";

import { useMemo, useState } from "react";
import { Flame, ShieldAlert, SlidersHorizontal, Siren } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { DataFilters } from "@/components/filter";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { useAiThreats } from "@/hooks/use-ai";
import { toApiErrorState } from "@/services/api";
import type { AiThreatListParams } from "@/types/ai.type";

import { getThreatColumns } from "./column";
import {
  THREAT_FILTER_FIELDS,
  THREAT_INITIAL_FILTERS,
  type ThreatFilterValues,
} from "./filter";

export default function AiThreatsPage() {
  const [filters, setFilters] = useState<ThreatFilterValues>(THREAT_INITIAL_FILTERS);

  const params = useMemo<AiThreatListParams>(
    () => ({
      min_level: filters.min_level as AiThreatListParams["min_level"],
      analysis_type:
        filters.analysis_type === "all"
          ? undefined
          : (filters.analysis_type as AiThreatListParams["analysis_type"]),
      start_date: filters.start_date || undefined,
    }),
    [filters],
  );

  const threatsQuery = useAiThreats(params);
  const threats = threatsQuery.data?.data ?? [];
  const columns = useMemo(() => getThreatColumns(), []);

  const critical = threats.filter((item) => item.threat_level === "critical").length;
  const high = threats.filter((item) => item.threat_level === "high").length;
  const unverified = threats.filter((item) => item.verification_status === "pending").length;

  if (threatsQuery.error) {
    const error = toApiErrorState(threatsQuery.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void threatsQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Analisis AI"
        title="Ancaman Terdeteksi"
        description="Tembakan, senjata, jerat, gergaji mesin, api, mesin berat, dan orang tidak dikenal di zona lindung. Ancaman sedang ke atas otomatis membuat notifikasi; tembakan, senjata, dan penebangan juga membuat insiden."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Ancaman Kritis"
          value={threatsQuery.isLoading ? "..." : String(critical)}
          hint="Tembakan, senjata, atau jerat"
          tone="danger"
          icon={<Siren className="size-5" />}
        />
        <StatCard
          label="Ancaman Tinggi"
          value={threatsQuery.isLoading ? "..." : String(high)}
          hint="Gergaji mesin, penebangan, atau api"
          tone="warning"
          icon={<Flame className="size-5" />}
        />
        <StatCard
          label="Belum Diverifikasi"
          value={threatsQuery.isLoading ? "..." : String(unverified)}
          hint="Perlu dicek petugas"
          icon={<ShieldAlert className="size-5" />}
        />
      </div>

      <section className="ui-panel">
        <div className="border-b border-line bg-surface-muted px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-soft p-2 text-primary">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Filter Ancaman</h2>
              <p className="mt-1 text-sm text-muted">
                Atur tingkat minimum, sumber media, dan rentang waktu.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <DataFilters
            fields={THREAT_FILTER_FIELDS}
            values={filters}
            onFilterChange={(values) =>
              setFilters((previous) => ({ ...previous, ...values }))
            }
            onReset={() => setFilters({ ...THREAT_INITIAL_FILTERS })}
          />
        </div>
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="border-b border-line px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-ink">Daftar Ancaman</h2>
          <p className="mt-1 text-sm text-muted">
            {threats.length} temuan, terbaru di atas. Temuan yang ditolak petugas tidak ditampilkan.
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <DataTable
            data={threats}
            columns={columns}
            loading={threatsQuery.isLoading}
            getRowId={(row) => String(row.prediction_id)}
            label="daftar ancaman"
            emptyTitle="Tidak ada ancaman"
            emptyDescription="Tidak ada temuan AI pada tingkat ini. Turunkan tingkat minimum untuk melihat lebih banyak."
          />
        </div>
      </section>
    </div>
  );
}
