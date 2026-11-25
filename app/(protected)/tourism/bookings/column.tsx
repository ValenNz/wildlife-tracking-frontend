import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { BookingStatusBadge } from "@/components/tourism";
import type { TYPE_BOOKING } from "@/types/tourism.type";
import { formatDate, formatRupiah } from "@/utils/format";

export const getAdminBookingColumns = (): ColumnDef<TYPE_BOOKING>[] => [
  {
    accessorKey: "booking_code",
    header: "Kode",
    cell: ({ row }) => (
      <Link href={`/tourism/bookings/${row.original.booking_code}/detail`} className="font-mono text-xs font-bold text-primary hover:underline">
        {row.original.booking_code}
      </Link>
    ),
  },
  {
    id: "contact",
    header: "Pemesan",
    cell: ({ row }) => (
      <span className="flex flex-col text-sm">
        <span className="font-medium text-ink">{row.original.contact_name}</span>
        <span className="text-xs text-muted">{row.original.user?.email}</span>
      </span>
    ),
  },
  { id: "route", header: "Rute", cell: ({ row }) => <span className="text-sm">{row.original.route?.name ?? "-"}</span> },
  { accessorKey: "visit_date", header: "Kunjungan", cell: ({ row }) => formatDate(row.original.visit_date) },
  { accessorKey: "participant_count", header: "Peserta" },
  { accessorKey: "total_amount", header: "Total", cell: ({ row }) => <span className="font-semibold">{formatRupiah(row.original.total_amount)}</span> },
  { id: "status", header: "Status", cell: ({ row }) => <BookingStatusBadge status={row.original.status} /> },
];
