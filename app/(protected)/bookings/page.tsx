"use client";

import Link from "next/link";
import { CalendarDays, Compass, Ticket, Users } from "lucide-react";

import { EmptyState, ErrorState, Loading, PageHeader } from "@/components/ui";
import { BookingStatusBadge } from "@/components/tourism";
import { useMyBookings } from "@/hooks/use-tourism";
import { toApiErrorState } from "@/services/api";
import { formatLongDate, formatRupiah } from "@/utils/format";

export default function MyBookingsPage() {
  const bookingsQuery = useMyBookings();
  const bookings = bookingsQuery.data ?? [];

  if (bookingsQuery.error) {
    const error = toApiErrorState(bookingsQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void bookingsQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Pesanan saya"
        title="Tiket & Pemesanan"
        description="Pantau status pembayaran, unduh tiket QR, dan tulis ulasan setelah kunjungan."
        actions={
          <Link href="/tours" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
            <Compass className="size-4" /> Pesan tur baru
          </Link>
        }
      />

      {bookingsQuery.isLoading ? (
        <Loading label="Memuat pesanan..." />
      ) : bookings.length === 0 ? (
        <EmptyState title="Belum ada pemesanan" description="Pilih rute dan jadwal pemandu untuk memulai petualangan di Leuser." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {bookings.map((booking) => (
            <li key={booking.booking_id}>
              <Link href={`/bookings/${booking.booking_code}/detail`} className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 transition hover:border-primary hover:shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-bold tracking-wider text-primary">{booking.booking_code}</p>
                    <p className="mt-1 font-bold text-ink">{booking.route?.name ?? "Rute"}</p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <dl className="grid grid-cols-2 gap-2 text-xs text-ink-soft">
                  <div className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-primary" />{formatLongDate(booking.visit_date)}</div>
                  <div className="flex items-center gap-1.5"><Users className="size-3.5 text-primary" />{booking.participant_count} peserta</div>
                  <div className="flex items-center gap-1.5"><Ticket className="size-3.5 text-primary" />{booking.shift?.guide?.display_name ?? "-"}</div>
                  <div className="font-bold text-ink">{formatRupiah(booking.total_amount)}</div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
