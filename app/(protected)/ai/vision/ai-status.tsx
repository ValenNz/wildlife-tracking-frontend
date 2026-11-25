import { StatusBadge, type BadgeVariant } from "@/components/status";
import {
  AI_THREAT_LEVEL_LABELS,
  type AiThreatLevel,
  AI_PROCESSING_STATUS_LABELS,
  AI_VERIFICATION_STATUS_LABELS,
  type AiProcessingStatus,
  type AiVerificationStatus,
} from "@/types/ai.type";

const PROCESSING_VARIANTS: Record<AiProcessingStatus, BadgeVariant> = {
  queued: "neutral",
  processing: "info",
  completed: "success",
  failed: "danger",
  unrecognized: "warning",
};

const VERIFICATION_VARIANTS: Record<AiVerificationStatus, BadgeVariant> = {
  pending: "warning",
  confirmed: "success",
  rejected: "danger",
};

export const getConfidencePercent = (
  value: number | string | null | undefined,
): number | null => {
  if (value === null || value === undefined || value === "") return null;

  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;

  const percent = numeric >= 0 && numeric <= 1 ? numeric * 100 : numeric;
  return Math.max(0, Math.min(100, percent));
};

export function AiProcessingBadge({ status }: { status: AiProcessingStatus }) {
  return (
    <StatusBadge
      label={AI_PROCESSING_STATUS_LABELS[status] ?? status}
      variant={PROCESSING_VARIANTS[status] ?? "neutral"}
    />
  );
}

export function AiVerificationBadge({
  status,
}: {
  status: AiVerificationStatus;
}) {
  return (
    <StatusBadge
      label={AI_VERIFICATION_STATUS_LABELS[status] ?? status}
      variant={VERIFICATION_VARIANTS[status] ?? "neutral"}
    />
  );
}

export function AiConfidence({
  value,
  className,
}: {
  value: number | string | null | undefined;
  className?: string;
}) {
  const percent = getConfidencePercent(value);

  if (percent === null) {
    return <span className="text-xs text-muted">Skor tidak tersedia</span>;
  }

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted">
        <span>Tingkat kepercayaan</span>
        <span className="font-semibold tabular-nums text-ink-soft">
          {percent.toFixed(1)}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const THREAT_VARIANTS: Record<AiThreatLevel, BadgeVariant> = {
  none: "neutral",
  low: "info",
  medium: "warning",
  high: "danger",
  critical: "danger",
};

export function AiThreatBadge({ level }: { level?: AiThreatLevel | null }) {
  const value = level ?? "none";

  return (
    <StatusBadge
      label={`Ancaman: ${AI_THREAT_LEVEL_LABELS[value] ?? value}`}
      variant={THREAT_VARIANTS[value] ?? "neutral"}
    />
  );
}
