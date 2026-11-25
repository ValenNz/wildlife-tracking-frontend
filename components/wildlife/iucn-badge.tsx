import { cn } from "@/lib/utils";
import type { TYPE_CONSERVATION_STATUS } from "@/types/species.type";
import { IUCN_LABELS } from "@/types/wildlife.type";

export function IucnBadge({ status, className }: { status: TYPE_CONSERVATION_STATUS; className?: string }) {
  const info = IUCN_LABELS[status] ?? { code: "?", label: status, tone: "bg-surface-muted text-ink" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", info.tone, className)} title={`IUCN: ${status}`}>
      <span className="rounded bg-black/15 px-1">{info.code}</span>
      {info.label}
    </span>
  );
}
