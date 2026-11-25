import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export function Panel({ children, className, padded = true }: PanelProps) {
  return (
    <section
      className={cn("ui-panel min-w-0", padded && "p-5 sm:p-6", className)}
    >
      {children}
    </section>
  );
}

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-baseline justify-between gap-3",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink sm:text-base">
          {title}
        </h2>
        {description !== undefined ? (
          <p className="mt-0.5 text-[13px] text-muted">{description}</p>
        ) : null}
      </div>
      {action !== undefined ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow !== undefined ? (
          <p className="mb-1 text-xs font-medium text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-serif text-2xl font-medium tracking-[-0.02em] text-ink sm:text-[1.9rem] sm:leading-tight">
          {title}
        </h2>
        {description !== undefined ? (
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-6 text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions !== undefined ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
