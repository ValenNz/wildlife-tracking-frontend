"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { ArrowLeft, Backpack, Building2, Clock, CreditCard, Printer, QrCode, ShieldCheck, Upload, XCircle } from "lucide-react";

import { Button } from "@/components/button";
import { FormAlert, TextArea } from "@/components/form";
import { useToast } from "@/components/toast";
import { ErrorState, Loading, Modal } from "@/components/ui";
import {
  BookingStatusBadge,
  Countdown,
  PaymentSimulatorModal,
  PaymentStatusBadge,
  RatingInput,
  TicketQr,
} from "@/components/tourism";
import {
  useBookingCancel,
  useBookingReview,
  useMyBooking,
  useMyTicket,
  usePaymentInfo,
  usePaymentProofUpload,
  usePayOnline,
  useSimulatePayment,
} from "@/hooks/use-tourism";
import { formatApiError, toApiErrorState } from "@/services/api";
import type { TYPE_SIMULATE_PAYMENT_CHANNEL } from "@/types/tourism.type";
import { PAYMENT_METHOD_LABELS, SHIFT_LABELS, VISITOR_TYPE_LABELS } from "@/types/tourism.type";
import { formatDateTime, formatLongDate, formatRupiah } from "@/utils/format";

const PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_PROOF_BYTES = 5 * 1024 * 1024;

