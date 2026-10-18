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
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

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

  const summary = useMemo(() => {
    const first = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
    const last = Math.min((pageIndex + 1) * pageSize, totalRows);

    return `${first}-${last} dari ${totalRows} baris`;
  }, [pageIndex, pageSize, totalRows]);

  if (loading) {
    return <Loading label={`Memuat ${label}...`} />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{label}</caption>
          <thead className="border-b border-zinc-200 bg-zinc-50">
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
                        direction === "asc"
                          ? "ascending"
                          : direction === "desc"
                            ? "descending"
                            : "none"
                      }
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 transition hover:text-zinc-900"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <span aria-hidden="true" className="text-[0.6rem]">
                            {direction === "asc"
                              ? "▲"
                              : direction === "desc"
                                ? "▼"
                                : "↕"}
                          </span>
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
          <tbody className="divide-y divide-zinc-100">
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
                role={onRowClick ? "button" : undefined}
                aria-label={onRowClick ? `Buka baris ${index + 1}` : undefined}
                className={
                  onRowClick
                    ? "cursor-pointer transition hover:bg-zinc-50"
                    : index % 2 === 1
                      ? "bg-zinc-50/40"
                      : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle text-zinc-800">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
        <span>{summary}</span>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1">
            <span>Baris</span>
            <select
              aria-label="Jumlah baris per halaman"
              value={table.getState().pagination.pageSize}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1"
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 transition hover:bg-zinc-50 disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="tabular-nums">
            {pageCount === 0 ? 0 : pageIndex + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 transition hover:bg-zinc-50 disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}