import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import type { BadgeVariant } from "@/components/ui/status-badge";
import { formatDate } from "@/utils/format";
import type { DeviceCondition, TrackingDevice } from "@/types/tracking-device.type";

const CONDITION_LABEL: Record<DeviceCondition, string> = {
  normal: "Normal",
  damaged: "Rusak",
  lost: "Hilang",
};

const CONDITION_VARIANT: Record<DeviceCondition, BadgeVariant> = {
  normal: "success",
  damaged: "warning",
  lost: "danger",
};

const batteryVariant = (level: number | null): BadgeVariant => {
  if (level === null) return "neutral";
  if (level < 20) return "danger";
  if (level < 50) return "warning";

  return "success";
};

export const getDeviceColumns = (): ColumnDef<TrackingDevice, unknown>[] => [
  {
    accessorKey: "device_id",
    header: "ID Perangkat",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-zinc-900">
        #{row.original.device_id}
      </span>
    ),
  },
  {
    id: "animal",
    accessorFn: (row) => row.animal?.animal_code ?? "",
    header: "Satwa",
    cell: ({ row }) =>
      row.original.animal ? (
        <span className="text-zinc-800">{row.original.animal.animal_code}</span>
      ) : (
        <span className="text-xs text-zinc-400">Belum dipasangkan</span>
      ),
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => <span className="text-zinc-800">{row.original.model}</span>,
  },
  {
    accessorKey: "installation_date",
    header: "Tanggal Pasang",
    cell: ({ row }) =>
      row.original.installation_date ? (
        formatDate(row.original.installation_date)
      ) : (
        <span className="text-zinc-400">-</span>
      ),
  },
  {
    accessorKey: "battery_level",
    header: "Baterai",
    cell: ({ row }) => {
      const level = row.original.battery_level;

      return (
        <StatusBadge
          label={level === null ? "Tidak Diketahui" : `${level}%`}
          variant={batteryVariant(level)}
        />
      );
    },
  },
  {
    accessorKey: "device_condition",
    header: "Kondisi",
    cell: ({ row }) => (
      <StatusBadge
        label={CONDITION_LABEL[row.original.device_condition]}
        variant={CONDITION_VARIANT[row.original.device_condition]}
      />
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-zinc-600">
        Lihat {row.original.device_id}
      </span>
    ),
  },
];