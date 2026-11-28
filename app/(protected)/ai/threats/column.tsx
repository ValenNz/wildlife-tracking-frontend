import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";

import { AiThreatBadge, AiVerificationBadge } from "../vision/ai-status";
import type { AiPrediction } from "@/types/ai.type";
import { formatDateTime } from "@/utils/format";

const MEDIA_LABELS: Record<string, string> = {
  image: "Foto",
  video: "Video",
  audio: "Audio",
};


export const describeThreat = (prediction: AiPrediction): string =>
  prediction.sound_label ??
  (prediction.unknown_face_count
    ? `${prediction.unknown_face_count} orang tidak dikenal`
    : null) ??
  prediction.predictedSpecies?.common_name ??
  prediction.detected_label ??
  "Temuan AI";

export const getThreatColumns = (): ColumnDef<AiPrediction>[] => [
  {
    id: "time",
    header: "Waktu",
    accessorFn: (row) => row.media?.captured_at ?? row.processed_at ?? "",
    cell: ({ row }) => (
      <span className="text-sm text-olive-dark">
        {formatDateTime(row.original.media?.captured_at ?? row.original.processed_at)}
      </span>
    ),
  },
  {
    accessorKey: "threat_level",
    header: "Ancaman",
    cell: ({ row }) => <AiThreatBadge level={row.original.threat_level} />,
  },
  {
    id: "finding",
    header: "Temuan",
    accessorFn: describeThreat,
    cell: ({ row }) => (
      <div className="max-w-md">
        <p className="font-medium text-olive-dark">{describeThreat(row.original)}</p>
        {row.original.ai_summary ? (
          <p className="line-clamp-2 text-xs text-sage">{row.original.ai_summary}</p>
        ) : null}
      </div>
    ),
  },
  {
    id: "source",
    header: "Sumber",
    cell: ({ row }) => {
      const media = row.original.media;

      return (
        <div className="text-sm text-olive-dark">
          <p>{MEDIA_LABELS[media?.media_type ?? ""] ?? "-"}</p>
          <p className="text-xs text-sage">
            {[media?.zone?.zone_name, media?.device?.model].filter(Boolean).join(" · ") ||
              "Unggahan manual"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "verification_status",
    header: "Verifikasi",
    cell: ({ row }) => <AiVerificationBadge status={row.original.verification_status} />,
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <Link
        href={`/ai/vision/${row.original.prediction_id}/detail`}
        className="inline-flex items-center gap-2 rounded-lg border border-natural-muted px-3 py-2 text-sm font-medium text-forest-deep transition hover:bg-natural-muted/30"
      >
        <Eye size={15} />
        Detail
      </Link>
    ),
  },
];
