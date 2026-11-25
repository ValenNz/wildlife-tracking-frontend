"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Banknote, CreditCard, Minus, Plus, QrCode, UserPlus } from "lucide-react";

import { Button } from "@/components/button";
import { FormAlert, FormCheckbox, TextInput } from "@/components/form";
import { useToast } from "@/components/toast";
import { Loading } from "@/components/ui";
import { useDebounce } from "@/hooks/use-debounce";
import { usePosSell } from "@/hooks/use-pos";
import { useTourQuote, useTourRoutes, useTourSchedule } from "@/hooks/use-tourism";
import { cn } from "@/lib/utils";
import { formatApiError } from "@/services/api";
import type { TYPE_POS_METHOD, TYPE_POS_SALE } from "@/types/pos.type";
import { SHIFT_LABELS, VISITOR_TYPE_LABELS, type TYPE_QUOTE_PAYLOAD, type TYPE_VISITOR_TYPE } from "@/types/tourism.type";
import { formatRupiah } from "@/utils/format";

import { addDays, isSellable, quickCash, wibDate } from "./utils";

type Counts = { wni: number; pelajar: number; wna: number; drone: number };
const EMPTY: Counts = { wni: 1, pelajar: 0, wna: 0, drone: 0 };
const COUNTERS: { key: keyof Counts; label: string; max: number }[] = [
  { key: "wni", label: "WNI", max: 50 },
  { key: "pelajar", label: "Pelajar (min. 5)", max: 50 },
  { key: "wna", label: "WNA", max: 50 },
  { key: "drone", label: "Drone", max: 5 },
];
const METHODS: { value: TYPE_POS_METHOD; label: string; icon: typeof Banknote }[] = [
  { value: "cash", label: "Tunai", icon: Banknote },
  { value: "qris", label: "QRIS", icon: QrCode },
  { value: "edc", label: "Kartu (EDC)", icon: CreditCard },
];

