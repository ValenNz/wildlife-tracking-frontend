"use client";

import Link from "next/link";
import { useState } from "react";
import { Paperclip } from "lucide-react";

import { AiProcessingBadge, AiThreatBadge } from "@/app/(protected)/ai/vision/ai-status";
import { Button } from "@/components/button";
import { FormCheckbox, FormField, SelectInput } from "@/components/form";
import { useToast } from "@/components/toast";
import { Panel, SectionHeader } from "@/components/ui/panel";
import {
  useIncidentMedia,
  useIncidentMediaUpload,
  useIncidentSyncStatusUpdate,
} from "@/hooks/use-incidents";
import { formatApiError } from "@/services/api";
import { AI_ACCEPTED_EXTENSIONS } from "@/types/ai.type";
import type { IncidentSyncStatus } from "@/types/incident.type";
import { formatDateTime } from "@/utils/format";

const SYNC_STATUS_LABELS: Record<IncidentSyncStatus, string> = {
  pending_sync: "Menunggu sinkron",
  synced: "Tersinkron",
  failed: "Gagal",
};

const MEDIA_LABELS: Record<string, string> = { image: "Foto", video: "Video", audio: "Audio" };

type IncidentAttachmentsProps = {
  reportId: number;
  syncStatus: IncidentSyncStatus | null;
  canUpload: boolean;
  canSync: boolean;
};

/** Lampiran bukti insiden (foto, video, audio) dan status sinkronisasi laporan. */
export function IncidentAttachments({
  reportId,
  syncStatus,
  canUpload,
  canSync,
}: IncidentAttachmentsProps) {
  const { showToast } = useToast();
  const mediaQuery = useIncidentMedia(reportId);
  const uploadMutation = useIncidentMediaUpload(reportId);
  const syncMutation = useIncidentSyncStatusUpdate(reportId);
  const [file, setFile] = useState<File | null>(null);
  const [analyze, setAnalyze] = useState(true);
  const media = mediaQuery.data ?? [];

  return (
    <Panel>
      <SectionHeader
        title="Lampiran Bukti"
        description="Foto, video, atau rekaman suara. Bila dianalisis AI, hasilnya tercatat dan bisa memicu notifikasi ancaman."
      />

      {canUpload ? (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <input
            type="file"
            aria-label="Berkas lampiran"
            accept={AI_ACCEPTED_EXTENSIONS.map((extension) => `.${extension}`).join(",")}
            className="text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:text-xs file:font-semibold file:text-forest-deep"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <FormCheckbox
            id="attachment-analyze"
            label="Analisis dengan AI"
            checked={analyze}
            onChange={(event) => setAnalyze(event.target.checked)}
          />
          <Button
            icon={<Paperclip className="size-4" />}
            disabled={!file}
            loading={uploadMutation.isPending}
            onClick={() =>
              file &&
              uploadMutation.mutate(
                { file, analyze },
                {
                  onSuccess: () => {
                    setFile(null);
                    showToast("Lampiran ditambahkan.", "success");
                  },
                  onError: (error) => showToast(formatApiError(error, "Gagal mengunggah lampiran."), "error"),
                },
              )
            }
          >
            Lampirkan
          </Button>
        </div>
      ) : null}

      {media.length === 0 ? (
        <p className="text-sm text-muted">Belum ada lampiran.</p>
      ) : (
        <ul className="divide-y divide-line">
          {media.map((item) => {
            const predictions = item.predictions ?? [];
            const latest = predictions[predictions.length - 1];

            return (
              <li key={item.media_id} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                <span className="text-ink-soft">
                  {MEDIA_LABELS[item.media_type] ?? item.media_type} · {formatDateTime(item.uploaded_at)}
                </span>
                {latest ? (
                  <span className="flex items-center gap-2">
                    <AiProcessingBadge status={latest.processing_status} />
                    {latest.threat_level && latest.threat_level !== "none" ? (
                      <AiThreatBadge level={latest.threat_level} />
                    ) : null}
                    <Link
                      href={`/ai/vision/${latest.prediction_id}/detail`}
                      className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      Hasil AI
                    </Link>
                  </span>
                ) : (
                  <span className="text-xs text-muted">Tidak dianalisis</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {canSync && syncStatus ? (
        <FormField label="Status Sinkronisasi" htmlFor="incident-sync-status" className="mt-5 max-w-xs">
          <SelectInput
            id="incident-sync-status"
            value={syncStatus}
            disabled={syncMutation.isPending}
            onChange={(event) =>
              syncMutation.mutate(event.target.value as IncidentSyncStatus, {
                onSuccess: () => showToast("Status sinkronisasi disimpan.", "success"),
                onError: (error) => showToast(formatApiError(error, "Gagal menyimpan status."), "error"),
              })
            }
          >
            {Object.entries(SYNC_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
        </FormField>
      ) : null}
    </Panel>
  );
}
