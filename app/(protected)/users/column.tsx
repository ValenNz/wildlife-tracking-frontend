import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Pencil, Power, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/status";
import { TYPE_USER_STATUS_LABELS, type TYPE_USER_ACCOUNT } from "@/types/user.type";

type UserColumnActions = {
  onEdit: (user: TYPE_USER_ACCOUNT) => void;
  onToggleStatus: (user: TYPE_USER_ACCOUNT) => void;
  onDelete: (user: TYPE_USER_ACCOUNT) => void;
};

export const getUserColumns = ({
  onEdit,
  onToggleStatus,
  onDelete,
}: UserColumnActions): ColumnDef<TYPE_USER_ACCOUNT>[] => [
  {
    accessorKey: "full_name",
    header: "Nama",
    cell: ({ row }) => (
      <Link href={`/users/${row.original.user_id}/detail`} className="group inline-flex flex-col">
        <span className="font-medium text-forest-primary underline-offset-2 group-hover:underline">
          {row.original.full_name}
        </span>
        <span className="text-xs text-sage">@{row.original.username}</span>
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-sm text-olive-dark">{row.original.email}</span>,
  },
  {
    id: "role",
    header: "Role",
    accessorFn: (user) => user.role?.name_role ?? "",
    cell: ({ row }) => (
      <span className="text-sm text-olive-dark">
        {row.original.role?.name_role.replaceAll("_", " ") ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        label={TYPE_USER_STATUS_LABELS[row.original.status] ?? row.original.status}
        variant={row.original.status === "aktif" ? "success" : "neutral"}
      />
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(row.original)}
          className="inline-flex items-center gap-2 rounded-lg border border-natural-muted px-3 py-2 text-sm font-medium text-forest-deep transition hover:bg-natural-muted/30"
        >
          <Pencil size={15} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onToggleStatus(row.original)}
          className="inline-flex items-center gap-2 rounded-lg border border-natural-muted px-3 py-2 text-sm font-medium text-forest-deep transition hover:bg-natural-muted/30"
        >
          <Power size={15} />
          {row.original.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
        </button>
        <button
          type="button"
          onClick={() => onDelete(row.original)}
          className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger-soft"
        >
          <Trash2 size={15} />
          Hapus
        </button>
      </div>
    ),
  },
];
