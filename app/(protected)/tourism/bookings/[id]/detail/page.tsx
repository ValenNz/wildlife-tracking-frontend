"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, XCircle } from "lucide-react";

import { Button } from "@/components/button";
import { useToast } from "@/components/toast";
import { ErrorState, Loading, Modal } from "@/components/ui";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/tourism";
import { useAdminBooking, useAdminBookingCancel } from "@/hooks/use-tourism";
import { formatApiError, toApiErrorState } from "@/services/api";
import { PAYMENT_METHOD_LABELS, SHIFT_LABELS, VISITOR_TYPE_LABELS } from "@/types/tourism.type";
import { formatDateTime, formatLongDate, formatRupiah } from "@/utils/format";

export default function AdminBookingDetailPage() {
  const { id: code = "" } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const bookingQuery = useAdminBooking(code);
  const cancelMutation = useAdminBookingCancel();
  const [confirm, setConfirm] = useState(false);
  const booking = bookingQuery.data;

  if (bookingQuery.isLoading) return <Loading />;
  if (bookingQuery.error || !booking) {
    const error = toApiErrorState(bookingQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void bookingQuery.refetch()} />;
  }

  const cancellable = ["pending_payment", "awaiting_verification", "paid"].includes(booking.status);

  const onCancel = async () => {
    try {
      await cancelMutation.mutateAsync(code);
      showToast(booking.status === "paid" ? "Dibatalkan. Pembayaran ditandai refund; proses pengembalian dana manual." : "Pemesanan dibatalkan.", "success");
      setConfirm(false);
    } catch (error) {
      showToast(formatApiError(error, "Gagal membatalkan."), "error");
    }
  };

  const info: [string, string][] = [
    ["Rute", booking.route?.name ?? "-"],
    ["Kunjungan", `${formatLongDate(booking.visit_date)} · ${booking.day_type === "holiday" ? "tarif libur" : "tarif hari kerja"}`],
    ["Shift", booking.shift ? `${SHIFT_LABELS[booking.shift.shift_type]} ${booking.shift.start_time?.slice(0, 5)}–${booking.shift.end_time?.slice(0, 5)} · ${booking.shift.guide?.display_name ?? ""}` : "-"],
    ["Akun", `${booking.user?.full_name ?? "-"} (${booking.user?.email ?? "-"})`],
    ["Kontak", `${booking.contact_name} · ${booking.contact_phone}`],
    ["Kontak darurat", booking.emergency_contact],
    ["Catatan", booking.notes ?? "-"],
    ["Check-in", booking.checked_in_at ? formatDateTime(booking.checked_in_at) : "-"],
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link href="/tourism/bookings" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="size-4" />Semua pemesanan</Link>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-bold text-primary">{booking.booking_code}</p>
          <h1 className="text-2xl font-bold text-ink">{booking.contact_name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <BookingStatusBadge status={booking.status} />
          {cancellable ? <Button variant="danger" size="sm" icon={<XCircle className="size-4" />} onClick={() => setConfirm(true)}>Batalkan</Button> : null}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="ui-panel p-5">
          <dl className="grid gap-3 text-sm">
            {info.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[130px_1fr] gap-2"><dt className="text-muted">{label}</dt><dd className="text-ink">{value}</dd></div>
            ))}
          </dl>
        </section>
        <section className="ui-panel p-5 text-sm">
          <h2 className="mb-3 font-bold text-ink">Rincian biaya</h2>
          {booking.price_lines.map((line) => (
            <p key={line.code} className="flex justify-between py-1"><span className="text-ink-soft">{line.label} ({line.quantity}×{line.days > 1 ? `${line.days}h` : ""})</span><span>{formatRupiah(line.subtotal)}</span></p>
          ))}
          <p className="mt-2 flex justify-between border-t border-line pt-2 font-bold"><span>Total</span><span>{formatRupiah(booking.total_amount)}</span></p>
          <h2 className="mb-2 mt-5 font-bold text-ink">Pembayaran</h2>
          {(booking.payments ?? []).map((payment) => (
            <div key={payment.payment_id} className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3">
              <span className="font-mono text-xs">{payment.reference}</span>
              <span className="text-xs text-muted">{PAYMENT_METHOD_LABELS[payment.method]}{payment.verifier ? ` · diverifikasi ${payment.verifier.full_name}` : ""}</span>
              <PaymentStatusBadge status={payment.status} />
            </div>
          ))}
        </section>
      </div>

      <section className="ui-panel p-5">
        <h2 className="mb-3 font-bold text-ink">Peserta ({booking.participant_count})</h2>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {(booking.participants ?? []).map((participant, index) => (
            <li key={participant.participant_id ?? index} className="flex justify-between rounded-xl bg-surface-muted px-3 py-2">
              <span>{participant.full_name}{participant.age ? ` · ${participant.age} th` : ""}</span>
              <span className="text-xs text-muted">{VISITOR_TYPE_LABELS[participant.visitor_type]}</span>
            </li>
          ))}
        </ul>
      </section>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Batalkan pemesanan?" size="sm" role="alertdialog">
        <p className="text-sm leading-6 text-ink-soft">
          {booking.status === "paid"
            ? "Pemesanan ini sudah lunas. Pembayaran akan ditandai REFUNDED dan dana harus dikembalikan secara manual sesuai kebijakan."
            : "Kuota shift akan dilepas."}
        </p>
        <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="outline" onClick={() => setConfirm(false)}>Kembali</Button>
          <Button variant="danger" loading={cancelMutation.isPending} onClick={() => void onCancel()}>Ya, batalkan</Button>
        </div>
      </Modal>
    </div>
  );
}