export default function BookingDetailPage() {
  const { id: code = "" } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const bookingQuery = useMyBooking(code);
  const booking = bookingQuery.data;
  const ticketReady = booking ? ["paid", "checked_in", "completed"].includes(booking.status) : false;
  const ticketQuery = useMyTicket(code, ticketReady);
  const paymentInfo = usePaymentInfo();
  const uploadMutation = usePaymentProofUpload();
  const cancelMutation = useBookingCancel();
  const reviewMutation = useBookingReview();
  const payOnlineMutation = usePayOnline();
  const simulatePaymentMutation = useSimulatePayment();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [review, setReview] = useState({ route_rating: 0, guide_rating: 0, comment: "" });
  const refetchBooking = bookingQuery.refetch;
  const handleExpire = useCallback(() => void refetchBooking(), [refetchBooking]);

  if (bookingQuery.isLoading) return <Loading label="Memuat pemesanan..." />;
  if (bookingQuery.error || !booking) {
    const error = toApiErrorState(bookingQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void bookingQuery.refetch()} />;
  }

  const payment = [...(booking.payments ?? [])].sort((a, b) => b.payment_id - a.payment_id)[0];
  const canPay = booking.status === "pending_payment";
  const canCancel = ["pending_payment", "awaiting_verification"].includes(booking.status);
  const canReview = ["checked_in", "completed"].includes(booking.status) && !booking.review;
  const bank = paymentInfo.data?.bank_transfer;

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!PROOF_TYPES.includes(file.type)) return showToast("Format harus JPG, PNG, WEBP, atau PDF.", "error");
    if (file.size > MAX_PROOF_BYTES) return showToast("Ukuran maksimal 5 MB.", "error");
    try {
      await uploadMutation.mutateAsync({ code, file });
      showToast("Bukti pembayaran terkirim. Petugas akan memverifikasi.", "success");
    } catch (error) {
      showToast(formatApiError(error, "Gagal mengunggah bukti."), "error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Hanya halaman pembayaran resmi Midtrans yang boleh dibuka (cegah redirect ke situs lain).
  const onPayOnline = async () => {
    try {
      const response = await payOnlineMutation.mutateAsync(code);
      const url = new URL(response.data.redirect_url);
      if (url.protocol !== "https:" || !/(^|\.)midtrans\.com$/.test(url.hostname)) throw new Error("URL pembayaran tidak dikenali.");
      window.location.assign(url.toString());
    } catch (error) {
      showToast(formatApiError(error, "Gagal membuka pembayaran online."), "error");
    }
  };

  const onSimulatePayment = async (channel: TYPE_SIMULATE_PAYMENT_CHANNEL, outcome: "paid" | "failed") => {
    try {
      const response = await simulatePaymentMutation.mutateAsync({ code, payload: { channel, outcome } });
      if (response.data.simulation.outcome === "paid") {
        setSimulatorOpen(false);
        showToast("Pembayaran terverifikasi otomatis. E-tiket siap digunakan!", "success");
      } else {
        showToast("Simulasi pembayaran gagal. Anda dapat mencoba kanal lain.", "error");
      }
    } catch (error) {
      showToast(formatApiError(error, "Gagal memproses simulasi pembayaran."), "error");
    }
  };

  const onCancel = async () => {
    try {
      await cancelMutation.mutateAsync(code);
      showToast("Pemesanan dibatalkan.", "success");
      setConfirmCancel(false);
    } catch (error) {
      showToast(formatApiError(error, "Gagal membatalkan."), "error");
    }
  };

  const onReview = async () => {
    if (review.route_rating < 1) return showToast("Beri rating rute terlebih dahulu.", "error");
    try {
      await reviewMutation.mutateAsync({
        code,
        payload: {
          route_rating: review.route_rating,
          guide_rating: review.guide_rating || null,
          comment: review.comment.trim() || undefined,
        },
      });
      showToast("Terima kasih atas ulasannya!", "success");
    } catch (error) {
      showToast(formatApiError(error, "Gagal mengirim ulasan."), "error");
    }
  };

  return (
    <div className="flex flex-col gap-6 print:gap-3">
      <Link href="/bookings" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline print:hidden">
        <ArrowLeft className="size-4" /> Pesanan saya
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm font-bold tracking-wider text-primary">{booking.booking_code}</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{booking.route?.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {formatLongDate(booking.visit_date)} · {booking.shift ? `${SHIFT_LABELS[booking.shift.shift_type]} ${booking.shift.start_time?.slice(0, 5)}` : ""}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          {canPay ? (
            <section className="ui-panel overflow-hidden print:hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted px-5 py-4">
                <h2 className="text-base font-bold text-ink">Selesaikan pembayaran</h2>
                {booking.payment_window_seconds_left !== null && booking.payment_window_seconds_left !== undefined ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-warning-soft px-3 py-1 text-sm font-semibold text-warning">
                    <Clock className="size-4" /> Sisa waktu <Countdown key={booking.expires_at ?? ""} seconds={booking.payment_window_seconds_left} onExpire={handleExpire} />
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-4 p-5 text-sm">
                <p className="text-ink-soft">
                  Transfer tepat <b className="text-lg text-ink">{formatRupiah(booking.total_amount)}</b> dengan berita/keterangan{" "}
                  <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono font-bold">{payment?.reference ?? booking.booking_code}</code>.
                </p>
                {payment?.method === "bank_transfer" || !payment ? (
                  bank?.account_number ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-line p-4">
                      <Building2 className="size-5 text-primary" />
                      <div>
                        <p className="font-semibold text-ink">{bank.bank_name}</p>
                        <p className="font-mono text-base font-bold tracking-wider text-ink">{bank.account_number}</p>
                        <p className="text-xs text-muted">a.n. {bank.account_holder}</p>
                      </div>
                    </div>
                  ) : (
                    <FormAlert tone="info" message="Rekening tujuan belum diatur pengelola. Hubungi petugas loket sebelum membayar." />
                  )
                ) : (
                  <FormAlert
                    tone="info"
                    message={`Metode ${PAYMENT_METHOD_LABELS[payment.method]}${paymentInfo.data?.qris_merchant_name ? ` ke merchant ${paymentInfo.data.qris_merchant_name}` : ""}. Simpan bukti pembayaran lalu unggah di bawah.`}
                  />
                )}
                {payment?.status === "rejected" && payment.rejection_reason ? (
                  <FormAlert message={`Bukti sebelumnya ditolak: ${payment.rejection_reason}`} />
                ) : null}
                {paymentInfo.data?.simulator_enabled ? (
                  <div className="flex flex-col gap-2 rounded-2xl border border-primary/40 bg-primary-soft/50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-ink">Bayar Instan & Verifikasi Otomatis (QRIS, Virtual Account, E-Wallet)</p>
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">Gratis · Simulasi</span>
                    </div>
                    <p className="text-xs text-muted">
                      Pembayaran langsung terverifikasi oleh sistem tanpa antrean petugas, dan e-tiket QR langsung terbit.
                    </p>
                    <Button icon={<ShieldCheck className="size-4" />} onClick={() => setSimulatorOpen(true)}>
                      Bayar Sekarang
                    </Button>
                  </div>
                ) : null}
                {paymentInfo.data?.midtrans_enabled ? (
                  <div className="flex flex-col gap-2 rounded-2xl border border-primary/30 bg-primary-soft/40 p-4">
                    <p className="font-semibold text-ink">Bayar online (QRIS, virtual account, e-wallet, kartu)</p>
                    <p className="text-xs text-muted">Diproses Midtrans; tiket terbit otomatis setelah pembayaran berhasil, tanpa unggah bukti.</p>
                    <Button icon={<CreditCard className="size-4" />} loading={payOnlineMutation.isPending} onClick={() => void onPayOnline()}>
                      Bayar online sekarang
                    </Button>
                    <p className="text-center text-xs text-muted">atau bayar manual & unggah bukti di bawah</p>
                  </div>
                ) : null}
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" className="sr-only" id="proof" onChange={(event) => void onUpload(event.target.files?.[0])} />
                <Button icon={<Upload className="size-4" />} loading={uploadMutation.isPending} onClick={() => fileRef.current?.click()}>
                  {uploadMutation.isPending ? "Mengunggah..." : "Unggah bukti pembayaran"}
                </Button>
                <p className="text-xs text-muted">JPG/PNG/WEBP/PDF maks. 5 MB. Pemesanan otomatis kedaluwarsa jika melewati batas waktu.</p>
              </div>
            </section>
          ) : null}

          {booking.status === "awaiting_verification" ? (
            <FormAlert tone="info" message="Bukti pembayaran sudah diterima dan sedang diverifikasi petugas. Halaman ini diperbarui otomatis." />
          ) : null}

          {ticketReady ? (
            <section className="ui-panel overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line bg-primary-dark px-5 py-4 text-white">
                <h2 className="flex items-center gap-2 text-base font-bold"><QrCode className="size-5" />E-Tiket</h2>
                <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25 print:hidden">
                  <Printer className="size-4" /> Cetak
                </button>
              </div>
              {ticketQuery.isLoading ? (
                <Loading />
              ) : ticketQuery.data ? (
                <div className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-start">
                  <TicketQr payload={ticketQuery.data.qr_payload} />
                  <dl className="grid flex-1 gap-2 text-sm">
                    <div><dt className="text-xs text-muted">Titik kumpul</dt><dd className="font-semibold text-ink">{ticketQuery.data.meeting_point}</dd></div>
                    <div><dt className="text-xs text-muted">Jam kumpul</dt><dd className="font-semibold text-ink">{ticketQuery.data.start_time} WIB (datang 30 menit lebih awal)</dd></div>
                    <div><dt className="text-xs text-muted">Pemandu</dt><dd className="font-semibold text-ink">{ticketQuery.data.guide ?? "-"}</dd></div>
                    {ticketQuery.data.checked_in_at ? (
                      <div><dt className="text-xs text-muted">Check-in</dt><dd className="font-semibold text-forest-primary">{formatDateTime(ticketQuery.data.checked_in_at)}</dd></div>
                    ) : (
                      <p className="text-xs leading-5 text-muted">Tunjukkan QR ini di loket. QR hanya berlaku sekali pada tanggal kunjungan. Jangan bagikan ke orang lain.</p>
                    )}
                  </dl>
                </div>
              ) : (
                <p className="p-5 text-sm text-muted">Tiket belum dapat dimuat.</p>
              )}
            </section>
          ) : null}

          {canReview ? (
            <section className="ui-panel p-5 print:hidden">
              <h2 className="text-base font-bold text-ink">Bagaimana pengalaman Anda?</h2>
              <p className="mt-1 text-sm text-muted">Ulasan tampil publik dengan nama disingkat.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><p className="mb-1 text-sm font-semibold text-ink-soft">Rute</p><RatingInput label="Rating rute" value={review.route_rating} onChange={(value) => setReview({ ...review, route_rating: value })} /></div>
                <div><p className="mb-1 text-sm font-semibold text-ink-soft">Pemandu</p><RatingInput label="Rating pemandu" value={review.guide_rating} onChange={(value) => setReview({ ...review, guide_rating: value })} /></div>
              </div>
              <TextArea className="mt-4" rows={3} maxLength={1000} placeholder="Ceritakan pengalaman Anda (opsional)" value={review.comment} onChange={(event) => setReview({ ...review, comment: event.target.value })} />
              <Button className="mt-4" loading={reviewMutation.isPending} onClick={() => void onReview()}>Kirim ulasan</Button>
            </section>
          ) : booking.review ? (
            <FormAlert tone="success" message={`Ulasan Anda tercatat: rute ${booking.review.route_rating}/5${booking.review.guide_rating ? `, pemandu ${booking.review.guide_rating}/5` : ""}.`} />
          ) : null}

          <section className="ui-panel p-5">
            <h2 className="mb-3 text-base font-bold text-ink">Peserta</h2>
            <ul className="divide-y divide-line text-sm">
              {(booking.participants ?? []).map((participant, index) => (
                <li key={participant.participant_id ?? index} className="flex justify-between py-2">
                  <span className="text-ink">{participant.full_name}{participant.age ? <span className="text-muted"> · {participant.age} th</span> : null}</span>
                  <span className="text-xs font-semibold text-muted">{VISITOR_TYPE_LABELS[participant.visitor_type]}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-6 print:hidden">
          <section className="ui-panel p-5 text-sm">
            <h2 className="mb-3 text-base font-bold text-ink">Rincian biaya</h2>
            <ul className="flex flex-col gap-2">
              {booking.price_lines.map((line) => (
                <li key={line.code} className="flex justify-between gap-3">
                  <span className="text-ink-soft">{line.label}<span className="block text-xs text-muted">{line.quantity} × {formatRupiah(line.unit_price)}{line.days > 1 ? ` × ${line.days} hari` : ""}</span></span>
                  <span className="font-semibold text-ink">{formatRupiah(line.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-line pt-3 text-base font-bold"><span>Total</span><span className="text-primary">{formatRupiah(booking.total_amount)}</span></div>
          </section>

          <section className="ui-panel p-5 text-sm">
            <h2 className="mb-3 text-base font-bold text-ink">Riwayat pembayaran</h2>
            <ul className="flex flex-col gap-3">
              {(booking.payments ?? []).map((item) => (
                <li key={item.payment_id} className="flex flex-col gap-1 rounded-xl border border-line p-3">
                  <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs">{item.reference}</span><PaymentStatusBadge status={item.status} /></div>
                  <span className="text-xs text-muted">{PAYMENT_METHOD_LABELS[item.method]} · {formatRupiah(item.amount)}</span>
                  {item.status === "paid" && !item.verifier ? (
                    <span className="inline-flex w-fit items-center gap-1 text-[11px] font-semibold text-forest-primary">
                      <ShieldCheck className="size-3" /> Terverifikasi otomatis
                    </span>
                  ) : null}
                  {item.rejection_reason ? <span className="text-xs text-danger">Alasan: {item.rejection_reason}</span> : null}
                </li>
              ))}
            </ul>
          </section>

          {booking.route?.bring_list?.length ? (
            <section className="ui-panel p-5 text-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink"><Backpack className="size-4 text-primary" />Checklist bawaan</h2>
              <ul className="flex flex-col gap-1.5 text-ink-soft">
                {booking.route.bring_list.map((item) => (
                  <li key={item} className="flex items-start gap-2"><input type="checkbox" className="mt-1 accent-primary" aria-label={item} />{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {canCancel ? (
            <Button variant="danger" icon={<XCircle className="size-4" />} onClick={() => setConfirmCancel(true)}>Batalkan pemesanan</Button>
          ) : null}
          {booking.status === "paid" ? (
            <p className="text-xs leading-5 text-muted">Pemesanan yang sudah lunas hanya dapat dibatalkan/di-refund melalui petugas TNGL.</p>
          ) : null}
        </aside>
      </div>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Batalkan pemesanan?" size="sm" role="alertdialog">
        <p className="text-sm leading-6 text-ink-soft">Kuota shift akan dilepas untuk pengunjung lain. Tindakan ini tidak dapat dibatalkan.</p>
        <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="outline" onClick={() => setConfirmCancel(false)} disabled={cancelMutation.isPending}>Kembali</Button>
          <Button variant="danger" loading={cancelMutation.isPending} onClick={() => void onCancel()}>Ya, batalkan</Button>
        </div>
      </Modal>

      <PaymentSimulatorModal
        open={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        bookingCode={booking.booking_code}
        reference={payment?.reference ?? booking.booking_code}
        amount={booking.total_amount}
        merchantName={paymentInfo.data?.qris_merchant_name || "BBTNGL E-Ticketing"}
        pending={simulatePaymentMutation.isPending}
        onSimulate={onSimulatePayment}
      />
    </div>
  );
}
