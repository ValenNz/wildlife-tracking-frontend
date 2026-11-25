import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/status";
import { DIFFICULTY_LABELS, type TYPE_TOUR_ROUTE } from "@/types/tourism.type";
import { formatRupiah } from "@/utils/format";

export const getRouteColumns = ({ onDelete }: { onDelete: (route: TYPE_TOUR_ROUTE) => void }): ColumnDef<TYPE_TOUR_ROUTE>[] => [
  { accessorKey: "code", header: "Kode", cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.code}</span> },
  {
    accessorKey: "name",
    header: "Rute",
    cell: ({ row }) => (
      <span className="flex flex-col">
        <Link href={`/tours/${row.original.slug}/detail`} className="font-medium text-primary hover:underline">{row.original.name}</Link>
        <span className="text-xs text-muted">{row.original.entry_point}</span>
      </span>
    ),
  },
  { id: "difficulty", header: "Tingkat", cell: ({ row }) => DIFFICULTY_LABELS[row.original.difficulty] },
  {
    id: "duration",
    header: "Durasi",
    cell: ({ row }) => (row.original.duration_days > 1 ? `${row.original.duration_days} hari` : `${row.original.duration_hours} jam`),
  },
  { accessorKey: "guide_fee_per_person", header: "Jasa Pemandu", cell: ({ row }) => formatRupiah(row.original.guide_fee_per_person) },
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
        <Link href={`/tourism/routes/${row.original.route_id}/edit`} aria-label={`Ubah ${row.original.name}`} className="inline-flex size-9 items-center justify-center rounded-lg border border-natural-muted hover:bg-natural-muted/30"><Pencil className="size-4" /></Link>
        <button type="button" aria-label={`Hapus ${row.original.name}`} onClick={() => onDelete(row.original)} className="inline-flex size-9 items-center justify-center rounded-lg border border-danger/40 text-danger hover:bg-danger/10"><Trash2 className="size-4" /></button>
      </div>
    ),
  },
];
