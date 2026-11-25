"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowUpRight, LoaderCircle, RotateCcw, Trash2 } from "lucide-react";

import { useToast } from "@/components/toast";
import { AiMediaViewer } from "./ai-media-viewer";
import { AiPredictionVerification } from "./ai-prediction-verification";
import {
  AiConfidence,
  AiProcessingBadge,
  AiThreatBadge,
  AiVerificationBadge,
  getConfidencePercent,
} from "./ai-status";
import { Button } from "@/components/button";
import { ConfirmationDialog } from "@/components/popup-confirmation";
import { Panel } from "@/components/ui/panel";
import { useAiDeletePrediction, useAiPredictionRetry } from "@/hooks/use-ai";
import { cn } from "@/lib/utils";
import { formatApiError } from "@/services/api";
import { formatDateTime } from "@/utils/format";
import {
  AI_BEHAVIOR_LABELS,
  AI_FACE_STATUS_LABELS,
  AI_MATCH_METHOD_LABELS,
  AI_PHYSICAL_CONDITION_LABELS,
  AI_SOUND_CATEGORY_LABELS,
  type AiPrediction,
} from "@/types/ai.type";

type AiPredictionResultProps = {
  prediction: AiPrediction;
  canVerify?: boolean;
  canDelete?: boolean;
  onVerified?: () => void;
  onDeleted?: () => void;
  detailHref?: string;
};

const isRunning = (prediction: AiPrediction) =>
  prediction.processing_status === "queued" || prediction.processing_status === "processing";

const FACE_DOT: Record<string, string> = {
  staff: "bg-forest-primary",
  possible_staff: "bg-natural-muted ring-1 ring-sage",
  unknown: "bg-forest-black",
};

