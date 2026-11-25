"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export type PrintFrameHandle = { print: () => void };

/**
 * Pratinjau dokumen cetak (struk/laporan) dalam iframe tanpa skrip.
 * `allow-same-origin` diperlukan agar tombol Cetak bisa memanggil print() pada iframe; `allow-modals` untuk dialog cetak.
 */
export const PrintFrame = forwardRef<PrintFrameHandle, { html: string; title: string; height?: number }>(
  function PrintFrame({ html, title, height = 520 }, ref) {
    const frameRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => ({
      print: () => {
        const win = frameRef.current?.contentWindow;
        if (!win) return;
        win.focus();
        win.print();
      },
    }));

    return (
      <iframe
        ref={frameRef}
        title={title}
        srcDoc={html}
        sandbox="allow-same-origin allow-modals"
        style={{ height }}
        className="w-full rounded-xl border border-line bg-white"
      />
    );
  },
);
