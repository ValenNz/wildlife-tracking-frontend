"use client";

import { useMemo, useState } from "react";
import { AudioLines, Film, ImageIcon, SlidersHorizontal } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { DataFilters } from "@/components/filter";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { useToast } from "@/components/toast";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import {
  useAiDeleteMediaUpload,
  useAiMediaUploads,
  useAiTriggerMediaPrediction,
} from "@/hooks/use-ai";
import { formatApiError, toApiErrorState } from "@/services/api";
import type { AiMediaUpload, AiMediaUploadListParams } from "@/types/ai.type";

import { useUserRole } from "@/components/providers/preferences-provider";
import { roleHasPermission } from "@/types/auth.type";
import { getMediaColumns } from "./column";
import {
  MEDIA_FILTER_FIELDS,
  MEDIA_INITIAL_FILTERS,
  type MediaFilterValues,
} from "./filter";

export default function AiMediaUploadsPage() {
  const userRole = useUserRole();
  const canAnalyze = userRole ? roleHasPermission(userRole, "upload_media") : false;
  const canDelete = userRole ? roleHasPermission(userRole, "delete_data") : false;
  const { showToast } = useToast();
  const [filters, setFilters] = useState<MediaFilterValues>(MEDIA_INITIAL_FILTERS);
  const [deleting, setDeleting] = useState<AiMediaUpload | null>(null);

  const params = useMemo<AiMediaUploadListParams>(
    () => ({
      media_type:
        filters.media_type === "all"
          ? undefined
          : (filters.media_type as AiMediaUploadListParams["media_type"]),
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
    }),
    [filters],
  );

  const mediaQuery = useAiMediaUploads(params);
  const analyzeMutation = useAiTriggerMediaPrediction();
  const deleteMutation = useAiDeleteMediaUpload();
  const media = mediaQuery.data?.data ?? [];

  const columns = useMemo(
    () =>
      getMediaColumns({
        canAnalyze,
        canDelete,
        analyzingId: analyzeMutation.isPending ? (analyzeMutation.variables ?? null) : null,
        onAnalyze: (item) =>
          analyzeMutation.mutate(item.media_id, {
            onSuccess: () =>
              showToast(`Media #${item.media_id} dianalisis ulang.`, "success"),
            onError: (error) =>
              showToast(formatApiError(error, "Gagal menganalisis ulang media."), "error"),
          }),
        onDelete: setDeleting,
      }),
    [analyzeMutation, canAnalyze, canDelete, showToast],
  );

  const countByType = (type: string) => media.filter((item) => item.media_type === type).length;

  if (mediaQuery.error) {
    const error = toApiErrorState(mediaQuery.error);

    return (
      <ErrorState
        kind={error.kind}
        message={error.message}
        status={error.status}
        errors={error.errors}
        onRetry={() => void mediaQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Analisis AI"
        title="Media Unggahan"
        description="Semua foto, video, dan rekaman yang dikirim ke AI dari unggahan manual, kamera jebak, perekam suara, dan lampiran insiden."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Foto"
          value={mediaQuery.isLoading ? "..." : String(countByType("image"))}
          icon={<ImageIcon className="size-5" />}
        />
        <StatCard
          label="Video"
          value={mediaQuery.isLoading ? "..." : String(countByType("video"))}
          icon={<Film className="size-5" />}
        />
        <StatCard
          label="Audio"
          value={mediaQuery.isLoading ? "..." : String(countByType("audio"))}
          icon={<AudioLines className="size-5" />}
        />
      </div>

      <section className="ui-panel">
        <div className="border-b border-line bg-surface-muted px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-soft p-2 text-primary">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Filter Media</h2>
              <p className="mt-1 text-sm text-muted">Saring berdasarkan jenis dan tanggal unggah.</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <DataFilters
            fields={MEDIA_FILTER_FIELDS}
            values={filters}
            onFilterChange={(values) => setFilters((previous) => ({ ...previous, ...values }))}
            onReset={() => setFilters({ ...MEDIA_INITIAL_FILTERS })}
          />
        </div>
      </section>

      <section className="ui-panel overflow-hidden">
        <div className="border-b border-line px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-ink">Daftar Media</h2>
          <p className="mt-1 text-sm text-muted">{media.length} berkas.</p>
        </div>
        <div className="p-4 sm:p-5">
          <DataTable
            data={media}
            columns={columns}
            loading={mediaQuery.isLoading}
            getRowId={(row) => String(row.media_id)}
            label="daftar media"
            emptyTitle="Belum ada media"
            emptyDescription="Kirim media dari halaman AI Vision."
          />
        </div>
      </section>

      <ConfirmationDialog
        open={deleting !== null}
        title="Hapus Media?"
        description={
          <>
            <p>Berkas dan seluruh prediksinya akan dihapus.</p>
            <p className="mt-3 text-xs text-danger">
              Media yang prediksinya sudah diverifikasi tidak bisa dihapus.
            </p>
          </>
        }
        isPending={deleteMutation.isPending}
        error={
          deleteMutation.isError
            ? formatApiError(deleteMutation.error, "Gagal menghapus media.")
            : null
        }
        onConfirm={() =>
          deleting &&
          deleteMutation.mutate(deleting.media_id, {
            onSuccess: () => {
              showToast("Media dihapus.", "success");
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
