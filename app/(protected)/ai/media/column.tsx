import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { RotateCcw, Trash2 } from "lucide-react";

import { AiProcessingBadge, AiThreatBadge } from "../vision/ai-status";
import type { AiMediaUpload } from "@/types/ai.type";
import { formatDateTime } from "@/utils/format";

const MEDIA_LABELS: Record<string, string> = {
  image: "Foto",
  video: "Video",
  audio: "Audio",
};

type MediaColumnActions = {
  canAnalyze: boolean;
  canDelete: boolean;
  analyzingId: number | null;
  onAnalyze: (media: AiMediaUpload) => void;
  onDelete: (media: AiMediaUpload) => void;
};

export const getMediaColumns = ({
  canAnalyze,
  canDelete,
  analyzingId,
  onAnalyze,
  onDelete,
}: MediaColumnActions): ColumnDef<AiMediaUpload>[] => [
  {
    accessorKey: "media_id",
    header: "Media",
    cell: ({ row }) => {
      const sizeMb = Number(row.original.file_size ?? 0) / 1024 / 1024;

      return (
        <div>
          <p className="font-medium text-olive-dark">
            {MEDIA_LABELS[row.original.media_type] ?? row.original.media_type} #{row.original.media_id}
          </p>
          <p className="text-xs text-sage">
            {sizeMb > 0 ? `${sizeMb.toFixed(1)} MB` : ""}
            {row.original.uploader?.full_name ? ` · ${row.original.uploader.full_name}` : ""}
          </p>
        </div>
      );
    },
  },
  {
    id: "captured_at",
    header: "Waktu Diambil",
    accessorFn: (row) => row.captured_at ?? row.uploaded_at ?? "",
    cell: ({ row }) => (
      <span className="text-sm text-olive-dark">
        {formatDateTime(row.original.captured_at ?? row.original.uploaded_at)}
      </span>
    ),
  },
  {
    id: "source",
    header: "Sumber",
    cell: ({ row }) => (
      <span className="text-sm text-olive-dark">
        {[
          row.original.device?.model,
          row.original.zone?.zone_name,
          row.original.report ? `Insiden #${row.original.report.report_id}` : null,
        ]
          .filter(Boolean)
          .join(" · ") || "Unggahan manual"}
      </span>
    ),
  },
  {
    id: "result",
    header: "Hasil AI",
    cell: ({ row }) => {
      const predictions = row.original.predictions ?? [];
      const latest = predictions[predictions.length - 1];

      if (!latest) {
        return <span className="text-xs text-sage">Belum dianalisis</span>;
      }

      return (
        <div className="flex flex-wrap items-center gap-1.5">
          <AiProcessingBadge status={latest.processing_status} />
          {latest.threat_level && latest.threat_level !== "none" ? (
            <AiThreatBadge level={latest.threat_level} />
          ) : null}
          <Link
            href={`/ai/vision/${latest.prediction_id}/detail`}
            className="text-xs font-semibold text-forest-primary underline-offset-2 hover:underline"
          >
            #{latest.prediction_id}
          </Link>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {canAnalyze ? (
          <button
            type="button"
            disabled={analyzingId === row.original.media_id}
            onClick={() => onAnalyze(row.original)}
            className="inline-flex items-center gap-2 rounded-lg border border-natural-muted px-3 py-2 text-sm font-medium text-forest-deep transition hover:bg-natural-muted/30 disabled:opacity-50"
          >
            <RotateCcw size={15} />
            {analyzingId === row.original.media_id ? "Memproses..." : "Analisis"}
          </button>
        ) : null}
        {canDelete ? (
          <button
            type="button"
            onClick={() => onDelete(row.original)}
            className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger-soft"
          >
            <Trash2 size={15} />
            Hapus
          </button>
        ) : null}
      </div>
    ),
  },
];
