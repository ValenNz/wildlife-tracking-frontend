type EmptyStateProps = {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={
        className === undefined
          ? "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-12 text-center"
          : `flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-12 text-center ${className}`
      }
    >
      <p className="text-sm font-semibold text-zinc-800">{title}</p>
      {description ? <p className="text-sm text-zinc-500">{description}</p> : null}
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}