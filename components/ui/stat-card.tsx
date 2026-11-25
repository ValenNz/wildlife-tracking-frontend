import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "warning" | "info" | "danger";
  icon?: ReactNode;
  color?: string;
  className?: string;
};

const ACCENT_BAR = {
  neutral: "border-t-line",
  positive: "border-t-forest-primary",
  warning: "border-t-warning",
  info: "border-t-forest-deep",
  danger: "border-t-danger",
} as const;

const ICON_TONE = {
  neutral: "text-muted",
  positive: "text-forest-primary",
  warning: "text-warning",
  info: "text-info",
  danger: "text-danger",
} as const;

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
  color,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col justify-between gap-2.5 rounded-card border border-line border-t-2 bg-surface px-4 py-4 transition-colors hover:border-line-strong/60",
        ACCENT_BAR[tone],
        color,
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">{label}</p>
        {icon !== undefined ? (
          <span className={cn("shrink-0", ICON_TONE[tone])} aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="break-words font-serif text-3xl font-medium leading-none tracking-tight text-ink tabular-nums">
        {value}
      </p>
      {hint !== undefined ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
