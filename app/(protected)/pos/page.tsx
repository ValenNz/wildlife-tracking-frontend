"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History } from "lucide-react";

import type { PaperWidth } from "@/components/pos";
import { useToast } from "@/components/toast";
import { ErrorState, Loading, PageHeader } from "@/components/ui";
import { usePosSession } from "@/hooks/use-pos";
import { formatApiError, toApiErrorState } from "@/services/api";
import { POS_SERVICE } from "@/services/pos.service";
import type { TYPE_POS_SALE, TYPE_POS_SESSION } from "@/types/pos.type";

import { OpenSessionCard } from "./open-session";
import { ReceiptModal } from "./receipt-modal";
import { SaleForm } from "./sale-form";
import { ReportModal, SessionPanel } from "./session-panel";
import { PAPER_KEY } from "./utils";

export default function PosPage() {
  const { showToast } = useToast();
  const sessionQuery = usePosSession();
  const [receipt, setReceipt] = useState<TYPE_POS_SALE | null>(null);
  const [closedReport, setClosedReport] = useState<TYPE_POS_SESSION | null>(null);
  const [paper, setPaper] = useState<PaperWidth>("80mm");

  // Lebar kertas printer adalah preferensi per komputer loket (boleh hilang, default 80 mm).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PAPER_KEY);
      if (saved === "58mm" || saved === "80mm") queueMicrotask(() => setPaper(saved));
    } catch {
      /* penyimpanan browser tidak tersedia */
    }
  }, []);

  const changePaper = (value: PaperWidth) => {
    setPaper(value);
    try {
      window.localStorage.setItem(PAPER_KEY, value);
    } catch {
      /* abaikan */
    }
  };

  const reprint = async (sale: TYPE_POS_SALE) => {
    try {
      setReceipt((await POS_SERVICE.GET_SALE(sale.booking_code)).data);
    } catch (error) {
      showToast(formatApiError(error, "Struk tidak dapat dimuat."), "error");
    }
  };

  if (sessionQuery.isLoading) return <Loading label="Memeriksa sesi kas..." />;
  if (sessionQuery.error) {
    const error = toApiErrorState(sessionQuery.error);
    return <ErrorState kind={error.kind} message={error.message} status={error.status} errors={error.errors} onRetry={() => void sessionQuery.refetch()} />;
  }

  const session = sessionQuery.data ?? null;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Loket"
        title="Kasir Tiket (POS)"
        description="Penjualan tiket walk-in. Harga dihitung server sesuai PP 36/2024; kuota dipakai bersama dengan pemesanan online."
        className="mb-0"
        actions={
          <>
            <label className="flex items-center gap-2 text-xs text-muted">
              Kertas
              <select aria-label="Lebar kertas struk" value={paper} onChange={(event) => changePaper(event.target.value as PaperWidth)} className="h-9 rounded-lg border border-line-strong bg-surface px-2 text-sm text-ink">
                <option value="80mm">80 mm</option>
                <option value="58mm">58 mm</option>
              </select>
            </label>
            <Link href="/pos/sessions" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink-soft hover:border-primary hover:text-primary">
              <History className="size-4" /> Riwayat sesi
            </Link>
          </>
        }
      />

      {session ? (
        <div className="grid gap-4 2xl:grid-cols-[1fr_340px]">
          <SaleForm onSold={setReceipt} />
          <SessionPanel session={session} paper={paper} onReprint={(sale) => void reprint(sale)} onClosed={setClosedReport} />
        </div>
      ) : (
        <OpenSessionCard />
      )}

      {receipt ? <ReceiptModal sale={receipt} paper={paper} onClose={() => setReceipt(null)} /> : null}
      {closedReport ? <ReportModal session={closedReport} paper={paper} onClose={() => setClosedReport(null)} /> : null}
    </div>
  );
}
