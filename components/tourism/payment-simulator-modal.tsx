"use client";

/* eslint-disable @next/next/no-img-element -- QR simulasi dibuat sebagai data URL di browser */
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { Building2, Check, Copy, QrCode, ShieldCheck, Smartphone, Wallet } from "lucide-react";

import { Button } from "@/components/button";
import { usePreferences } from "@/components/providers/preferences-provider";
import { Modal } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { TYPE_SIMULATE_PAYMENT_CHANNEL } from "@/types/tourism.type";
import { formatRupiah } from "@/utils/format";

type TabMode = "qris" | "va" | "ewallet";

const VA_BANKS: { channel: TYPE_SIMULATE_PAYMENT_CHANNEL; label: string; prefix: string }[] = [
  { channel: "va_bca", label: "BCA Virtual Account", prefix: "39010" },
  { channel: "va_bni", label: "BNI Virtual Account", prefix: "88080" },
  { channel: "va_bri", label: "BRI Virtual Account (BRIVA)", prefix: "12680" },
  { channel: "va_mandiri", label: "Mandiri Virtual Account", prefix: "89508" },
];

const EWALLETS: { channel: TYPE_SIMULATE_PAYMENT_CHANNEL; label: string; hint: string }[] = [
  { channel: "gopay", label: "GoPay", hint: "Konfirmasi instan via aplikasi Gojek" },
  { channel: "ovo", label: "OVO", hint: "Notifikasi push ke nomor terdaftar" },
  { channel: "dana", label: "DANA", hint: "Pembayaran dompet digital DANA" },
  { channel: "shopeepay", label: "ShopeePay", hint: "Saldo atau SPayLater" },
];

const buildVaNumber = (prefix: string, reference: string, bookingCode: string) => {
  const digits = `${reference}${bookingCode}`
    .split("")
    .map((ch) => (/\d/.test(ch) ? ch : String(ch.charCodeAt(0) % 10)))
    .join("")
    .slice(0, 11)
    .padEnd(11, "0");
  return `${prefix}${digits}`;
};

export function PaymentSimulatorModal({
  open,
  onClose,
  bookingCode,
  reference,
  amount,
  merchantName,
  pending,
  onSimulate,
}: {
  open: boolean;
  onClose: () => void;
  bookingCode: string;
  reference: string;
  amount: number;
  merchantName: string;
  pending: boolean;
  onSimulate: (channel: TYPE_SIMULATE_PAYMENT_CHANNEL, outcome: "paid" | "failed") => Promise<void>;
}) {
  const { t } = usePreferences();
  const [tab, setTab] = useState<TabMode>("qris");
  const [vaChannel, setVaChannel] = useState<TYPE_SIMULATE_PAYMENT_CHANNEL>("va_bca");
  const [walletChannel, setWalletChannel] = useState<TYPE_SIMULATE_PAYMENT_CHANNEL>("gopay");
  const [qrisDataUrl, setQrisDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedChannel: TYPE_SIMULATE_PAYMENT_CHANNEL =
    tab === "qris" ? "qris" : tab === "va" ? vaChannel : walletChannel;

  const selectedBank = VA_BANKS.find((b) => b.channel === vaChannel) ?? VA_BANKS[0];
  const vaNumber = useMemo(
    () => buildVaNumber(selectedBank.prefix, reference, bookingCode),
    [selectedBank.prefix, reference, bookingCode],
  );

  useEffect(() => {
    if (!open || tab !== "qris") return;
    let active = true;
    const payload = `QRIS-SIM|MERCHANT=${merchantName}|BOOKING=${bookingCode}|REF=${reference}|AMOUNT=${amount}`;
    QRCode.toDataURL(payload, { width: 220, margin: 1, errorCorrectionLevel: "M" })
      .then((url) => active && setQrisDataUrl(url))
      .catch(() => active && setQrisDataUrl(null));
    return () => {
      active = false;
    };
  }, [open, tab, merchantName, bookingCode, reference, amount]);

  const copyVa = async () => {
    try {
      await navigator.clipboard.writeText(vaNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {

    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t("payModalTitle")} size="md">
      <div className="flex flex-col gap-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-surface-muted p-4">
          <div>
            <p className="text-xs font-semibold text-muted">{merchantName}</p>
            <p className="font-mono text-xs text-ink-soft">
              {bookingCode} · {reference}
            </p>
            <p className="mt-1 text-xl font-bold text-primary">{formatRupiah(amount)}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-dark">
            <ShieldCheck className="size-3.5" /> {t("payModalBadge")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-muted p-1">
          {(
            [
              { id: "qris", label: t("payTabQris"), icon: QrCode },
              { id: "va", label: t("payTabVa"), icon: Building2 },
              { id: "ewallet", label: t("payTabWallet"), icon: Wallet },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition",
                tab === id ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-ink",
              )}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>

        {tab === "qris" ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-line p-4 text-center">
            {qrisDataUrl ? (
              <img src={qrisDataUrl} alt="Kode QRIS simulasi" width={196} height={196} className="rounded-xl border border-line bg-white p-2" />
            ) : (
              <div className="h-[196px] w-[196px] animate-pulse rounded-xl bg-surface-muted" />
            )}
            <p className="text-xs leading-5 text-muted">
              QRIS standar simulasi untuk <b>{merchantName}</b>. Pada sistem produksi, webhook dari penyedia QRIS akan
              memanggil endpoint verifikasi otomatis tanpa campur tangan petugas.
            </p>
          </div>
        ) : null}

        {tab === "va" ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-line p-4">
            <div className="grid grid-cols-2 gap-2">
              {VA_BANKS.map((bank) => (
                <button
                  key={bank.channel}
                  type="button"
                  onClick={() => setVaChannel(bank.channel)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-xs font-semibold transition",
                    vaChannel === bank.channel
                      ? "border-primary bg-primary-soft text-primary-dark"
                      : "border-line text-ink-soft hover:border-primary",
                  )}
                >
                  {bank.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-muted p-3">
              <div>
                <p className="text-[11px] text-muted">Nomor {selectedBank.label}</p>
                <p className="font-mono text-base font-bold tracking-wider text-ink">{vaNumber}</p>
              </div>
              <Button variant="outline" size="sm" icon={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} onClick={() => void copyVa()}>
                {copied ? "Disalin" : "Salin"}
              </Button>
            </div>
          </div>
        ) : null}

        {tab === "ewallet" ? (
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-line p-4">
            {EWALLETS.map((wallet) => (
              <button
                key={wallet.channel}
                type="button"
                onClick={() => setWalletChannel(wallet.channel)}
                className={cn(
                  "flex items-start gap-2 rounded-xl border p-3 text-left transition",
                  walletChannel === wallet.channel
                    ? "border-primary bg-primary-soft"
                    : "border-line hover:border-primary",
                )}
              >
                <Smartphone className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-xs font-bold text-ink">{wallet.label}</span>
                  <span className="block text-[11px] text-muted">{wallet.hint}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => void onSimulate(selectedChannel, "failed")}
          >
            {t("payFailBtn")}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" disabled={pending} onClick={onClose}>
              {t("payCloseBtn")}
            </Button>
            <Button
              loading={pending}
              icon={<ShieldCheck className="size-4" />}
              onClick={() => void onSimulate(selectedChannel, "paid")}
            >
              {pending ? t("payVerifying") : t("payConfirmBtn")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
