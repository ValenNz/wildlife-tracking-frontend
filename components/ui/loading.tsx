export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

type LoadingProps = {
  label?: string;
  className?: string;
};

export function Loading({ label = "Memuat data...", className }: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        className === undefined
          ? "flex min-h-[12rem] w-full flex-col items-center justify-center gap-3 text-zinc-500"
          : `flex min-h-[12rem] w-full flex-col items-center justify-center gap-3 text-zinc-500 ${className}`
      }
    >
      <span
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}