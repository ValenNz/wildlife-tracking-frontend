import type { ColumnDef } from "@tanstack/react-table";

import type { TYPE_WEATHER } from "@/types/weather.type";
import { formatDateTime } from "@/utils/format";

const withUnit = (value: number | string | null, unit: string) =>
  value === null || value === "" ? "-" : `${Number(value).toLocaleString("id-ID")} ${unit}`;

export const getWeatherColumns = (): ColumnDef<TYPE_WEATHER>[] => [
  {
    accessorKey: "observed_at",
    header: "Waktu",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-olive-dark">
        {formatDateTime(row.original.observed_at)}
      </span>
    ),
  },
  {
    id: "location",
    header: "Lokasi",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-olive-dark">
        {Number(row.original.latitude).toFixed(4)}, {Number(row.original.longitude).toFixed(4)}
      </span>
    ),
  },
  {
    accessorKey: "temperature_c",
    header: "Suhu",
    cell: ({ row }) => <span className="text-sm text-olive-dark">{withUnit(row.original.temperature_c, "°C")}</span>,
  },
  {
    accessorKey: "rainfall_mm",
    header: "Hujan",
    cell: ({ row }) => <span className="text-sm text-olive-dark">{withUnit(row.original.rainfall_mm, "mm")}</span>,
  },
  {
    accessorKey: "humidity_percent",
    header: "Kelembapan",
    cell: ({ row }) => <span className="text-sm text-olive-dark">{withUnit(row.original.humidity_percent, "%")}</span>,
  },
  {
    accessorKey: "pressure_hpa",
    header: "Tekanan",
    cell: ({ row }) => <span className="text-sm text-olive-dark">{withUnit(row.original.pressure_hpa, "hPa")}</span>,
  },
  {
    accessorKey: "source",
    header: "Sumber",
    cell: ({ row }) => <span className="text-xs text-sage">{row.original.source}</span>,
  },
];
