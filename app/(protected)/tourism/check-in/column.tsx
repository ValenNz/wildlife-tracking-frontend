import type { ColumnDef } from "@tanstack/react-table";

import { BookingStatusBadge } from "@/components/tourism";
import { SHIFT_LABELS, type TYPE_BOOKING } from "@/types/tourism.type";
import { formatDateTime } from "@/utils/format";

export const getTodayVisitColumns = (): ColumnDef<TYPE_BOOKING>[] => [
  {
    accessorKey: "booking_code",
    header: "Kode",
    cell: ({ row }) => <span className="font-mono text-xs font-bold text-primary">{row.original.booking_code}</span>,
  },
  { accessorKey: "contact_name", header: "Penanggung Jawab" },
  {
    id: "route",
    header: "Rute & Shift",
    cell: ({ row }) => (
      <span className="flex flex-col text-sm">
        <span className="font-medium text-ink">{row.original.route?.name ?? "-"}</span>
        <span className="text-xs text-muted">
          {row.original.shift ? `${SHIFT_LABELS[row.original.shift.shift_type]} · ${row.original.shift.guide?.display_name ?? ""}` : ""}
        </span>
      </span>
    ),
  },
  { accessorKey: "participant_count", header: "Peserta" },
  { id: "status", header: "Status", cell: ({ row }) => <BookingStatusBadge status={row.original.status} /> },
  {
    id: "checked_in_at",
    header: "Check-in",
    cell: ({ row }) => <span className="text-xs text-muted">{row.original.checked_in_at ? formatDateTime(row.original.checked_in_at) : "-"}</span>,
  },
];
