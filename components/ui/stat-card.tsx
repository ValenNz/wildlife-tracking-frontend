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

const ICON_BADGE = {
  neutral: "bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
  positive: "bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
  info: "bg-violet-500/12 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300",
  warning: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300",
  danger: "bg-rose-500/12 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",
} as const;

const HINT_TONE = {
  neutral: "text-muted",
  positive: "text-success",
  info: "text-muted",
  warning: "text-warning",
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
        "flex min-w-0 flex-col justify-between gap-3 rounded-[14px] border border-line/80 bg-surface p-5 shadow-card transition-shadow hover:shadow-md",
        color,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-ink-soft">{label}</p>
          <p className="mt-2 break-words text-[1.75rem] font-extrabold leading-tight tracking-tight text-ink tabular-nums">
            {value}
          </p>
        </div>
        {icon !== undefined ? (
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl",
              ICON_BADGE[tone],
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
      </div>
      {hint !== undefined ? (
        <p className={cn("text-xs font-semibold", HINT_TONE[tone])}>{hint}</p>
      ) : null}
    </div>
  );
}
