"use client";

import { useMemo, useState } from "react";
import { Download, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { DataFilters } from "@/components/filter";
import { useToast } from "@/components/toast";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/panel";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { useExportDownload } from "@/hooks/use-reports";
import { formatApiError, toApiErrorState } from "@/services/api";
import { saveBlob } from "@/utils/download";

import { getActivityLogColumns } from "./column";
import {
  ACTIVITY_LOG_FILTER_FIELDS,
  ACTIVITY_LOG_INITIAL_FILTERS,
  type ActivityLogFilterValues,
} from "./filter";

const LOG_LIMIT = 200;

export default function ActivityLogsPage() {
  const { showToast } = useToast();
  const [filters, setFilters] = useState<ActivityLogFilterValues>(ACTIVITY_LOG_INITIAL_FILTERS);

  const logsQuery = useActivityLogs({
    action: filters.action.trim() || undefined,
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
    page: 1,
    per_page: LOG_LIMIT,
  });
  const exportMutation = useExportDownload();
  const logs = logsQuery.data?.data ?? [];
  const total = logsQuery.data?.meta?.total ?? logs.length;
  const columns = useMemo(() => getActivityLogColumns(), []);

  if (logsQuery.error) {
    const error = toApiErrorState(logsQuery.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void logsQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Sistem"
        title="Log Aktivitas"
        description="Login dan setiap perubahan data yang berhasil. Isi formulir tidak dicatat, sehingga password tidak pernah masuk log."
        actions={
          <Button
            variant="outline"
            icon={<Download className="size-4" />}
            loading={exportMutation.isPending}
            onClick={() =>
              exportMutation.mutate(
                {
                  path: "/export/activity-logs/csv",
                  params: {
                    start_date: filters.start_date || undefined,
                    end_date: filters.end_date || undefined,
                  },
                },
                {
                  onSuccess: (file) => saveBlob(file, "activity-logs.csv"),
                  onError: (error) => showToast(formatApiError(error, "Gagal mengekspor log."), "error"),
                },
              )
            }
          >
            Ekspor CSV
          </Button>
        }
      />

      <section className="ui-panel">
        <div className="border-b border-line bg-surface-muted px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-soft p-2 text-primary">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Filter Log</h2>
              <p className="mt-1 text-sm text-muted">Berdasarkan aksi dan rentang tanggal.</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <DataFilters
            fields={ACTIVITY_LOG_FILTER_FIELDS}
            values={filters}
            onFilterChange={(values) => setFilters((previous) => ({ ...previous, ...values }))}
            onReset={() => setFilters({ ...ACTIVITY_LOG_INITIAL_FILTERS })}
          />
        </div>
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="border-b border-line px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-ink">Riwayat Aktivitas</h2>
          <p className="mt-1 text-sm text-muted">
            Menampilkan {logs.length} dari {total} aktivitas terbaru. Ekspor CSV untuk seluruh riwayat.
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <DataTable
            data={logs}
            columns={columns}
            loading={logsQuery.isLoading}
            getRowId={(row) => String(row.log_id)}
            label="log aktivitas"
            pageSize={20}
            emptyTitle="Tidak ada aktivitas"
          />
        </div>
      </section>
    </div>
  );
}
