"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LogIn, MapPin, Plus, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { DataFilters } from "@/components/filter";
import { useToast } from "@/components/toast";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { useGeoZones } from "@/hooks/use-geo-zones";
import { useZoneVisitExit, useZoneVisits } from "@/hooks/use-zone-visits";
import { formatApiError, toApiErrorState } from "@/services/api";
import type { TYPE_ZONE_VISIT_PARAMS } from "@/types/zone-visit.type";

import { useUserRole } from "@/components/providers/preferences-provider";
import { roleHasPermission } from "@/types/auth.type";
import { getZoneVisitColumns } from "./column";
import {
  ZONE_VISIT_INITIAL_FILTERS,
  getZoneVisitFilterFields,
  type ZoneVisitFilterValues,
} from "./filter";

export default function ZoneVisitsPage() {
  const userRole = useUserRole();
  const canWrite = userRole ? roleHasPermission(userRole, "create_data") : false;
  const router = useRouter();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<ZoneVisitFilterValues>(ZONE_VISIT_INITIAL_FILTERS);

  const params = useMemo<TYPE_ZONE_VISIT_PARAMS>(
    () => ({
      zone_id: filters.zone_id === "all" ? undefined : Number(filters.zone_id),
      active: filters.active === "all" ? undefined : (Number(filters.active) as 0 | 1),
      start_date: filters.start_date || undefined,
    }),
    [filters],
  );

  const visitsQuery = useZoneVisits(params);
  const zonesQuery = useGeoZones();
  const exitMutation = useZoneVisitExit();
  const visits = visitsQuery.data?.data?.items ?? [];
  const zones = useMemo(() => zonesQuery.data ?? [], [zonesQuery.data]);
  const filterFields = useMemo(() => getZoneVisitFilterFields(zones), [zones]);

  const columns = useMemo(
    () =>
      getZoneVisitColumns({
        canWrite,
        onExit: (visit) =>
          exitMutation.mutate(visit.visit_id, {
            onSuccess: () => showToast("Kunjungan ditutup.", "success"),
            onError: (error) => showToast(formatApiError(error, "Gagal menutup kunjungan."), "error"),
          }),
      }),
    [canWrite, exitMutation, showToast],
  );

  const insideCount = visits.filter((visit) => visit.is_inside).length;

  if (visitsQuery.error) {
    const error = toApiErrorState(visitsQuery.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void visitsQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Lapangan"
        title="Kunjungan Zona"
        description="Kapan satwa masuk dan keluar zona. Tercatat otomatis dari titik GPS; petugas bisa menambah catatan dari pengamatan lapangan."
        actions={
          canWrite ? (
            <Button icon={<Plus className="size-4" />} onClick={() => router.push("/zone-visits/create")}>
              Catat Kunjungan
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Kunjungan"
          value={visitsQuery.isLoading ? "..." : String(visits.length)}
          icon={<LogIn className="size-5" />}
        />
        <StatCard
          label="Masih di Dalam Zona"
          value={visitsQuery.isLoading ? "..." : String(insideCount)}
          tone="warning"
          icon={<MapPin className="size-5" />}
        />
        <StatCard
          label="Zona Terpantau"
          value={zonesQuery.isLoading ? "..." : String(zones.length)}
          icon={<MapPin className="size-5" />}
        />
      </div>

      <section className="ui-panel">
        <div className="border-b border-line bg-surface-muted px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-soft p-2 text-primary">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Filter Kunjungan</h2>
              <p className="mt-1 text-sm text-muted">Berdasarkan zona, status, dan waktu masuk.</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <DataFilters
            fields={filterFields}
            values={filters}
            onFilterChange={(values) => setFilters((previous) => ({ ...previous, ...values }))}
            onReset={() => setFilters({ ...ZONE_VISIT_INITIAL_FILTERS })}
          />
        </div>
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="border-b border-line px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-ink">Daftar Kunjungan</h2>
          <p className="mt-1 text-sm text-muted">{visits.length} catatan, terbaru di atas.</p>
        </div>
        <div className="p-4 sm:p-5">
          <DataTable
            data={visits}
            columns={columns}
            loading={visitsQuery.isLoading}
            getRowId={(row) => String(row.visit_id)}
            label="kunjungan zona"
            emptyTitle="Belum ada kunjungan zona"
          />
        </div>
      </section>
    </div>
  );
}
