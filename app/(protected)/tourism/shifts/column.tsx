import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Pencil, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/status";
import { SHIFT_LABELS, type TYPE_GUIDE_SHIFT } from "@/types/tourism.type";
import { formatDate } from "@/utils/format";

type Actions = {
  onEdit: (shift: TYPE_GUIDE_SHIFT) => void;
  onCancel: (shift: TYPE_GUIDE_SHIFT) => void;
  onDelete: (shift: TYPE_GUIDE_SHIFT) => void;
};

export const getShiftColumns = ({ onEdit, onCancel, onDelete }: Actions): ColumnDef<TYPE_GUIDE_SHIFT>[] => [
  { accessorKey: "shift_date", header: "Tanggal", cell: ({ row }) => formatDate(row.original.shift_date) },
  {
    id: "shift",
    header: "Shift",
    cell: ({ row }) => `${SHIFT_LABELS[row.original.shift_type]} ${row.original.start_time?.slice(0, 5)}–${row.original.end_time?.slice(0, 5)}`,
  },
  { id: "guide", header: "Pemandu", cell: ({ row }) => row.original.guide?.display_name ?? "-" },
  { id: "route", header: "Rute", cell: ({ row }) => row.original.route?.name ?? "-" },
  {
    id: "quota",
    header: "Kuota",
    cell: ({ row }) => `${row.original.remaining ?? row.original.capacity}/${row.original.capacity}`,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge label={row.original.status === "scheduled" ? "Terjadwal" : "Dibatalkan"} variant={row.original.status === "scheduled" ? "success" : "neutral"} />
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button type="button" aria-label="Ubah shift" onClick={() => onEdit(row.original)} className="inline-flex size-9 items-center justify-center rounded-lg border border-natural-muted hover:bg-natural-muted/30"><Pencil className="size-4" /></button>
        {row.original.status === "scheduled" ? (
          <button type="button" aria-label="Batalkan shift" onClick={() => onCancel(row.original)} className="inline-flex size-9 items-center justify-center rounded-lg border border-natural-muted hover:bg-natural-muted/30"><Ban className="size-4" /></button>
        ) : null}
        <button type="button" aria-label="Hapus shift" onClick={() => onDelete(row.original)} className="inline-flex size-9 items-center justify-center rounded-lg border border-danger/40 text-danger hover:bg-danger/10"><Trash2 className="size-4" /></button>
      </div>
    ),
  },
];
