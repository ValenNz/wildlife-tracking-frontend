import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { StatusBadge } from "@/components/status";
import type { TYPE_POS_SESSION } from "@/types/pos.type";
import { formatDateTime, formatRupiah } from "@/utils/format";

export const getSessionColumns = (): ColumnDef<TYPE_POS_SESSION>[] => [
  {
    accessorKey: "session_id",
    header: "Sesi",
    cell: ({ row }) => (
      <Link href={`/pos/sessions/${row.original.session_id}/detail`} className="font-semibold text-primary hover:underline">
        #{row.original.session_id} · {row.original.counter_name}
      </Link>
    ),
  },
  { id: "cashier", header: "Kasir", cell: ({ row }) => row.original.cashier?.full_name ?? "-" },
  { accessorKey: "opened_at", header: "Buka", cell: ({ row }) => formatDateTime(row.original.opened_at) },
  { accessorKey: "closed_at", header: "Tutup", cell: ({ row }) => (row.original.closed_at ? formatDateTime(row.original.closed_at) : "-") },
  { id: "transactions", header: "Transaksi", cell: ({ row }) => row.original.summary.transactions },
  { id: "gross", header: "Penjualan", cell: ({ row }) => <span className="font-semibold">{formatRupiah(row.original.summary.gross)}</span> },
  {
    id: "difference",
    header: "Selisih kas",
    cell: ({ row }) =>
      row.original.is_open ? (
        <StatusBadge label="Masih buka" variant="info" />
      ) : row.original.cash_difference === 0 ? (
        <StatusBadge label="Sesuai" variant="success" />
      ) : (
        <StatusBadge label={`${(row.original.cash_difference ?? 0) > 0 ? "+" : "−"}${formatRupiah(Math.abs(row.original.cash_difference ?? 0))}`} variant="danger" />
      ),
  },
];
