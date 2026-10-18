import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "warning";
  className?: string;
};

const TONE_STYLES = {
  neutral: "border-zinc-200 bg-white text-zinc-900",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-orange-200 bg-orange-50 text-orange-900",
} as const;

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border px-4 py-3",
        TONE_STYLES[tone],
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="text-xs opacity-70">{hint}</p> : null}
    </div>
  );
}