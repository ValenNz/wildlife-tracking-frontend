"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, FileAudio, Film } from "lucide-react";

import { AiPredictionImage } from "../ai-prediction-image";
import {
  AiConfidence,
  AiProcessingBadge,
  AiThreatBadge,
  AiVerificationBadge,
} from "../ai-status";
import {
  getHistoryFilterFields,
  INITIAL_FILTERS,
  type AiHistoryFilters,
} from "../filter";
import { Button } from "@/components/button";
import {
  DataFilters,
  type FilterField,
  type FilterValues,
} from "@/components/filter";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FormAlert } from "@/components/form";
import { Loading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/panel";
import { StatusBadge } from "@/components/status";
import { useAiPredictions } from "@/hooks/use-ai";
import { useSpecies } from "@/hooks/use-species";
import { formatApiError, toApiErrorState } from "@/services/api";
import type { AiPrediction, AiPredictionListParams } from "@/types/ai.type";
import { formatDate } from "@/utils/format";

const PER_PAGE = 12;

export default function AiPredictionHistoryPage() {
  const [filters, setFilters] = useState<AiHistoryFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const speciesQuery = useSpecies();

  const predictionsQuery = useAiPredictions(
    useMemo<AiPredictionListParams>(
      () => ({
        processing_status:
          filters.processing_status === "all"
            ? undefined
            : (filters.processing_status as AiPredictionListParams["processing_status"]),
        verification_status:
          filters.verification_status === "all"
            ? undefined
            : (filters.verification_status as AiPredictionListParams["verification_status"]),
        predicted_species_id:
          filters.species_id === "all" ? undefined : Number(filters.species_id),
        threat_level:
          filters.threat_level === "all"
            ? undefined
            : (filters.threat_level as AiPredictionListParams["threat_level"]),
        analysis_type:
          filters.analysis_type === "all"
            ? undefined
            : (filters.analysis_type as AiPredictionListParams["analysis_type"]),
        min_confidence:
          filters.min_confidence === ""
            ? undefined
            : Number(filters.min_confidence),
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        page,
        per_page: PER_PAGE,
      }),
      [filters, page],
    ),
  );

  const predictions = predictionsQuery.data?.data ?? [];
  const speciesList = useMemo(
    () => speciesQuery.data?.data?.items ?? [],
    [speciesQuery.data],
  );

  const filterFields = useMemo<FilterField[]>(
    () => getHistoryFilterFields(speciesList),
    [speciesList],
  );

  const handleFilterChange = (values: FilterValues) => {
    setFilters(values as AiHistoryFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const pagination = predictionsQuery.data?.meta;
  const hasNextPage = pagination
    ? page < pagination.total_pages
    : predictions.length === PER_PAGE;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Vision"
        title="Riwayat Prediksi AI"
        description="Telusuri hasil identifikasi AI, status pemrosesan, dan status verifikasi manusia dari data backend."
      />

      <DataFilters
        fields={filterFields}
        values={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {speciesQuery.isError ? (
        <FormAlert
          message={formatApiError(speciesQuery.error, "Gagal memuat daftar spesies.")}
        />
      ) : null}

      {predictionsQuery.isPending ? (
        <Loading label="Memuat riwayat prediksi AI..." />
      ) : predictionsQuery.isError ? (
        <ErrorState
          kind={toApiErrorState(predictionsQuery.error).kind}
          message={toApiErrorState(predictionsQuery.error).message}
          status={toApiErrorState(predictionsQuery.error).status}
          errors={toApiErrorState(predictionsQuery.error).errors}
          onRetry={() => void predictionsQuery.refetch()}
        />
      ) : predictions.length === 0 ? (
        <EmptyState
          title="Belum ada prediksi"
          description="Ubah filter atau unggah gambar baru pada halaman AI Vision."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {predictions.map((prediction) => (
              <PredictionCard key={prediction.prediction_id} prediction={prediction} />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-xs text-muted">
            <span>
              Halaman {page} · Menampilkan {predictions.length} prediksi
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowLeft className="size-3.5" />}
                disabled={page === 1 || predictionsQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowRight className="size-3.5" />}
                iconPosition="right"
                disabled={!hasNextPage || predictionsQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const PredictionCard = ({ prediction }: { prediction: AiPrediction }) => {
  const speciesName =
    prediction.predictedSpecies?.common_name ??
    (prediction.predicted_species_id !== null
      ? `Spesies #${prediction.predicted_species_id}`
      : "Spesies tidak terdeteksi");

  return (
    <article className="ui-panel flex min-w-0 flex-col gap-4 p-4">
      <div className="flex items-start gap-3">
        {prediction.media?.media_type === "image" || !prediction.media ? (
          <AiPredictionImage
            mediaId={prediction.media_id}
            alt={`Gambar prediksi #${prediction.prediction_id}`}
            className="size-20 shrink-0"
            sizes="80px"
          />
        ) : (
          <span className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-muted text-muted">
            {prediction.media.media_type === "video" ? (
              <Film aria-label="Video" className="size-7" />
            ) : (
              <FileAudio aria-label="Audio" className="size-7" />
            )}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5">
            <AiProcessingBadge status={prediction.processing_status} />
            <AiVerificationBadge status={prediction.verification_status} />
            {prediction.threat_level && prediction.threat_level !== "none" ? (
              <AiThreatBadge level={prediction.threat_level} />
            ) : null}
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-ink">
            {prediction.analysis_type === "audio"
              ? (prediction.sound_label ?? "Suara tidak dikenali")
              : speciesName}
          </p>
          {(prediction.staff_face_count ?? 0) + (prediction.unknown_face_count ?? 0) > 0 ? (
            <p className="truncate text-xs text-ink-soft">
              {[
                prediction.staff_face_count ? `${prediction.staff_face_count} staf` : null,
                prediction.unknown_face_count
                  ? `${prediction.unknown_face_count} tidak dikenal`
                  : null,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          ) : null}
          <p className="text-xs text-muted">
            #{prediction.prediction_id} · {formatDate(prediction.processed_at)}
          </p>
        </div>
      </div>

      <AiConfidence value={prediction.confidence} />

      <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
        <StatusBadge
          label={
            prediction.media?.media_type === "video"
              ? "Video"
              : prediction.media?.media_type === "audio"
                ? "Audio"
                : "Foto"
          }
          variant="info"
        />
        <Link
          href={`/ai/vision/${prediction.prediction_id}/detail`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
        >
          <Eye aria-hidden="true" className="size-3.5" />
          Detail
        </Link>
      </div>
    </article>
  );
};
