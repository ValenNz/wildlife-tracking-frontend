"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Ban, FileText, LockKeyhole, Printer } from "lucide-react";

import { Button } from "@/components/button";
import { FormAlert, FormField, TextArea, TextInput } from "@/components/form";
import { buildSessionReportHtml, PrintFrame, type PaperWidth, type PrintFrameHandle } from "@/components/pos";
import { useToast } from "@/components/toast";
import { BookingStatusBadge } from "@/components/tourism";
import { Modal } from "@/components/ui";
import { usePosCloseSession, usePosSales, usePosVoid } from "@/hooks/use-pos";
import { formatApiError } from "@/services/api";
import { POS_METHOD_LABELS, type TYPE_POS_METHOD, type TYPE_POS_SALE, type TYPE_POS_SESSION } from "@/types/pos.type";
import { formatDateTime, formatRupiah } from "@/utils/format";

function ReportModal({ session, paper, onClose }: { session: TYPE_POS_SESSION; paper: PaperWidth; onClose: () => void }) {
  const frameRef = useRef<PrintFrameHandle>(null);
  return (
    <Modal open onClose={onClose} title={session.is_open ? "Laporan sementara (X)" : "Laporan tutup kas (Z)"} size="md">
      <PrintFrame ref={frameRef} html={buildSessionReportHtml(session, paper)} title="Laporan sesi" height={480} />
      <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="outline" onClick={onClose}>Tutup</Button>
        <Button icon={<Printer className="size-4" />} onClick={() => frameRef.current?.print()}>Cetak</Button>
      </div>
    </Modal>
  );
}

function CloseSessionModal({ session, onClose, onClosed }: { session: TYPE_POS_SESSION; onClose: () => void; onClosed: (session: TYPE_POS_SESSION) => void }) {
  const { showToast } = useToast();
  const closeMutation = usePosCloseSession();
  const [counted, setCounted] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const expected = session.expected_cash_now ?? 0;
  const difference = counted === "" ? null : Number(counted) - expected;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (counted === "") return setError("Isi jumlah uang tunai di laci.");
    if (difference !== 0 && note.trim() === "") return setError("Ada selisih kas: tulis penjelasan singkat.");
    try {
      const response = await closeMutation.mutateAsync({ counted_cash: Number(counted), note: note.trim() || undefined });
      showToast(response.message ?? "Sesi ditutup.", difference === 0 ? "success" : "error");
      onClosed(response.data);
    } catch (submitError) {
      setError(formatApiError(submitError, "Gagal menutup sesi."));
    }
  };

  return (
    <Modal open onClose={onClose} title="Tutup sesi kas" description="Hitung uang tunai fisik di laci (termasuk modal awal). Setelah ditutup, transaksi tidak bisa di-void oleh kasir." size="sm">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex justify-between rounded-xl bg-surface-muted px-4 py-3 text-sm">
          <span className="text-muted">Kas seharusnya</span>
          <span className="font-bold text-ink">{formatRupiah(expected)}</span>
        </div>
        <FormField label="Uang tunai dihitung (Rp)" htmlFor="counted" required>
          <TextInput id="counted" type="number" min={0} step={500} autoFocus value={counted} onChange={(event) => setCounted(event.target.value)} />
        </FormField>
        {difference !== null ? (
          <p className={`text-sm font-semibold ${difference === 0 ? "text-forest-primary" : "text-danger"}`}>
            {difference === 0 ? "Kas sesuai." : `Selisih ${difference > 0 ? "+" : "−"}${formatRupiah(Math.abs(difference))}`}
          </p>
        ) : null}
        <FormField label="Catatan" htmlFor="note">
          <TextArea id="note" rows={2} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
        </FormField>
        {error ? <FormAlert message={error} /> : null}
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" icon={<LockKeyhole className="size-4" />} loading={closeMutation.isPending}>Tutup Sesi</Button>
        </div>
      </form>
    </Modal>
  );
}

