import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Eye } from "lucide-react";

import { PaymentStatusBadge } from "@/components/tourism";
import { PAYMENT_METHOD_LABELS, type TYPE_PAYMENT } from "@/types/tourism.type";
import { formatDate, formatDateTime, formatRupiah } from "@/utils/format";

export const getPaymentColumns = ({ onReview }: { onReview: (payment: TYPE_PAYMENT) => void }): ColumnDef<TYPE_PAYMENT>[] => [
  { accessorKey: "reference", header: "Referensi", cell: ({ row }) => <span className="font-mono text-xs">{row.original.reference}</span> },
  {
    id: "booking",
    header: "Pemesanan",
    cell: ({ row }) =>
      row.original.booking ? (
        <Link href={`/tourism/bookings/${row.original.booking.booking_code}/detail`} className="flex flex-col text-sm">
          <span className="font-mono text-xs font-bold text-primary hover:underline">{row.original.booking.booking_code}</span>
          <span className="text-xs text-muted">{row.original.booking.contact_name} · {formatDate(row.original.booking.visit_date)}</span>
        </Link>
      ) : "-",
  },
  { id: "method", header: "Metode", cell: ({ row }) => PAYMENT_METHOD_LABELS[row.original.method] },
  { accessorKey: "amount", header: "Jumlah", cell: ({ row }) => <span className="font-semibold">{formatRupiah(row.original.amount)}</span> },
  { id: "status", header: "Status", cell: ({ row }) => <PaymentStatusBadge status={row.original.status} /> },
  { accessorKey: "updated_at", header: "Diperbarui", cell: ({ row }) => <span className="text-xs text-muted">{formatDateTime(row.original.updated_at)}</span> },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) =>
      row.original.has_proof ? (
        <button type="button" onClick={() => onReview(row.original)} className="inline-flex items-center gap-1.5 rounded-lg border border-natural-muted px-3 py-1.5 text-xs font-semibold text-forest-deep hover:bg-natural-muted/30">
          <Eye className="size-3.5" />
          {row.original.status === "awaiting_verification" ? "Periksa" : "Lihat bukti"}
        </button>
      ) : (
        <span className="text-xs text-muted">Belum ada bukti</span>
      ),
  },
];
