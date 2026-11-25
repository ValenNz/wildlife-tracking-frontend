import type { ColumnDef } from "@tanstack/react-table";

import type { TYPE_ACTIVITY_LOG } from "@/types/activity-log.type";
import { formatDateTime } from "@/utils/format";

/** Detail log berupa objek JSON; tampilkan sebagai "kunci: nilai". */
const describeDetails = (details: unknown): string => {
  if (details === null || details === undefined || details === "") return "-";
  if (typeof details === "string") return details;

  return Object.entries(details as Record<string, unknown>)
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
    .join(", ");
};

export const getActivityLogColumns = (): ColumnDef<TYPE_ACTIVITY_LOG>[] => [
  {
    accessorKey: "timestamp",
    header: "Waktu",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-olive-dark">
        {formatDateTime(row.original.timestamp)}
      </span>
    ),
  },
  {
    id: "user",
    header: "Pengguna",
    accessorFn: (log) => log.user?.full_name ?? log.user?.username ?? "",
    cell: ({ row }) => (
      <span className="text-sm text-olive-dark">
        {row.original.user?.full_name ?? row.original.user?.username ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => <span className="font-medium text-olive-dark">{row.original.action}</span>,
  },
  {
    id: "details",
    header: "Detail",
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-md break-all text-xs text-sage">
        {describeDetails(row.original.details)}
      </span>
    ),
  },
];