export function SaleForm({ onSold }: { onSold: (sale: TYPE_POS_SALE) => void }) {
  const { showToast } = useToast();
  const today = wibDate();
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(today, index)), [today]);
  const routesQuery = useTourRoutes();
  const sellMutation = usePosSell();

  const [routeId, setRouteId] = useState(0);
  const [date, setDate] = useState(today);
  const [shiftId, setShiftId] = useState(0);
  const [counts, setCounts] = useState<Counts>(EMPTY);
  const [buyer, setBuyer] = useState({ name: "", phone: "" });
  const [names, setNames] = useState<string[]>([]);
  const [showNames, setShowNames] = useState(false);
  const [method, setMethod] = useState<TYPE_POS_METHOD>("cash");
  const [received, setReceived] = useState("");
  const [reference, setReference] = useState("");
  const [checkInNow, setCheckInNow] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const routes = useMemo(() => routesQuery.data ?? [], [routesQuery.data]);
  const activeRouteId = routeId || routes[0]?.route_id || 0;
  const scheduleQuery = useTourSchedule(activeRouteId ? { from: date, to: date, route_id: activeRouteId } : undefined);
  const shifts = (scheduleQuery.data ?? []).filter((shift) => shift.route?.route_id === activeRouteId);
  const shift = shifts.find((item) => item.shift_id === shiftId && isSellable(item)) ?? null;
  const people = counts.wni + counts.pelajar + counts.wna;

  const quoteKey =
    shift && people > 0
      ? JSON.stringify({
          route_id: activeRouteId,
          visit_date: shift.shift_date,
          wni_count: counts.wni,
          wna_count: counts.wna,
          student_count: counts.pelajar,
          drone_count: counts.drone,
        })
      : "";
  const debouncedKey = useDebounce(quoteKey, 250);
  const quoteInput = useMemo(() => (debouncedKey ? (JSON.parse(debouncedKey) as TYPE_QUOTE_PAYLOAD) : null), [debouncedKey]);
  const quoteQuery = useTourQuote(quoteInput);
  const quote = debouncedKey === quoteKey ? quoteQuery.data : undefined;
  const total = quote?.total ?? 0;
  const receivedNumber = Number(received || 0);
  const change = method === "cash" ? receivedNumber - total : 0;

  const visitorTypes: TYPE_VISITOR_TYPE[] = [
    ...Array<TYPE_VISITOR_TYPE>(counts.wni).fill("wni"),
    ...Array<TYPE_VISITOR_TYPE>(counts.pelajar).fill("pelajar"),
    ...Array<TYPE_VISITOR_TYPE>(counts.wna).fill("wna"),
  ];

  const setCount = (key: keyof Counts, delta: number) => {
    const max = COUNTERS.find((counter) => counter.key === key)?.max ?? 50;
    setCounts((previous) => ({ ...previous, [key]: Math.min(max, Math.max(0, previous[key] + delta)) }));
    setError(null);
  };

  const reset = () => {
    setCounts(EMPTY);
    setBuyer({ name: "", phone: "" });
    setNames([]);
    setShowNames(false);
    setReceived("");
    setReference("");
    setError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sellMutation.isPending) return;
    if (!shift) return setError("Pilih shift yang masih bisa dijual.");
    if (people === 0) return setError("Tambahkan minimal satu pengunjung.");
    if (people > shift.remaining) return setError(`Kuota shift tinggal ${shift.remaining} orang.`);
    if (buyer.name.trim().length < 2) return setError("Isi nama pembeli.");
    if (!quote) return setError("Harga belum terhitung. Tunggu sebentar.");
    if (method === "cash" && receivedNumber < total) return setError("Uang diterima kurang dari total.");

    try {
      const response = await sellMutation.mutateAsync({
        route_id: activeRouteId,
        shift_id: shift.shift_id,
        wni_count: counts.wni,
        wna_count: counts.wna,
        student_count: counts.pelajar,
        drone_count: counts.drone,
        contact_name: buyer.name.trim(),
        contact_phone: buyer.phone.trim() || undefined,
        participants: visitorTypes.map((type, index) => ({ full_name: names[index]?.trim() ?? "", visitor_type: type })),
        payment_method: method,
        received_amount: method === "cash" ? receivedNumber : null,
        external_reference: method !== "cash" ? reference.trim() || undefined : undefined,
        check_in_now: shift.shift_date === today && checkInNow,
      });
      showToast(response.message ?? "Transaksi berhasil.", "success");
      reset();
      onSold(response.data);
    } catch (submitError) {
      setError(formatApiError(submitError, "Transaksi gagal."));
    }
  };

  if (routesQuery.isLoading) return <Loading label="Memuat rute..." />;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
      <div className="flex flex-col gap-4">
        <section className="ui-panel p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">1 · Rute</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {routes.map((route) => (
              <button
                key={route.route_id}
                type="button"
                onClick={() => {
                  setRouteId(route.route_id);
                  setShiftId(0);
                }}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left text-sm transition",
                  route.route_id === activeRouteId ? "border-primary bg-primary text-white" : "border-line hover:border-primary",
                )}
              >
                <span className="block font-semibold">{route.name}</span>
                <span className={cn("text-xs", route.route_id === activeRouteId ? "text-white/75" : "text-muted")}>
                  {route.code} · pemandu {formatRupiah(route.guide_fee_per_person)}/org
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="ui-panel p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">2 · Tanggal & shift</p>
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
            {days.map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setDate(day);
                  setShiftId(0);
                }}
                className={cn(
                  "min-w-20 rounded-lg px-3 py-1.5 text-xs font-semibold",
                  day === date ? "bg-primary text-white" : "border border-line bg-surface text-ink-soft",
                )}
              >
                {index === 0 ? "Hari ini" : new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${day}T12:00:00`))}
              </button>
            ))}
          </div>
          {scheduleQuery.isLoading ? (
            <Loading />
          ) : shifts.length === 0 ? (
            <p className="text-sm text-muted">Tidak ada shift untuk rute ini pada tanggal tersebut.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {shifts.map((item) => {
                const sellable = isSellable(item);
                return (
                  <button
                    key={item.shift_id}
                    type="button"
                    disabled={!sellable}
                    onClick={() => setShiftId(item.shift_id)}
                    className={cn(
                      "rounded-xl border p-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50",
                      item.shift_id === shiftId && sellable ? "border-primary bg-primary-soft" : "border-line hover:border-primary",
                    )}
                  >
                    <span className="block font-semibold text-ink">{SHIFT_LABELS[item.shift_type]} {item.start_time}–{item.end_time}</span>
                    <span className="block text-xs text-muted">{item.guide?.display_name ?? "-"}</span>
                    <span className={cn("text-xs font-semibold", item.remaining > 0 ? "text-forest-primary" : "text-danger")}>
                      {!sellable ? (item.remaining > 0 ? "Sudah berjalan" : "Penuh") : `Sisa ${item.remaining}/${item.capacity}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="ui-panel p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">3 · Pengunjung</p>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {COUNTERS.map((counter) => (
              <div key={counter.key} className="rounded-xl border border-line p-2.5 text-center">
                <p className="text-xs font-semibold text-ink-soft">{counter.label}</p>
                <div className="mt-1.5 flex items-center justify-center gap-2">
                  <button type="button" aria-label={`Kurangi ${counter.label}`} onClick={() => setCount(counter.key, -1)} className="inline-flex size-9 items-center justify-center rounded-lg border border-line hover:border-primary"><Minus className="size-4" /></button>
                  <span className="w-7 text-xl font-bold tabular-nums" aria-live="polite">{counts[counter.key]}</span>
                  <button type="button" aria-label={`Tambah ${counter.label}`} onClick={() => setCount(counter.key, 1)} className="inline-flex size-9 items-center justify-center rounded-lg border border-line hover:border-primary"><Plus className="size-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <TextInput aria-label="Nama pembeli" placeholder="Nama pembeli *" maxLength={100} value={buyer.name} onChange={(event) => setBuyer({ ...buyer, name: event.target.value })} />
            <TextInput aria-label="No. HP pembeli" placeholder="No. HP (opsional)" type="tel" maxLength={30} value={buyer.phone} onChange={(event) => setBuyer({ ...buyer, phone: event.target.value })} />
          </div>
          {people > 1 ? (
            <button type="button" onClick={() => setShowNames((value) => !value)} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <UserPlus className="size-3.5" /> {showNames ? "Sembunyikan" : "Isi"} nama peserta lain (opsional)
            </button>
          ) : null}
          {showNames ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {visitorTypes.slice(1).map((type, offset) => (
                <TextInput
                  key={offset}
                  aria-label={`Nama peserta ${offset + 2}`}
                  placeholder={`Peserta ${offset + 2} (${VISITOR_TYPE_LABELS[type]})`}
                  maxLength={100}
                  value={names[offset + 1] ?? ""}
                  onChange={(event) =>
                    setNames((previous) => {
                      const next = [...previous];
                      next[offset + 1] = event.target.value;
                      return next;
                    })
                  }
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <aside className="flex flex-col gap-4">
        <section className="ui-panel overflow-hidden">
          <div className="bg-primary-dark px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-wider text-white/70">Total bayar</p>
            <p className="text-3xl font-bold tabular-nums" aria-live="polite">
              {quoteQuery.isFetching && !quote ? "…" : formatRupiah(total)}
            </p>
            {quote ? <p className="text-xs text-white/70">Tarif {quote.day_type === "holiday" ? "hari libur" : "hari kerja"} · {people} orang</p> : null}
          </div>
          {quote ? (
            <ul className="flex flex-col gap-1.5 border-b border-line px-5 py-3 text-xs">
              {quote.lines.map((line) => (
                <li key={line.code} className="flex justify-between gap-3">
                  <span className="text-ink-soft">{line.label} <span className="text-muted">×{line.quantity}{line.days > 1 ? `×${line.days}h` : ""}</span></span>
                  <span className="font-semibold text-ink">{formatRupiah(line.subtotal)}</span>
                </li>
              ))}
            </ul>
          ) : quoteQuery.error ? (
            <div className="p-4"><FormAlert message={formatApiError(quoteQuery.error, "Harga tidak dapat dihitung.")} /></div>
          ) : null}

          <div className="flex flex-col gap-3 p-5">
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Metode bayar">
              {METHODS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={method === value}
                  onClick={() => setMethod(value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-semibold",
                    method === value ? "border-primary bg-primary-soft text-primary" : "border-line text-ink-soft",
                  )}
                >
                  <Icon className="size-5" /> {label}
                </button>
              ))}
            </div>

            {method === "cash" ? (
              <>
                <TextInput aria-label="Uang diterima" type="number" min={0} step={1000} placeholder="Uang diterima" value={received} onChange={(event) => setReceived(event.target.value)} className="text-lg font-bold" />
                {total > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {quickCash(total).map((value) => (
                      <button key={value} type="button" onClick={() => setReceived(String(value))} className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:border-primary">
                        {value === total ? "Uang pas" : formatRupiah(value)}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
                  <span className="text-sm text-muted">Kembalian</span>
                  <span className={cn("text-xl font-bold tabular-nums", change < 0 ? "text-danger" : "text-ink")}>
                    {received === "" ? "-" : change < 0 ? `Kurang ${formatRupiah(-change)}` : formatRupiah(change)}
                  </span>
                </div>
              </>
            ) : (
              <TextInput aria-label="Nomor referensi" maxLength={100} placeholder={method === "qris" ? "No. referensi QRIS (dari notifikasi)" : "Kode approval EDC"} value={reference} onChange={(event) => setReference(event.target.value)} />
            )}

            {shift && shift.shift_date === today ? (
              <FormCheckbox id="checkin-now" label="Langsung check-in (pengunjung masuk sekarang)" checked={checkInNow} onChange={(event) => setCheckInNow(event.target.checked)} />
            ) : null}

            {error ? <FormAlert message={error} /> : null}

            <Button type="submit" size="lg" loading={sellMutation.isPending} disabled={!shift || people === 0 || !quote}>
              {sellMutation.isPending ? "Memproses..." : "Bayar & Cetak Struk"}
            </Button>
          </div>
        </section>
      </aside>
    </form>
  );
}
