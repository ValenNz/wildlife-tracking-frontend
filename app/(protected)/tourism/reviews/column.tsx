import type { ColumnDef } from "@tanstack/react-table";
import { Eye, EyeOff } from "lucide-react";

import { StatusBadge } from "@/components/status";
import { RatingStars } from "@/components/tourism";
import type { TYPE_TOUR_REVIEW } from "@/types/tourism.type";
import { formatDate } from "@/utils/format";

export const getReviewColumns = ({ onToggle }: { onToggle: (review: TYPE_TOUR_REVIEW) => void }): ColumnDef<TYPE_TOUR_REVIEW>[] => [
  { accessorKey: "created_at", header: "Tanggal", cell: ({ row }) => formatDate(row.original.created_at) },
  { id: "user", header: "Pengulas", cell: ({ row }) => row.original.user?.full_name ?? "-" },
  {
    id: "route",
    header: "Rute / Pemandu",
    cell: ({ row }) => (
      <span className="flex flex-col text-sm">
        <span className="flex items-center gap-2">{row.original.route?.name}<RatingStars value={row.original.route_rating} /></span>
        <span className="flex items-center gap-2 text-xs text-muted">
          {row.original.guide?.display_name ?? "-"}
          {row.original.guide_rating ? <RatingStars value={row.original.guide_rating} /> : null}
        </span>
      </span>
    ),
  },
  { accessorKey: "comment", header: "Komentar", cell: ({ row }) => <p className="max-w-md whitespace-pre-line text-sm text-ink-soft">{row.original.comment ?? "-"}</p> },
  {
    id: "visible",
    header: "Status",
    cell: ({ row }) => <StatusBadge label={row.original.is_visible ? "Tampil" : "Disembunyikan"} variant={row.original.is_visible ? "success" : "neutral"} />,
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <button type="button" onClick={() => onToggle(row.original)} className="inline-flex items-center gap-1.5 rounded-lg border border-natural-muted px-3 py-1.5 text-xs font-semibold hover:bg-natural-muted/30">
        {row.original.is_visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        {row.original.is_visible ? "Sembunyikan" : "Tampilkan"}
      </button>
    ),
  },
];
