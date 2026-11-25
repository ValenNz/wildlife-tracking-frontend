"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hitung mundur batas pembayaran; memanggil onExpire sekali saat waktu habis.
 * Beri `key` berbeda dari induk bila nilai `seconds` dari server perlu memulai ulang hitungan.
 */
export function Countdown({ seconds, onExpire }: { seconds: number; onExpire?: () => void }) {
  const [deadline] = useState(() => Date.now() + seconds * 1000);
  const [left, setLeft] = useState(seconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline, onExpire]);

  const minutes = Math.floor(left / 60);
  const rest = left % 60;

  return (
    <span className="font-mono tabular-nums">
      {String(minutes).padStart(2, "0")}:{String(rest).padStart(2, "0")}
    </span>
  );
}
