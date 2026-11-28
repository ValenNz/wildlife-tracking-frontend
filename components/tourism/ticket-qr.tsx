"use client";

/* eslint-disable @next/next/no-img-element -- QR dibuat sebagai data URL di browser */
import QRCode from "qrcode";
import { useEffect, useState } from "react";


export function TicketQr({ payload, size = 220 }: { payload: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(payload, { width: size, margin: 1, errorCorrectionLevel: "M" })
      .then((url) => active && setSrc(url))
      .catch(() => active && setSrc(null));
    return () => {
      active = false;
    };
  }, [payload, size]);

  return src ? (
    <img src={src} alt="QR tiket" width={size} height={size} className="rounded-xl bg-white p-2" />
  ) : (
    <div style={{ width: size, height: size }} className="animate-pulse rounded-xl bg-surface-muted" />
  );
}