function VoidModal({ sale, onClose }: { sale: TYPE_POS_SALE; onClose: () => void }) {
  const { showToast } = useToast();
  const voidMutation = usePosVoid();
  const [reason, setReason] = useState("");

  const onConfirm = async () => {
    if (reason.trim().length < 5) return showToast("Alasan minimal 5 karakter.", "error");
    try {
      await voidMutation.mutateAsync({ code: sale.booking_code, reason: reason.trim() });
      showToast("Transaksi di-void. Kembalikan uang ke pembeli dan tarik struknya.", "success");
      onClose();
    } catch (error) {
      showToast(formatApiError(error, "Void gagal."), "error");
    }
  };

  return (
    <Modal open onClose={onClose} title={`Void ${sale.booking_code}?`} description={`Total ${formatRupiah(sale.total_amount)}. Tiket QR langsung tidak berlaku.`} size="sm" role="alertdialog">
      <FormField label="Alasan" htmlFor="void-reason" required>
        <TextInput id="void-reason" autoFocus maxLength={255} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="mis. salah jumlah peserta" />
      </FormField>
      <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button variant="danger" icon={<Ban className="size-4" />} loading={voidMutation.isPending} onClick={() => void onConfirm()}>Void</Button>
      </div>
    </Modal>
  );
}

export function SessionPanel({
  session,
  paper,
  onReprint,
  onClosed,
}: {
  session: TYPE_POS_SESSION;
  paper: PaperWidth;
  onReprint: (sale: TYPE_POS_SALE) => void;
  /** Setelah tutup kas panel ini hilang (tidak ada sesi), jadi laporan Z ditampilkan oleh halaman induk. */
  onClosed: (session: TYPE_POS_SESSION) => void;
}) {
  const salesQuery = usePosSales(true);
  const [report, setReport] = useState<TYPE_POS_SESSION | null>(null);
  const [closing, setClosing] = useState(false);
  const [voiding, setVoiding] = useState<TYPE_POS_SALE | null>(null);
  const summary = session.summary;

  return (
    <aside className="flex flex-col gap-4">
      <section className="ui-panel p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">{session.counter_name}</p>
            <p className="text-xs text-muted">Sesi #{session.session_id} · buka {formatDateTime(session.opened_at)}</p>
          </div>
          <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-forest-primary">BUKA</span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-surface-muted p-3"><dt className="text-xs text-muted">Transaksi</dt><dd className="text-lg font-bold">{summary.transactions}</dd></div>
          <div className="rounded-xl bg-surface-muted p-3"><dt className="text-xs text-muted">Pengunjung</dt><dd className="text-lg font-bold">{summary.visitors.total}</dd></div>
          <div className="rounded-xl bg-surface-muted p-3"><dt className="text-xs text-muted">Penjualan</dt><dd className="font-bold">{formatRupiah(summary.gross)}</dd></div>
          <div className="rounded-xl bg-surface-muted p-3"><dt className="text-xs text-muted">Kas di laci</dt><dd className="font-bold">{formatRupiah(session.expected_cash_now)}</dd></div>
        </dl>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" icon={<FileText className="size-3.5" />} onClick={() => setReport(session)}>Laporan X</Button>
          <Button size="sm" variant="secondary" icon={<LockKeyhole className="size-3.5" />} onClick={() => setClosing(true)}>Tutup kas</Button>
        </div>
      </section>

      <section className="ui-panel p-4">
        <h3 className="mb-2 text-sm font-bold text-ink">Transaksi sesi ini</h3>
        {(salesQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-muted">Belum ada transaksi.</p>
        ) : (
          <ul className="flex max-h-[420px] flex-col divide-y divide-line overflow-y-auto">
            {(salesQuery.data ?? []).map((sale) => {
              const method = sale.payments?.[0]?.method as TYPE_POS_METHOD | undefined;
              return (
                <li key={sale.booking_id} className="flex flex-col gap-1 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{sale.booking_code}</span>
                    <BookingStatusBadge status={sale.status} />
                  </div>
                  <div className="flex justify-between gap-2 text-xs text-ink-soft">
                    <span>{sale.contact_name} · {sale.participant_count} org · {method ? POS_METHOD_LABELS[method] : "-"}</span>
                    <span className="font-semibold text-ink">{formatRupiah(sale.total_amount)}</span>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <button type="button" className="font-semibold text-primary hover:underline" onClick={() => onReprint(sale)}>Cetak ulang</button>
                    {sale.status !== "cancelled" ? (
                      <button type="button" className="font-semibold text-danger hover:underline" onClick={() => setVoiding(sale)}>Void</button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {report ? <ReportModal session={report} paper={paper} onClose={() => setReport(null)} /> : null}
      {closing ? (
        <CloseSessionModal
          session={session}
          onClose={() => setClosing(false)}
          onClosed={(closed) => {
            setClosing(false);
            onClosed(closed);
          }}
        />
      ) : null}
      {voiding ? <VoidModal sale={voiding} onClose={() => setVoiding(null)} /> : null}
    </aside>
  );
}

export { ReportModal };
