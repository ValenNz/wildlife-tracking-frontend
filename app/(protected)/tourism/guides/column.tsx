import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/status";
import { GuideAvatar } from "@/components/tourism";
import type { TYPE_TOUR_GUIDE } from "@/types/tourism.type";

type Actions = { onEdit: (guide: TYPE_TOUR_GUIDE) => void; onDelete: (guide: TYPE_TOUR_GUIDE) => void };

export const getGuideColumns = ({ onEdit, onDelete }: Actions): ColumnDef<TYPE_TOUR_GUIDE>[] => [
  {
    accessorKey: "display_name",
    header: "Pemandu",
    cell: ({ row }) => (
      <span className="flex items-center gap-3">
        <GuideAvatar guideId={row.original.guide_id} name={row.original.display_name} hasPhoto={row.original.has_photo} size="sm" />
        <span className="flex flex-col">
          <span className="font-medium text-ink">{row.original.display_name}</span>
          <span className="text-xs text-muted">{row.original.languages.join(", ")}</span>
        </span>
      </span>
    ),
  },
  { accessorKey: "favorite_animal", header: "Satwa Favorit" },
  { accessorKey: "years_experience", header: "Pengalaman", cell: ({ row }) => `${row.original.years_experience} th` },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge label={row.original.is_active ? "Aktif" : "Nonaktif"} variant={row.original.is_active ? "success" : "neutral"} />,
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button type="button" aria-label={`Ubah ${row.original.display_name}`} onClick={() => onEdit(row.original)} className="inline-flex size-9 items-center justify-center rounded-lg border border-natural-muted hover:bg-natural-muted/30"><Pencil className="size-4" /></button>
        <button type="button" aria-label={`Hapus ${row.original.display_name}`} onClick={() => onDelete(row.original)} className="inline-flex size-9 items-center justify-center rounded-lg border border-danger/40 text-danger hover:bg-danger/10"><Trash2 className="size-4" /></button>
      </div>
    ),
  },
];
