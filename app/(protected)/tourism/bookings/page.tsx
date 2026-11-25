"use client";

import { useMemo, useState } from "react";
import { Banknote, Clock, Ticket } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { DataFilters } from "@/components/filter";
import { ErrorState, PageHeader, StatCard } from "@/components/ui";
import { useDebounce } from "@/hooks/use-debounce";
import { useAdminBookings } from "@/hooks/use-tourism";
import { toApiErrorState } from "@/services/api";
import { formatRupiah } from "@/utils/format";

import { getAdminBookingColumns } from "./column";
import { ADMIN_BOOKING_FILTER_FIELDS, ADMIN_BOOKING_INITIAL_FILTERS, type AdminBookingFilterValues } from "./filter";

export default function AdminBookingsPage() {
  const [filters, setFilters] = useState<AdminBookingFilterValues>(ADMIN_BOOKING_INITIAL_FILTERS);
  const search = useDebounce(filters.search, 400);
  const params = useMemo(
    () => ({
      status: filters.status === "all" ? undefined : filters.status,
      visit_date: filters.visit_date || undefined,
      search: search.trim() || undefined,
    }),
    [filters.status, filters.visit_date, search],
  );
  const bookingsQuery = useAdminBookings(params);
  const bookings = useMemo(() => bookingsQuery.data ?? [], [bookingsQuery.data]);
  const columns = useMemo(() => getAdminBookingColumns(), []);
  const revenue = bookings
    .filter((booking) => ["paid", "checked_in", "completed"].includes(booking.status))
    .reduce((sum, booking) => sum + Number(booking.total_amount), 0);

  if (bookingsQuery.error) {
    const error = toApiErrorState(bookingsQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void bookingsQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Kelola Wisata" title="Pemesanan Tiket" description="Semua pemesanan pengunjung. Klik kode untuk melihat peserta, pembayaran, dan membatalkan/refund." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pemesanan (filter)" value={bookingsQuery.isLoading ? "..." : String(bookings.length)} icon={<Ticket className="size-5" />} />
        <StatCard label="Menunggu verifikasi" value={String(bookings.filter((booking) => booking.status === "awaiting_verification").length)} tone="warning" icon={<Clock className="size-5" />} />
        <StatCard label="Pendapatan lunas" value={formatRupiah(revenue)} tone="positive" icon={<Banknote className="size-5" />} />
      </div>

      <section className="ui-panel p-4 sm:p-5">
        <DataFilters
          fields={ADMIN_BOOKING_FILTER_FIELDS}
          values={filters}
          onFilterChange={(values) => setFilters((previous) => ({ ...previous, ...values }))}
          onReset={() => setFilters({ ...ADMIN_BOOKING_INITIAL_FILTERS })}
        />
      </section>

      <section className="ui-panel overflow-hidden p-4 sm:p-5">
        <DataTable data={bookings} columns={columns} loading={bookingsQuery.isLoading} getRowId={(row) => String(row.booking_id)} label="pemesanan" emptyTitle="Belum ada pemesanan" />
      </section>
    </div>
  );
}
