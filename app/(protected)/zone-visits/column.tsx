import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { LogOut } from "lucide-react";

import { StatusBadge } from "@/components/status";
import type { TYPE_ZONE_VISIT } from "@/types/zone-visit.type";
import { formatDateTime } from "@/utils/format";

type ZoneVisitColumnActions = {
  canWrite: boolean;
  onExit: (visit: TYPE_ZONE_VISIT) => void;
};

export const getZoneVisitColumns = ({
  canWrite,
  onExit,
}: ZoneVisitColumnActions): ColumnDef<TYPE_ZONE_VISIT>[] => [
  {
    id: "animal",
    header: "Satwa",
    accessorFn: (visit) => visit.animal?.name_animal ?? "",
    cell: ({ row }) => (
      <Link href={`/animals/${row.original.animal_id}/detail`} className="group inline-flex flex-col">
        <span className="font-medium text-forest-primary underline-offset-2 group-hover:underline">
          {row.original.animal?.name_animal ?? `Satwa #${row.original.animal_id}`}
        </span>
        <span className="text-xs text-sage">{row.original.animal?.species?.common_name}</span>
      </Link>
    ),
  },
  {
    id: "zone",
    header: "Zona",
    accessorFn: (visit) => visit.zone?.zone_name ?? "",
    cell: ({ row }) => (
      <span className="text-sm text-olive-dark">{row.original.zone?.zone_name ?? "-"}</span>
    ),
  },
  {
    accessorKey: "entered_at",
    header: "Masuk",
    cell: ({ row }) => (
      <span className="text-sm text-olive-dark">{formatDateTime(row.original.entered_at)}</span>
    ),
  },
  {
    id: "exited_at",
    header: "Keluar",
    cell: ({ row }) =>
      row.original.is_inside ? (
        <StatusBadge label="Masih di dalam" variant="warning" />
      ) : (
        <span className="text-sm text-olive-dark">{formatDateTime(row.original.exited_at)}</span>
      ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) =>
      canWrite && row.original.is_inside ? (
        <button
          type="button"
          onClick={() => onExit(row.original)}
          className="inline-flex items-center gap-2 rounded-lg border border-natural-muted px-3 py-2 text-sm font-medium text-forest-deep transition hover:bg-natural-muted/30"
        >
          <LogOut size={15} />
          Tandai Keluar
        </button>
      ) : (
        <span className="text-sage">-</span>
      ),
  },
];
