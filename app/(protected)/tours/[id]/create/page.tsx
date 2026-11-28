"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Minus, Plus, Receipt, ShieldCheck } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/button";
import { FormAlert, FormField, FormGrid, FormSection, SelectInput, TextArea, TextInput } from "@/components/form";
import { useToast } from "@/components/toast";
import { ErrorState, Loading, PageHeader } from "@/components/ui";
import { useDebounce } from "@/hooks/use-debounce";
import { useBookingCreate, useTourQuote, useTourRoute } from "@/hooks/use-tourism";
import { formatApiError, getApiFieldErrors, toApiErrorState } from "@/services/api";
import {
  PAYMENT_METHOD_LABELS,
  SHIFT_LABELS,
  VISITOR_TYPE_LABELS,
  type TYPE_BOOKING_PAYLOAD,
  type TYPE_PARTICIPANT,
  type TYPE_QUOTE_PAYLOAD,
  type TYPE_VISITOR_TYPE,
} from "@/types/tourism.type";
import { formatLongDate, formatRupiah } from "@/utils/format";

type Counts = { wni: number; wna: number; pelajar: number; drone: number; porter: number };

const COUNTERS: { key: keyof Counts; label: string; hint: string; max: number }[] = [
  { key: "wni", label: "WNI", hint: "Wisatawan nusantara", max: 50 },
  { key: "pelajar", label: "Pelajar/Mahasiswa", hint: "Rombongan min. 5 orang, bawa kartu pelajar", max: 50 },
  { key: "wna", label: "WNA", hint: "Wisatawan mancanegara", max: 50 },
  { key: "drone", label: "Drone", hint: "Izin kamera drone per unit per hari", max: 5 },
  { key: "porter", label: "Jasa Porter (Add-on)", hint: "Tambahan porter logistik per hari (maks 20 kg/porter)", max: 20 },
];

const bookingSchema = z.object({
  shift_id: z.number().int().positive("Pilih jadwal pemandu."),
  contact_name: z.string().trim().min(3, "Nama kontak minimal 3 karakter.").max(100),
  contact_phone: z.string().trim().regex(/^[0-9+\-\s()]{8,30}$/, "Nomor telepon tidak valid."),
  emergency_contact: z.string().trim().min(5, "Isi nama & nomor kontak darurat.").max(150),
  notes: z.string().max(500).optional(),
  participants: z
    .array(z.object({ full_name: z.string().trim().min(2, "Nama setiap peserta wajib diisi.").max(100) }))
    .min(1, "Minimal satu peserta."),
});

const buildParticipants = (counts: Counts, previous: TYPE_PARTICIPANT[]): TYPE_PARTICIPANT[] => {
  const types: TYPE_VISITOR_TYPE[] = [
    ...Array<TYPE_VISITOR_TYPE>(counts.wni).fill("wni"),
    ...Array<TYPE_VISITOR_TYPE>(counts.pelajar).fill("pelajar"),
    ...Array<TYPE_VISITOR_TYPE>(counts.wna).fill("wna"),
  ];
  const pool = [...previous];

  return types.map((type) => {
    const index = pool.findIndex((participant) => participant.visitor_type === type);
    const reused = index >= 0 ? pool.splice(index, 1)[0] : null;
    return reused ?? { full_name: "", visitor_type: type, age: null };
  });
};

