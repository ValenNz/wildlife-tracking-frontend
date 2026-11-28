import Link from "next/link";
import { ChevronRight, House } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

const formatSegment = (segment: string) =>
  /^\d+$/.test(segment)
    ? "Detail"
    : segment.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
      <House aria-hidden="true" className="size-3.5 shrink-0 text-muted" />
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
            {item.href !== undefined && !isLast ? (
              <Link
                href={item.href}
                className="truncate text-xs font-medium text-muted transition hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className="truncate text-xs font-semibold text-ink"
              >
                {item.label}
              </span>
            )}

            {!isLast ? (
              <ChevronRight aria-hidden="true" className="size-3 shrink-0 text-line-strong" />
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}

export const buildPathBreadcrumbs = (
  pathname: string,
  home: BreadcrumbItem = { label: "Dashboard", href: "/dashboard" },
): BreadcrumbItem[] => {
  const segments = pathname.split("/").filter(Boolean);

  return [
    home,
    ...segments.slice(1).map((segment, index) => ({
      label: formatSegment(segment),

      href: /^\d+$/.test(segment) ? undefined : `/${segments.slice(0, index + 2).join("/")}`,
    })),
  ];
};