export function AiPredictionResult({
  prediction,
  canVerify = false,
  canDelete = false,
  onVerified,
  onDeleted,
  detailHref,
}: AiPredictionResultProps) {
  const { showToast } = useToast();
  const retry = useAiPredictionRetry();
  const remove = useAiDeletePrediction();
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const running = isRunning(prediction);
  const mediaType = prediction.media?.media_type ?? (prediction.analysis_type === "audio" ? "audio" : null);
  const faces = prediction.faces ?? [];
  const species = prediction.predictedSpecies;
  const animal = prediction.predictedAnimal;
  const isAudio = mediaType === "audio";

  const handleRetry = () =>
    retry.mutate(prediction.prediction_id, {
      onSuccess: () => {
        showToast("Analisis diulang.", "success");
        onVerified?.();
      },
      onError: (error) => showToast(formatApiError(error, "Gagal mengulang analisis."), "error"),
    });

  const handleDelete = () =>
    remove.mutate(prediction.prediction_id, {
      onSuccess: () => {
        showToast("Prediksi dihapus.", "success");
        setConfirmDelete(false);
        onDeleted?.();
      },
      onError: (error) => showToast(formatApiError(error, "Gagal menghapus prediksi."), "error"),
    });

  return (
    <Panel className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-ink">Hasil analisis #{prediction.prediction_id}</h3>
          <p className="mt-1 break-all text-xs text-muted">
            {formatDateTime(prediction.processed_at)} · {prediction.model_version}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AiProcessingBadge status={prediction.processing_status} />
          <AiVerificationBadge status={prediction.verification_status} />
          {!running ? <AiThreatBadge level={prediction.threat_level} /> : null}
        </div>
      </div>

      {running ? (
        <div role="status" className="flex items-center gap-3 rounded-xl bg-primary-soft/70 p-4 text-sm text-ink-soft">
          <LoaderCircle aria-hidden="true" className="size-5 shrink-0 animate-spin text-primary" />
          Media sedang dianalisis di antrean. Halaman ini memperbarui hasilnya otomatis; gambar sekitar 3 detik, video sekitar 20 detik.
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <AiMediaViewer
          mediaId={prediction.media_id}
          mediaType={mediaType}
          objects={prediction.detected_objects}
          faces={mediaType === "image" ? faces : null}
          seekTo={seekTo}
          alt={`Media prediksi AI #${prediction.prediction_id}`}
          className={cn(mediaType === "video" && "aspect-video", isAudio && "min-h-32")}
        />

        <dl className="flex min-w-0 flex-col divide-y divide-line">
          {!isAudio ? (
            <Finding label="Satwa">
              {species ? (
                <>
                  <p className="text-lg font-semibold text-ink">{species.common_name}</p>
                  <p className="text-sm italic text-ink-soft">{species.scientific_name}</p>
                </>
              ) : prediction.detected_label && prediction.detected_label !== "no_animal" ? (
                <p className="text-lg font-semibold text-ink">{prediction.detected_label}</p>
              ) : (
                <p className="text-sm text-muted">Tidak ada satwa terdeteksi.</p>
              )}
              {(species || (prediction.individual_count ?? 0) > 0) && getConfidencePercent(prediction.confidence) ? (
                <AiConfidence value={prediction.confidence} className="mt-2 max-w-sm" />
              ) : null}
              {(prediction.individual_count ?? 0) > 0 ? (
                <p className="mt-2 text-sm text-ink-soft">{prediction.individual_count} individu dalam media.</p>
              ) : null}
            </Finding>
          ) : null}

          {animal ? (
            <Finding label="Individu">
              <Link href={`/animals/${animal.animal_id}/detail`} className="font-semibold text-primary underline-offset-2 hover:underline">
                {animal.name_animal ?? animal.name ?? `Satwa #${animal.animal_id}`}
              </Link>
              <p className="text-xs text-muted">
                {AI_MATCH_METHOD_LABELS[prediction.animal_match_method ?? ""] ?? prediction.animal_match_method}
                {prediction.animal_match_confidence !== null && prediction.animal_match_confidence !== undefined
                  ? ` · skor ${Number(prediction.animal_match_confidence).toFixed(2)}`
                  : ""}
              </p>
            </Finding>
          ) : null}

          {!isAudio ? (
            <Finding label="Wajah manusia">
              {faces.length === 0 ? (
                <p className="text-sm text-muted">Tidak ada wajah terdeteksi.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {faces.map((face, index) => (
                    <li key={index} className="flex flex-wrap items-center gap-2 text-sm">
                      <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", FACE_DOT[face.status] ?? FACE_DOT.unknown)} />
                      <span className="font-semibold text-ink">{face.label}</span>
                      <span className="text-xs text-muted">
                        {AI_FACE_STATUS_LABELS[face.status] ?? face.status}
                        {face.similarity !== null && face.similarity !== undefined ? ` · kemiripan ${Number(face.similarity).toFixed(2)}` : ""}
                      </span>
                      {face.time_seconds !== null && face.time_seconds !== undefined ? (
                        <button
                          type="button"
                          onClick={() => setSeekTo(Number(face.time_seconds ?? 0))}
                          className="rounded px-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
                        >
                          detik ke-{Math.round(Number(face.time_seconds))}
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </Finding>
          ) : null}

          {prediction.sound_category || isAudio ? (
            <Finding label={mediaType === "video" ? "Suara dalam video" : "Suara"}>
              <p className="text-sm font-semibold text-ink">
                {prediction.sound_label ?? (prediction.sound_category ? AI_SOUND_CATEGORY_LABELS[prediction.sound_category] : "Tidak dikenali")}
              </p>
            </Finding>
          ) : null}

          {prediction.physical_condition || prediction.behavior ? (
            <Finding label="Kondisi & perilaku">
              <p className="text-sm text-ink">
                {prediction.physical_condition ? AI_PHYSICAL_CONDITION_LABELS[prediction.physical_condition] : "-"}
                {" · "}
                {prediction.behavior ? AI_BEHAVIOR_LABELS[prediction.behavior] : "-"}
              </p>
              {prediction.condition_notes || prediction.behavior_notes ? (
                <p className="mt-1 text-xs text-muted">
                  {[prediction.condition_notes, prediction.behavior_notes].filter(Boolean).join(" ")}
                </p>
              ) : null}
            </Finding>
          ) : null}

          {prediction.ai_summary ? (
            <Finding label="Ringkasan">
              <p className="text-sm leading-6 text-ink-soft">{prediction.ai_summary}</p>
            </Finding>
          ) : null}
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        {detailHref ? (
          <Link
            href={detailHref}
            className="mr-auto inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
          >
            Buka detail prediksi
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        ) : (
          <span className="mr-auto" />
        )}
        {canVerify && !running && prediction.verification_status === "pending" ? (
          <Button
            variant="outline"
            size="sm"
            loading={retry.isPending}
            icon={<RotateCcw className="size-3.5" />}
            onClick={handleRetry}
          >
            Analisis ulang
          </Button>
        ) : null}
        {canDelete ? (
          <Button variant="danger" size="sm" icon={<Trash2 className="size-3.5" />} onClick={() => setConfirmDelete(true)}>
            Hapus
          </Button>
        ) : null}
      </div>

      {canVerify && !running && prediction.verification_status === "pending" ? (
        <div className="border-t border-line pt-4">
          <p className="mb-3 text-sm font-semibold text-ink">Verifikasi petugas</p>
          <AiPredictionVerification
            predictionId={prediction.prediction_id}
            defaultSpeciesId={prediction.predicted_species_id}
            defaultAnimalId={prediction.predicted_animal_id ?? null}
            requireSpecies={!isAudio}
            onVerified={onVerified}
          />
        </div>
      ) : null}

      <ConfirmationDialog
        open={confirmDelete}
        title="Hapus prediksi?"
        description="Prediksi AI ini dihapus permanen. Media aslinya tetap tersimpan."
        isPending={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Panel>
  );
}

function Finding({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
