import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/utils/format";
import type { TYPE_ANIMAL, TYPE_ANIMAL_GENDER } from "@/types/wildlife/animal.type";

const GENDER_GLYPH: Record<TYPE_ANIMAL_GENDER, string> = {
  Jantan: "♂",
  Betina: "♀",
  "Tidak Diketahui": "?",
};

const GENDER_LABEL: Record<TYPE_ANIMAL_GENDER, string> = {
  Jantan: "Jantan",
  Betina: "Betina",
  "Tidak Diketahui": "Tidak Diketahui",
};

export const getAnimalColumns = (): ColumnDef<TYPE_ANIMAL, unknown>[] => [
  {
    accessorKey: "animal_code",
    header: "Kode Satwa",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-zinc-900">{row.original.animal_code}</p>
        <p className="text-xs text-zinc-500">#{row.original.animal_id}</p>
      </div>
    ),
  },
  {
    id: "species",
    accessorFn: (row) => row.species_name ?? "",
    header: "Spesies",
    cell: ({ row }) =>
      row.original.species_name ? (
        <div>
          <p className="text-zinc-800">{row.original.species_name}</p>
          <p className="text-xs italic text-zinc-500">
            {row.original.species_scientific_name}
          </p>
        </div>
      ) : (
        <span className="text-xs text-zinc-400">Spesies #{row.original.species_id}</span>
      ),
  },
  {
    accessorKey: "gender",
    header: "Jenis Kelamin",
    cell: ({ row }) => (
      <span
        title={GENDER_LABEL[row.original.gender]}
        aria-label={GENDER_LABEL[row.original.gender]}
        className="text-sm font-semibold text-zinc-700"
      >
        {GENDER_GLYPH[row.original.gender] ?? "?"}
      </span>
    ),
  },
  {
    accessorKey: "birth_date",
    header: "Tanggal Lahir",
    cell: ({ row }) =>
      row.original.birth_date ? (
        formatDate(row.original.birth_date)
      ) : (
        <span className="text-zinc-400">-</span>
      ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        label={row.original.is_active ? "Aktif" : "Tidak Aktif"}
        variant={row.original.is_active ? "success" : "danger"}
      />
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-zinc-600">
        Lihat {row.original.animal_id}
      </span>
    ),
  },
];