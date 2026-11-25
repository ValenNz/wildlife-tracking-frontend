"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";

import { Button } from "@/components/button";
import { buildSessionReportHtml, PrintFrame, type PrintFrameHandle } from "@/components/pos";
import { BookingStatusBadge } from "@/components/tourism";
import { ErrorState, Loading, PageHeader } from "@/components/ui";
import { usePosSessionReport } from "@/hooks/use-pos";
import { toApiErrorState } from "@/services/api";
import { POS_SERVICE } from "@/services/pos.service";
import type { TYPE_POS_SALE } from "@/types/pos.type";
import { PAYMENT_METHOD_LABELS } from "@/types/tourism.type";
import { formatDateTime, formatRupiah } from "@/utils/format";

import { ReceiptModal } from "../../../receipt-modal";

export default function PosSessionDetailPage() {
  const params = useParams<{ id: string }>();
  const reportQuery = usePosSessionReport(Number(params.id ?? 0));
  const frameRef = useRef<PrintFrameHandle>(null);
  const [receipt, setReceipt] = useState<TYPE_POS_SALE | null>(null);
  const session = reportQuery.data;

  if (reportQuery.isLoading) return <Loading />;
  if (reportQuery.error || !session) {
    const error = toApiErrorState(reportQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void reportQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/pos/sessions" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="size-4" />Riwayat sesi</Link>
      <PageHeader
        eyebrow={session.is_open ? "Sesi masih buka" : "Sesi ditutup"}
        title={`Sesi #${session.session_id} · ${session.counter_name}`}
        description={`Kasir ${session.cashier?.full_name ?? "-"} · ${formatDateTime(session.opened_at)} – ${session.closed_at ? formatDateTime(session.closed_at) : "sekarang"}`}
        className="mb-0"
        actions={<Button icon={<Printer className="size-4" />} onClick={() => frameRef.current?.print()}>Cetak laporan {session.is_open ? "X" : "Z"}</Button>}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="ui-panel overflow-x-auto p-5">
          <h2 className="mb-3 text-base font-bold text-ink">Transaksi ({session.sales?.length ?? 0})</h2>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr><th className="pb-2">Kode</th><th className="pb-2">Pembeli</th><th className="pb-2">Rute</th><th className="pb-2">Metode</th><th className="pb-2 text-right">Total</th><th className="pb-2">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(session.sales ?? []).map((sale) => (
                <tr key={sale.booking_id}>
                  <td className="py-2"><button type="button" onClick={() => void POS_SERVICE.GET_SALE(sale.booking_code).then((response) => setReceipt(response.data))} className="font-mono text-xs font-bold text-primary hover:underline">{sale.booking_code}</button></td>
                  <td className="py-2">{sale.contact_name} <span className="text-xs text-muted">({sale.participant_count})</span></td>
                  <td className="py-2 text-xs">{sale.route?.name}</td>
                  <td className="py-2 text-xs">{sale.payments?.[0] ? PAYMENT_METHOD_LABELS[sale.payments[0].method] : "-"}</td>
                  <td className="py-2 text-right font-semibold">{formatRupiah(sale.total_amount)}</td>
                  <td className="py-2"><BookingStatusBadge status={sale.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <PrintFrame ref={frameRef} html={buildSessionReportHtml(session)} title="Laporan sesi" height={620} />
      </div>
      {receipt ? <ReceiptModal sale={receipt} paper="80mm" onClose={() => setReceipt(null)} /> : null}
    </div>
  );
}
