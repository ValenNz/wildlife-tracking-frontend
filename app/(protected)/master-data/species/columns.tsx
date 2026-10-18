import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import type { BadgeVariant } from "@/components/ui/status-badge";
import type { TYPE_CONSERVATION_STATUS, TYPE_SPECIES } from "@/types/species.type";

const CONSERVATION_VARIANT: Record<TYPE_CONSERVATION_STATUS, BadgeVariant> = {
  "Critically Endangered": "danger",
  Endangered: "warning",
  Vulnerable: "info",
};

export const getSpeciesColumns = (): ColumnDef<TYPE_SPECIES, unknown>[] => [
  {
    accessorKey: "common_name",
    header: "Nama Umum",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-zinc-900">{row.original.common_name}</p>
        <p className="text-xs text-zinc-500">#{row.original.species_id}</p>
      </div>
    ),
  },
  {
    accessorKey: "scientific_name",
    header: "Nama Ilmiah",
    cell: ({ row }) => (
      <span className="italic text-zinc-700">{row.original.scientific_name}</span>
    ),
  },
  {
    accessorKey: "conservation_status",
    header: "Status Konservasi",
    cell: ({ row }) => (
      <StatusBadge
        label={row.original.conservation_status}
        variant={CONSERVATION_VARIANT[row.original.conservation_status]}
      />
    ),
  },
  {
    accessorKey: "animal_count",
    header: "Jumlah Satwa",
    cell: ({ row }) => (
      <span className="tabular-nums text-zinc-700">{row.original.animal_count ?? 0}</span>
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-zinc-600">
        Lihat {row.original.species_id}
      </span>
    ),
  },
];