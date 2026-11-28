"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  Column,
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { cn } from "@/lib/utils";


function columnLabel<TData>(column: Column<TData, unknown>): string {
  const header = column.columnDef.header;
  if (typeof header === "string") return header;
  const meta = column.columnDef.meta as { label?: string } | undefined;
  return meta?.label ?? "";
}

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  loading: boolean;
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;
  selectable?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  label?: string;
};

export function DataTable<TData>({
  data,
  columns,
  loading,
  onRowClick,
  getRowId,
  selectable = false,
  emptyTitle = "Belum ada data",
  emptyDescription,
  pageSize = 10,
  label = "tabel data",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getRowId,
    enableRowSelection: selectable,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const currentPageSize = table.getState().pagination.pageSize;

  const summary = useMemo(() => {
    const first = totalRows === 0 ? 0 : pageIndex * currentPageSize + 1;
    const last = Math.min((pageIndex + 1) * currentPageSize, totalRows);

    return `${first}-${last} dari ${totalRows} baris`;
  }, [pageIndex, currentPageSize, totalRows]);

  if (loading) {
    return <Loading label={`Memuat ${label}...`} />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        tabIndex={0}
        role="region"
        aria-label={label}
        className="responsive-table max-w-full overflow-x-auto overscroll-x-contain rounded-[14px] border border-border/80 bg-surface shadow-card"
      >
        <table className="w-full min-w-[40rem] border-collapse text-left text-[13.5px]">
          <caption className="sr-only">{label}</caption>
          <thead className="border-b border-border/80 bg-surface">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const direction = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={
                        canSort
                          ? direction === "asc"
                            ? "ascending"
                            : direction === "desc"
                              ? "descending"
                              : "none"
                          : undefined
                      }
                      className="whitespace-nowrap px-4 py-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink-soft"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1.5 rounded transition hover:text-primary"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {direction === "asc" ? (
                            <ArrowUp aria-hidden="true" className="size-3.5" />
                          ) : direction === "desc" ? (
                            <ArrowDown aria-hidden="true" className="size-3.5" />
                          ) : (
                            <ArrowUpDown aria-hidden="true" className="size-3.5 opacity-50" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-line/70">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row.original);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
                aria-label={onRowClick ? `Buka baris ${index + 1}` : undefined}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-primary-soft/50 focus-visible:bg-primary-soft/50",
                  !onRowClick && index % 2 === 1 && "bg-surface-muted/40",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    data-label={columnLabel(cell.column)}
                    className="px-4 py-3 align-middle text-ink-soft"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-muted">
        <span>{summary}</span>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2">
            <span>Baris</span>
            <select
              aria-label="Jumlah baris per halaman"
              value={currentPageSize}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
              className="ui-input h-8 w-auto py-0 text-xs"
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronLeft className="size-4" />}
            aria-label="Halaman sebelumnya"
          >
            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>
          <span
            aria-current="page"
            className="inline-flex min-w-8 items-center justify-center rounded-md bg-primary px-2 py-1 text-xs font-bold tabular-nums text-white"
          >
            {pageCount === 0 ? 0 : pageIndex + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            icon={<ChevronRight className="size-4" />}
            iconPosition="right"
            aria-label="Halaman berikutnya"
          >
            <span className="hidden sm:inline">Berikutnya</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
