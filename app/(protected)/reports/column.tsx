import type { ColumnDef } from "@tanstack/react-table";
import { Download, Eye, Trash2 } from "lucide-react";

import { TYPE_REPORT_TYPE_LABELS, type TYPE_AGGREGATE_REPORT } from "@/types/report.type";
import { formatDate, formatDateTime } from "@/utils/format";

type ReportColumnActions = {
  canDelete: boolean;
  onView: (report: TYPE_AGGREGATE_REPORT) => void;
  onDownload: (report: TYPE_AGGREGATE_REPORT) => void;
  onDelete: (report: TYPE_AGGREGATE_REPORT) => void;
};

export const getReportColumns = ({
  canDelete,
  onView,
  onDownload,
  onDelete,
}: ReportColumnActions): ColumnDef<TYPE_AGGREGATE_REPORT>[] => [
  {
    id: "period",
    header: "Periode",
    accessorFn: (report) => report.period_start,
    cell: ({ row }) => (
      <span className="font-medium text-olive-dark">
        {formatDate(row.original.period_start)} sampai {formatDate(row.original.period_end)}
      </span>
    ),
  },
  {
    accessorKey: "report_type",
    header: "Jenis",
    cell: ({ row }) => (
      <span className="text-sm text-olive-dark">
        {TYPE_REPORT_TYPE_LABELS[row.original.report_type] ?? row.original.report_type}
      </span>
    ),
  },
  {
    accessorKey: "generated_at",
    header: "Dibuat",
    cell: ({ row }) => (
      <div className="text-sm text-olive-dark">
        <p>{formatDateTime(row.original.generated_at)}</p>
        <p className="text-xs text-sage">
          {row.original.generator?.full_name ?? row.original.generator?.username ?? "-"}
        </p>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onView(row.original)}
          className="inline-flex items-center gap-2 rounded-lg border border-natural-muted px-3 py-2 text-sm font-medium text-forest-deep transition hover:bg-natural-muted/30"
        >
          <Eye size={15} />
          Lihat
        </button>
        <button
          type="button"
          onClick={() => onDownload(row.original)}
          className="inline-flex items-center gap-2 rounded-lg border border-natural-muted px-3 py-2 text-sm font-medium text-forest-deep transition hover:bg-natural-muted/30"
        >
          <Download size={15} />
          CSV
        </button>
        {canDelete ? (
          <button
            type="button"
            onClick={() => onDelete(row.original)}
            className="inline-flex items-center gap-2 rounded-lg border border-danger/30 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger-soft"
          >
            <Trash2 size={15} />
            Hapus
          </button>
        ) : null}
      </div>
    ),
  },
];