function TourBookContent() {
  const { id: slug } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const routeQuery = useTourRoute(slug ?? "");
  const createMutation = useBookingCreate();

  const [shiftId, setShiftId] = useState<number>(Number(searchParams.get("shift") ?? 0));
  const [counts, setCounts] = useState<Counts>({ wni: 1, wna: 0, pelajar: 0, drone: 0, porter: 0 });
  const [participants, setParticipants] = useState<TYPE_PARTICIPANT[]>([{ full_name: "", visitor_type: "wni", age: null }]);
  const [contact, setContact] = useState({ contact_name: "", contact_phone: "", emergency_contact: "", notes: "" });
  const [method, setMethod] = useState<TYPE_BOOKING_PAYLOAD["payment_method"]>("bank_transfer");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const detail = routeQuery.data;
  const route = detail?.route;
  const shifts = useMemo(() => (detail?.upcoming_shifts ?? []).filter((shift) => shift.remaining > 0), [detail]);
  const shift = shifts.find((item) => item.shift_id === shiftId) ?? null;
  const people = counts.wni + counts.wna + counts.pelajar;


  const quoteKey =
    route && shift && people > 0
      ? JSON.stringify({
          route_id: route.route_id,
          visit_date: shift.shift_date,
          wni_count: counts.wni,
          wna_count: counts.wna,
          student_count: counts.pelajar,
          drone_count: counts.drone,
          porter_count: counts.porter,
        })
      : "";
  const debouncedQuoteKey = useDebounce(quoteKey, 350);
  const quoteInput = useMemo(
    () => (debouncedQuoteKey ? (JSON.parse(debouncedQuoteKey) as TYPE_QUOTE_PAYLOAD) : null),
    [debouncedQuoteKey],
  );
  const quoteQuery = useTourQuote(quoteInput);

  const setCount = (key: keyof Counts, delta: number) => {
    const counter = COUNTERS.find((item) => item.key === key);
    const next = { ...counts, [key]: Math.min(counter?.max ?? 50, Math.max(0, counts[key] + delta)) };
    setCounts(next);
    setParticipants((previous) => buildParticipants(next, previous));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!route || createMutation.isPending) return;

    const parsed = bookingSchema.safeParse({ shift_id: shiftId, ...contact, participants });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Periksa kembali isian.");
      return;
    }
    if (shift && people > shift.remaining) {
      setError(`Kuota shift ini tinggal ${shift.remaining} orang.`);
      return;
    }

    try {
      const response = await createMutation.mutateAsync({
        route_id: route.route_id,
        shift_id: shiftId,
        wni_count: counts.wni,
        wna_count: counts.wna,
        student_count: counts.pelajar,
        drone_count: counts.drone,
        porter_count: counts.porter,
        contact_name: contact.contact_name.trim(),
        contact_phone: contact.contact_phone.trim(),
        emergency_contact: contact.emergency_contact.trim(),
        notes: contact.notes.trim() || undefined,
        payment_method: method,
        participants: participants.map((participant) => ({
          full_name: participant.full_name.trim(),
          visitor_type: participant.visitor_type,
          age: participant.age ? Number(participant.age) : null,
        })),
      });
      showToast("Pemesanan dibuat. Selesaikan pembayaran sebelum batas waktu.", "success");
      router.push(`/bookings/${response.data.booking_code}/detail`);
    } catch (submitError) {
      setFieldErrors(getApiFieldErrors(submitError));
      setError(formatApiError(submitError, "Pemesanan gagal."));
    }
  };

  if (routeQuery.isLoading) return <Loading label="Menyiapkan form pemesanan..." />;
  if (routeQuery.error || !route) {
    const state = toApiErrorState(routeQuery.error);
    return <ErrorState kind={state.kind} message={state.message} status={state.status} errors={state.errors} onRetry={() => void routeQuery.refetch()} />;
  }

  const quote = quoteQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Pemesanan tiket"
        title={route.name}
        description="Harga dihitung oleh server sesuai kategori pengunjung dan hari kunjungan (Minggu/libur nasional memakai tarif libur)."
        className="mb-0"
        actions={
          <Link href={`/tours/${route.slug}/detail`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink-soft hover:border-primary hover:text-primary">
            <ArrowLeft className="size-4" /> Detail rute
          </Link>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-4">
          <FormSection title="1. Jadwal & pemandu" description="Hanya shift yang masih memiliki kuota yang ditampilkan. Pemesanan ditutup 2 jam sebelum shift dimulai.">
            {shifts.length === 0 ? (
              <p className="text-sm text-muted">Belum ada shift tersedia untuk rute ini.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {shifts.map((item) => (
                  <label
                    key={item.shift_id}
                    className={`flex cursor-pointer flex-col gap-1 rounded-2xl border p-3 text-sm transition ${
                      item.shift_id === shiftId ? "border-primary bg-primary-soft" : "border-line hover:border-primary"
                    }`}
                  >
                    <input type="radio" name="shift" className="sr-only" checked={item.shift_id === shiftId} onChange={() => setShiftId(item.shift_id)} />
                    <span className="font-semibold text-ink">{formatLongDate(item.shift_date)}</span>
                    <span className="text-xs text-muted">{SHIFT_LABELS[item.shift_type]} · {item.start_time}–{item.end_time}</span>
                    <span className="text-xs text-ink-soft">Pemandu: <b>{item.guide?.display_name ?? "-"}</b> · sisa {item.remaining}</span>
                  </label>
                ))}
              </div>
            )}
            {fieldErrors.shift_id ? <p className="text-sm text-danger">{fieldErrors.shift_id}</p> : null}
          </FormSection>

          <FormSection title="2. Jumlah pengunjung" description={`Maksimal ${route.max_group_size} orang per rombongan${route.min_age ? `, usia minimal ${route.min_age} tahun` : ""}.`}>
            <div className="grid gap-3 sm:grid-cols-2">
              {COUNTERS.map((counter) => (
                <div key={counter.key} className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{counter.label}</p>
                    <p className="text-xs text-muted">
                      {counter.key === "porter"
                        ? `${formatRupiah(route.porter_fee_per_day ?? 150000)}/hari · ${counter.hint}`
                        : counter.hint}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label={`Kurangi ${counter.label}`} onClick={() => setCount(counter.key, -1)} className="inline-flex size-8 items-center justify-center rounded-lg border border-line hover:border-primary"><Minus className="size-4" /></button>
                    <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">{counts[counter.key]}</span>
                    <button type="button" aria-label={`Tambah ${counter.label}`} onClick={() => setCount(counter.key, 1)} className="inline-flex size-8 items-center justify-center rounded-lg border border-line hover:border-primary"><Plus className="size-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="3. Data peserta" description="Nama sesuai identitas untuk pengecekan di loket. Nomor identitas tidak disimpan.">
            <div className="flex flex-col gap-3">
              {participants.map((participant, index) => (
                <div key={index} className="grid gap-3 sm:grid-cols-[1fr_140px_100px]">
                  <TextInput
                    aria-label={`Nama peserta ${index + 1}`}
                    placeholder={`Nama peserta ${index + 1}`}
                    value={participant.full_name}
                    onChange={(event) =>
                      setParticipants((previous) => previous.map((item, i) => (i === index ? { ...item, full_name: event.target.value } : item)))
                    }
                  />
                  <span className="inline-flex h-10 items-center rounded-xl bg-surface-muted px-3 text-xs font-semibold text-ink-soft">
                    {VISITOR_TYPE_LABELS[participant.visitor_type]}
                  </span>
                  <TextInput
                    type="number"
                    min={0}
                    max={120}
                    aria-label={`Usia peserta ${index + 1}`}
                    placeholder="Usia"
                    value={participant.age ?? ""}
                    onChange={(event) =>
                      setParticipants((previous) =>
                        previous.map((item, i) => (i === index ? { ...item, age: event.target.value === "" ? null : Number(event.target.value) } : item)),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="4. Kontak & pembayaran">
            <FormGrid columns={2}>
              <FormField label="Nama penanggung jawab" htmlFor="contact_name" required error={fieldErrors.contact_name}>
                <TextInput id="contact_name" value={contact.contact_name} onChange={(event) => setContact({ ...contact, contact_name: event.target.value })} />
              </FormField>
              <FormField label="No. HP / WhatsApp" htmlFor="contact_phone" required error={fieldErrors.contact_phone}>
                <TextInput id="contact_phone" type="tel" value={contact.contact_phone} onChange={(event) => setContact({ ...contact, contact_phone: event.target.value })} />
              </FormField>
              <FormField label="Kontak darurat (nama & nomor)" htmlFor="emergency_contact" required error={fieldErrors.emergency_contact}>
                <TextInput id="emergency_contact" value={contact.emergency_contact} onChange={(event) => setContact({ ...contact, emergency_contact: event.target.value })} />
              </FormField>
              <FormField label="Metode pembayaran" htmlFor="payment_method" required>
                <SelectInput id="payment_method" value={method} onChange={(event) => setMethod(event.target.value as typeof method)}>
                  {(["bank_transfer", "qris", "ewallet"] as const).map((value) => (
                    <option key={value} value={value}>{PAYMENT_METHOD_LABELS[value]}</option>
                  ))}
                </SelectInput>
              </FormField>
            </FormGrid>
            <FormField label="Catatan (alergi, kondisi kesehatan, dsb.)" htmlFor="notes">
              <TextArea id="notes" rows={3} maxLength={500} value={contact.notes} onChange={(event) => setContact({ ...contact, notes: event.target.value })} />
            </FormField>
          </FormSection>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <section className="ui-panel overflow-hidden">
            <div className="flex items-center gap-2 border-b border-line bg-surface-muted px-5 py-4">
              <Receipt className="size-5 text-primary" />
              <h2 className="text-base font-bold text-ink">Rincian biaya</h2>
            </div>
            <div className="flex flex-col gap-3 p-5 text-sm">
              {!shift ? (
                <p className="text-muted">Pilih jadwal untuk melihat harga.</p>
              ) : people === 0 ? (
                <p className="text-muted">Tambahkan minimal satu pengunjung.</p>
              ) : quoteQuery.isFetching && !quote ? (
                <p className="text-muted">Menghitung harga...</p>
              ) : quoteQuery.error ? (
                <FormAlert message={formatApiError(quoteQuery.error, "Harga tidak dapat dihitung.")} />
              ) : quote ? (
                <>
                  <p className="text-xs text-muted">
                    {formatLongDate(shift.shift_date)} · tarif {quote.day_type === "holiday" ? "hari libur" : "hari kerja"}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {quote.lines.map((line) => (
                      <li key={line.code} className="flex justify-between gap-3">
                        <span className="text-ink-soft">
                          {line.label}
                          <span className="block text-xs text-muted">
                            {line.quantity} × {formatRupiah(line.unit_price)}{line.days > 1 ? ` × ${line.days} hari` : ""}
                          </span>
                        </span>
                        <span className="font-semibold text-ink">{formatRupiah(line.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between border-t border-line pt-3 text-base">
                    <span className="font-bold text-ink">Total</span>
                    <span className="font-bold text-primary">{formatRupiah(quote.total)}</span>
                  </div>
                </>
              ) : null}
            </div>
          </section>

          <p className="flex gap-2 rounded-2xl bg-surface-muted p-4 text-xs leading-5 text-ink-soft">
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            Setelah pemesanan dibuat Anda punya batas waktu untuk membayar & mengunggah bukti. Tiket QR terbit setelah petugas memverifikasi pembayaran.
          </p>

          {error ? <FormAlert message={error} /> : null}

          <Button type="submit" size="lg" loading={createMutation.isPending} disabled={!shift || people === 0}>
            {createMutation.isPending ? "Memproses..." : "Buat Pemesanan"}
          </Button>
        </aside>
      </form>
    </div>
  );
}

export default function TourBookPage() {
  return (
    <Suspense fallback={<Loading label="Menyiapkan form pemesanan..." />}>
      <TourBookContent />
    </Suspense>
  );
}
