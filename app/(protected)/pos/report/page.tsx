"use client";

import Link from "next/link";
import { useState } from "react";
import { Banknote, Landmark, Printer, Users, Wallet } from "lucide-react";

import { Button } from "@/components/button";
import { FormField, TextInput } from "@/components/form";
import { ErrorState, Loading, PageHeader, StatCard } from "@/components/ui";
import { usePosDailyReport } from "@/hooks/use-pos";
import { toApiErrorState } from "@/services/api";
import { PAYMENT_METHOD_LABELS, type TYPE_PAYMENT_METHOD } from "@/types/tourism.type";
import { formatDateTime, formatLongDate, formatRupiah } from "@/utils/format";

import { wibDate } from "../utils";

export default function PosDailyReportPage() {
  const [date, setDate] = useState(wibDate());
  const reportQuery = usePosDailyReport(date);
  const report = reportQuery.data;

  if (reportQuery.error) {
    const error = toApiErrorState(reportQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void reportQuery.refetch()} />;
  }

  const summary = report?.summary;

  return (
    <div className="flex flex-col gap-6 recap">
      <PageHeader
        eyebrow="Laporan Harian Wisata"
        title={formatLongDate(date)}
        description="Gabungan pemesanan online dan penjualan loket, dihitung menurut waktu pembayaran (WIB). PNBP dipisah dari jasa pemandu untuk keperluan setoran kas negara."
        actions={<Button className="print:hidden" variant="outline" icon={<Printer className="size-4" />} onClick={() => window.print()}>Cetak A4</Button>}
      />
      <section className="ui-panel p-4 print:hidden">
        <FormField label="Tanggal" htmlFor="report-date" className="max-w-xs">
          <TextInput id="report-date" type="date" value={date} max={wibDate()} onChange={(event) => setDate(event.target.value)} />
        </FormField>
      </section>

      {reportQuery.isLoading || !summary ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total penerimaan" value={formatRupiah(summary.gross)} hint={`${summary.transactions} transaksi · ${summary.voided} batal/void`} icon={<Wallet className="size-5" />} />
            <StatCard label="PNBP (setor kas negara)" value={formatRupiah(summary.pnbp)} tone="positive" icon={<Landmark className="size-5" />} />
            <StatCard label="Jasa pemandu" value={formatRupiah(summary.guide_fee)} tone="info" icon={<Banknote className="size-5" />} />
            <StatCard
              label="Pengunjung"
              value={String(summary.visitors.total)}
              hint={`WNI ${summary.visitors.wni} · Pelajar ${summary.visitors.pelajar} · WNA ${summary.visitors.wna} · Drone ${summary.visitors.drone}`}
              icon={<Users className="size-5" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="ui-panel p-5">
              <h2 className="mb-3 text-base font-bold text-ink">Per metode pembayaran</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-line">
                  {Object.entries(summary.by_method).map(([method, amount]) => (
                    <tr key={method}><td className="py-2">{PAYMENT_METHOD_LABELS[method as TYPE_PAYMENT_METHOD] ?? method}</td><td className="py-2 text-right font-semibold">{formatRupiah(amount)}</td></tr>
                  ))}
                  {Object.keys(summary.by_method).length === 0 ? <tr><td className="py-2 text-muted">Belum ada pembayaran.</td></tr> : null}
                </tbody>
              </table>
            </section>
            <section className="ui-panel p-5">
              <h2 className="mb-3 text-base font-bold text-ink">Per kanal</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-line">
                  {(["online", "pos"] as const).map((channel) => (
                    <tr key={channel}>
                      <td className="py-2">{channel === "online" ? "Pemesanan online" : "Loket (POS)"}</td>
                      <td className="py-2 text-right text-muted">{summary.by_channel[channel]?.transactions ?? 0} trx</td>
                      <td className="py-2 text-right font-semibold">{formatRupiah(summary.by_channel[channel]?.amount ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          <section className="ui-panel overflow-x-auto p-5">
            <h2 className="mb-3 text-base font-bold text-ink">Sesi kas loket</h2>
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted">
                <tr><th className="pb-2">Sesi</th><th className="pb-2">Kasir</th><th className="pb-2">Buka – Tutup</th><th className="pb-2 text-right">Penjualan</th><th className="pb-2 text-right">Kas seharusnya</th><th className="pb-2 text-right">Selisih</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(report?.sessions ?? []).map((session) => (
                  <tr key={session.session_id}>
                    <td className="py-2"><Link href={`/pos/sessions/${session.session_id}/detail`} className="font-semibold text-primary hover:underline">#{session.session_id} {session.counter_name}</Link></td>
                    <td className="py-2">{session.cashier?.full_name}</td>
                    <td className="py-2 text-xs">{formatDateTime(session.opened_at)} – {session.closed_at ? formatDateTime(session.closed_at) : "masih buka"}</td>
                    <td className="py-2 text-right">{formatRupiah(session.summary.gross)}</td>
                    <td className="py-2 text-right">{formatRupiah(session.is_open ? session.expected_cash_now : session.expected_cash)}</td>
                    <td className={`py-2 text-right font-semibold ${session.cash_difference ? "text-danger" : ""}`}>{session.is_open ? "-" : formatRupiah(session.cash_difference)}</td>
                  </tr>
                ))}
                {(report?.sessions ?? []).length === 0 ? <tr><td className="py-2 text-muted" colSpan={6}>Tidak ada sesi loket pada tanggal ini.</td></tr> : null}
              </tbody>
            </table>
          </section>
          <p className="text-xs text-muted">Tanda tangan petugas: ______________________ &nbsp;&nbsp; Bendahara penerimaan: ______________________</p>
        </>
      )}
    </div>
  );
}
