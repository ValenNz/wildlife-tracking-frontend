"use client";

import { useMemo, useState } from "react";
import { CloudDownload, CloudRain, SlidersHorizontal, Thermometer } from "lucide-react";

import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { DataFilters } from "@/components/filter";
import { useToast } from "@/components/toast";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { useWeatherData, useWeatherSync } from "@/hooks/use-weather";
import { formatApiError, toApiErrorState } from "@/services/api";

import { useUserRole } from "@/components/providers/preferences-provider";
import { roleHasPermission } from "@/types/auth.type";
import { getWeatherColumns } from "./column";
import { WEATHER_FILTER_FIELDS, WEATHER_INITIAL_FILTERS, type WeatherFilterValues } from "./filter";

const average = (values: (number | string | null)[]) => {
  const numbers = values.filter((value) => value !== null && value !== "").map(Number);

  return numbers.length === 0 ? null : numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
};

export default function WeatherPage() {
  const userRole = useUserRole();
  const canSync = userRole ? roleHasPermission(userRole, "create_data") : false;
  const { showToast } = useToast();
  const [filters, setFilters] = useState<WeatherFilterValues>(WEATHER_INITIAL_FILTERS);
  const weatherQuery = useWeatherData({
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
    page: 1,
    per_page: 200,
  });
  const syncMutation = useWeatherSync();
  const rows = weatherQuery.data?.data ?? [];
  const columns = useMemo(() => getWeatherColumns(), []);

  const temperature = average(rows.map((row) => row.temperature_c));
  const rainfall = rows.reduce((sum, row) => sum + Number(row.rainfall_mm ?? 0), 0);

  if (weatherQuery.error) {
    const error = toApiErrorState(weatherQuery.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void weatherQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Lapangan"
        title="Cuaca"
        description="Cuaca di lokasi titik GPS satwa (Open-Meteo). Sinkronkan untuk mengambil cuaca bagi 20 titik terbaru yang belum punya data."
        actions={
          canSync ? (
            <Button
              icon={<CloudDownload className="size-4" />}
              loading={syncMutation.isPending}
              onClick={() =>
                syncMutation.mutate(20, {
                  onSuccess: (response) =>
                    showToast(response.message, response.data.failed.length > 0 ? "error" : "success"),
                  onError: (error) => showToast(formatApiError(error, "Gagal sinkron cuaca."), "error"),
                })
              }
            >
              Sinkronkan Cuaca
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Data Cuaca"
          value={weatherQuery.isLoading ? "..." : String(rows.length)}
          hint="Pada rentang tanggal terpilih"
          icon={<CloudDownload className="size-5" />}
        />
        <StatCard
          label="Suhu Rata-rata"
          value={weatherQuery.isLoading ? "..." : temperature === null ? "-" : `${temperature.toFixed(1)} °C`}
          icon={<Thermometer className="size-5" />}
        />
        <StatCard
          label="Total Curah Hujan"
          value={weatherQuery.isLoading ? "..." : `${rainfall.toLocaleString("id-ID")} mm`}
          icon={<CloudRain className="size-5" />}
        />
      </div>

      <section className="ui-panel">
        <div className="border-b border-line bg-surface-muted px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-soft p-2 text-primary">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Filter Cuaca</h2>
              <p className="mt-1 text-sm text-muted">Berdasarkan waktu pengamatan.</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <DataFilters
            fields={WEATHER_FILTER_FIELDS}
            values={filters}
            onFilterChange={(values) => setFilters((previous) => ({ ...previous, ...values }))}
            onReset={() => setFilters({ ...WEATHER_INITIAL_FILTERS })}
          />
        </div>
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="border-b border-line px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-ink">Data Cuaca</h2>
          <p className="mt-1 text-sm text-muted">200 pengamatan terbaru.</p>
        </div>
        <div className="p-4 sm:p-5">
          <DataTable
            data={rows}
            columns={columns}
            loading={weatherQuery.isLoading}
            getRowId={(row) => String(row.weather_id)}
            label="data cuaca"
            emptyTitle="Belum ada data cuaca"
            emptyDescription={canSync ? "Tekan Sinkronkan Cuaca untuk mengambil data." : undefined}
          />
        </div>
      </section>
    </div>
  );
}
