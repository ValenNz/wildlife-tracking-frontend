export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  warning: "bg-amber-100 text-amber-800 ring-amber-600/20",
  danger: "bg-red-100 text-red-800 ring-red-600/20",
  info: "bg-sky-100 text-sky-800 ring-sky-600/20",
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-600/20",
};

const BASE_STYLE =
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset";

type StatusBadgeProps = {
  label: string;
  variant: BadgeVariant;
  className?: string;
};

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  const style =
    className === undefined
      ? `${BASE_STYLE} ${VARIANT_STYLES[variant]}`
      : `${BASE_STYLE} ${VARIANT_STYLES[variant]} ${className}`;

  return <span className={style}>{label}</span>;
}