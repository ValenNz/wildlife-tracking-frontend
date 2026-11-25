"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Printer } from "lucide-react";

import { Button } from "@/components/button";
import { buildSaleReceiptHtml, PrintFrame, type PaperWidth, type PrintFrameHandle } from "@/components/pos";
import { Loading, Modal } from "@/components/ui";
import type { TYPE_POS_SALE } from "@/types/pos.type";
import { formatRupiah } from "@/utils/format";

export function ReceiptModal({
  sale,
  paper,
  onClose,
  autoPrint = false,
}: {
  sale: TYPE_POS_SALE;
  paper: PaperWidth;
  onClose: () => void;
  autoPrint?: boolean;
}) {
  const frameRef = useRef<PrintFrameHandle>(null);
  const [html, setHtml] = useState<string | null>(null);
  const change = sale.payments?.[0]?.change_amount ?? 0;

  useEffect(() => {
    let active = true;
    void buildSaleReceiptHtml(sale, paper).then((value) => active && setHtml(value));
    return () => {
      active = false;
    };
  }, [sale, paper]);

  return (
    <Modal open onClose={onClose} title={sale.status === "cancelled" ? `Struk VOID ${sale.booking_code}` : `Transaksi ${sale.booking_code}`} size="md">
      <div className="flex flex-col gap-4">
        {change > 0 && sale.status !== "cancelled" ? (
          <div className="rounded-2xl bg-primary-dark p-4 text-center text-white">
            <p className="text-xs uppercase tracking-wider text-white/70">Kembalian</p>
            <p className="text-3xl font-bold tabular-nums">{formatRupiah(change)}</p>
          </div>
        ) : null}
        {html ? (
          <PrintFrame
            ref={frameRef}
            html={html}
            title="Pratinjau struk"
            height={460}
          />
        ) : (
          <Loading label="Menyiapkan struk..." />
        )}
        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
          <Button variant="outline" icon={<Plus className="size-4" />} onClick={onClose}>Transaksi baru</Button>
          <Button icon={<Printer className="size-4" />} disabled={!html} onClick={() => frameRef.current?.print()} autoFocus={autoPrint}>
            Cetak struk
          </Button>
        </div>
      </div>
    </Modal>
  );
}
