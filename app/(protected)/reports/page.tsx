"use client";

import { useMemo, useState } from "react";
import { FilePlus2 } from "lucide-react";

import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { FormField, FormGrid, FormSection, SelectInput, TextInput } from "@/components/form";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { useToast } from "@/components/toast";
import { ErrorState } from "@/components/ui/error-state";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/panel";
import {
  useAggregateReportDelete,
  useAggregateReportDownload,
  useAggregateReportGenerate,
  useAggregateReports,
} from "@/hooks/use-reports";
import { ApiError, formatApiError, toApiErrorState } from "@/services/api";
import {
  REPORT_STATISTIC_LABELS,
  TYPE_REPORT_TYPE_LABELS,
  type TYPE_AGGREGATE_REPORT,
  type TYPE_AGGREGATE_REPORT_PAYLOAD,
  type TYPE_REPORT_TYPE,
} from "@/types/report.type";
import { saveBlob } from "@/utils/download";
import { formatDate } from "@/utils/format";

import { useUserRole } from "@/components/providers/preferences-provider";
import { roleHasPermission } from "@/types/auth.type";
import { getReportColumns } from "./column";

export default function AggregateReportsPage() {
  const userRole = useUserRole();
  const canDelete = userRole ? roleHasPermission(userRole, "delete_data") : false;
  const { showToast } = useToast();
  const reportsQuery = useAggregateReports();
  const generateMutation = useAggregateReportGenerate();
  const deleteMutation = useAggregateReportDelete();
  const downloadMutation = useAggregateReportDownload();
  const [form, setForm] = useState<TYPE_AGGREGATE_REPORT_PAYLOAD>({ report_type: "weekly" });
  const [conflict, setConflict] = useState(false);
  const [viewing, setViewing] = useState<TYPE_AGGREGATE_REPORT | null>(null);
  const [deleting, setDeleting] = useState<TYPE_AGGREGATE_REPORT | null>(null);
  const reports = reportsQuery.data?.data ?? [];

  const generate = (overwrite: boolean) =>
    generateMutation.mutate(
      { ...form, overwrite },
      {
        onSuccess: () => {
          setConflict(false);
          showToast("Laporan dibuat.", "success");
        },
        onError: (error) => {

          if (error instanceof ApiError && error.status === 409) {
            setConflict(true);
            return;
          }
          showToast(formatApiError(error, "Gagal membuat laporan."), "error");
        },
      },
    );

  const columns = useMemo(
    () =>
      getReportColumns({
        canDelete,
        onView: setViewing,
        onDownload: (report) =>
          downloadMutation.mutate(report.report_id, {
            onSuccess: (file) => saveBlob(file, `laporan-${report.report_id}.csv`),
            onError: (error) => showToast(formatApiError(error, "Gagal mengunduh laporan."), "error"),
          }),
        onDelete: setDeleting,
      }),
    [canDelete, downloadMutation, showToast],
  );

  if (reportsQuery.error) {
    const error = toApiErrorState(reportsQuery.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void reportsQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Laporan"
        title="Laporan Agregat"
        description="Ringkasan statistik harian, mingguan, atau bulanan yang disimpan dan bisa diunduh sebagai CSV."
      />

      <FormSection
        title="Buat Laporan"
        description="Tanpa tanggal, periode diambil dari hari, minggu, atau bulan terakhir."
      >
        <FormGrid columns={3}>
          <FormField label="Jenis Laporan" htmlFor="report-type">
            <SelectInput
              id="report-type"
              value={form.report_type}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, report_type: event.target.value as TYPE_REPORT_TYPE }))
              }
            >
              {Object.entries(TYPE_REPORT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Mulai" htmlFor="report-start">
            <TextInput
              id="report-start"
              type="date"
              value={form.period_start ?? ""}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, period_start: event.target.value || undefined }))
              }
            />
          </FormField>
          <FormField label="Selesai" htmlFor="report-end">
            <TextInput
              id="report-end"
              type="date"
              value={form.period_end ?? ""}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, period_end: event.target.value || undefined }))
              }
            />
          </FormField>
        </FormGrid>
        <div className="mt-4 flex justify-end">
          <Button
            icon={<FilePlus2 className="size-4" />}
            loading={generateMutation.isPending}
            onClick={() => generate(false)}
          >
            Buat Laporan
          </Button>
        </div>
      </FormSection>

      <section className="ui-panel overflow-hidden">
        <div className="border-b border-line px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-ink">Daftar Laporan</h2>
          <p className="mt-1 text-sm text-muted">{reports.length} laporan, terbaru di atas.</p>
        </div>
        <div className="p-4 sm:p-5">
          <DataTable
            data={reports}
            columns={columns}
            loading={reportsQuery.isLoading}
            getRowId={(row) => String(row.report_id)}
            label="daftar laporan agregat"
            emptyTitle="Belum ada laporan"
            emptyDescription="Buat laporan pertama di atas."
          />
        </div>
      </section>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={`Laporan ${viewing ? TYPE_REPORT_TYPE_LABELS[viewing.report_type] : ""}`}
        description={
          viewing
            ? `${formatDate(viewing.period_start)} sampai ${formatDate(viewing.period_end)}`
            : undefined
        }
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {Object.entries(viewing?.report_data?.statistics ?? {}).map(([key, value]) => (
            <div key={key} className="border-l-2 border-natural-muted pl-3">
              <dt className="text-xs text-muted">{REPORT_STATISTIC_LABELS[key] ?? key.replaceAll("_", " ")}</dt>
              <dd className="text-lg font-semibold tabular-nums text-ink">
                {typeof value === "number" ? value.toLocaleString("id-ID") : (value ?? "-")}
              </dd>
            </div>
          ))}
        </dl>
      </Modal>

      <ConfirmationDialog
        open={conflict}
        title="Laporan Periode Ini Sudah Ada"
        description="Buat ulang dengan data terbaru? Laporan lama untuk periode yang sama akan ditimpa."
        confirmLabel="Buat Ulang"
        isPending={generateMutation.isPending}
        onConfirm={() => generate(true)}
        onCancel={() => setConflict(false)}
      />

      <ConfirmationDialog
        open={deleting !== null}
        title="Hapus Laporan?"
        description="Laporan dan berkas CSV-nya dihapus."
        isPending={deleteMutation.isPending}
        error={deleteMutation.isError ? formatApiError(deleteMutation.error, "Gagal menghapus laporan.") : null}
        onConfirm={() =>
          deleting &&
          deleteMutation.mutate(deleting.report_id, {
            onSuccess: () => {
              showToast("Laporan dihapus.", "success");
              setDeleting(null);
            },
          })
        }
        onCancel={() => {
          if (deleteMutation.isPending) return;
          setDeleting(null);
          deleteMutation.reset();
        }}
      />
    </div>
  );
}
