"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ReactNode } from "react";

import { AiThreatBadge } from "../vision/ai-status";
import { AI_MATCH_METHOD_LABELS, type AiRecap } from "@/types/ai.type";
import { formatDate, formatDateTime } from "@/utils/format";

const number = new Intl.NumberFormat("id-ID");

export function RecapDocument({ recap }: { recap: AiRecap }) {
  const { totals, faces } = recap;
  const unverified = totals.by_verification.pending ?? 0;

  return (
    <article className="flex flex-col gap-10">
      <header className="border-b-2 border-forest-deep pb-6">
        <p className="text-sm text-muted">
          Taman Nasional Gunung Leuser · {formatDate(recap.period.start)} sampai {formatDate(recap.period.end)}
        </p>
        <p className="mt-3 max-w-4xl text-2xl font-semibold leading-snug tracking-tight text-forest-black sm:text-[2rem] sm:leading-[1.2]">
          AI menganalisis {number.format(totals.predictions)} media, mencatat {number.format(totals.animals_detected)} satwa,{" "}
          {number.format(totals.threat_detections)} ancaman, dan {number.format(faces.unknown_faces)} wajah tidak dikenal.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          <Figure label="Media diunggah" value={totals.media_uploaded} note={mediaMix(totals.media_by_type)} />
          <Figure label="Kemunculan staf" value={totals.staff_appearances} />
          <Figure label="Menunggu verifikasi" value={unverified} />
          <Figure label="Gagal / tidak dikenali" value={(totals.by_status.failed ?? 0) + (totals.by_status.unrecognized ?? 0)} />
        </dl>
      </header>

      <DailyStrip days={recap.daily} />

      <div className="grid gap-10 xl:grid-cols-2">
        <Section title="Spesies terdeteksi" empty={recap.species.length === 0}>
          <Table
            head={["Spesies", "Deteksi", "Individu", "Keyakinan", "Terakhir"]}
            numeric={[1, 2, 3]}
            rows={recap.species.map((item) => [
              <span key="n">
                <span className="font-semibold text-ink">{item.common_name ?? "-"}</span>
                <span className="block text-xs italic text-muted">{item.scientific_name}</span>
              </span>,
              item.detections,
              item.individuals_counted,
              `${Math.round(item.average_confidence * 100)}%`,
              formatDate(item.last_seen),
            ])}
          />
          {Object.keys(recap.other_labels).length > 0 ? (
            <p className="mt-3 text-xs text-muted">
              Label lain tanpa spesies terdaftar:{" "}
              {Object.entries(recap.other_labels).map(([label, count]) => `${label} (${count})`).join(", ")}
            </p>
          ) : null}
        </Section>

        <Section title="Individu satwa dikenali" empty={recap.individuals.length === 0}>
          <Table
            head={["Individu", "Kemunculan", "Dikenali lewat", "Terakhir"]}
            numeric={[1]}
            rows={recap.individuals.map((item) => [
              <Link key="a" href={`/animals/${item.animal_id}/detail`} className="font-semibold text-primary underline-offset-2 hover:underline">
                {item.name_animal ?? `#${item.animal_id}`}
              </Link>,
              item.sightings,
              Object.keys(item.methods).map((method) => AI_MATCH_METHOD_LABELS[method] ?? method).join(", "),
              formatDate(item.last_seen),
            ])}
          />
        </Section>

        <Section title="Wajah manusia" empty={faces.staff.length === 0 && faces.unknown_faces === 0}>
          <p className="mb-3 text-sm text-ink-soft">
            {number.format(faces.unknown_faces)} wajah tidak dikenal di {number.format(faces.media_with_unknown_faces)} media;{" "}
            {number.format(faces.possible_staff_needing_verification)} wajah mirip staf perlu dicek petugas.
          </p>
          <Table
            head={["Staf", "Kemunculan", "Terakhir terlihat"]}
            numeric={[1]}
            rows={faces.staff.map((item) => [item.name, item.appearances, formatDateTime(item.last_seen)])}
          />
        </Section>

        <Section title="Suara" empty={recap.sounds.length === 0}>
          <Table
            head={["Kategori", "Rekaman", "Dari video"]}
            numeric={[1, 2]}
            rows={recap.sounds.map((item) => [item.label, item.count, item.from_video])}
          />
        </Section>
      </div>

      <Section title="Ancaman terbaru" empty={recap.threats.recent.length === 0}>
        <Table
          head={["Waktu", "Ancaman", "Temuan", "Zona", "Media", "Verifikasi"]}
          rows={recap.threats.recent.map((item) => [
            <Link key="t" href={`/ai/vision/${item.prediction_id}/detail`} className="text-primary underline-offset-2 hover:underline">
              {formatDateTime(item.time)}
            </Link>,
            <AiThreatBadge key="b" level={item.threat_level} />,
            item.label ?? "-",
            item.zone ?? "-",
            item.media_type ?? "-",
            item.verification_status === "pending" ? "Belum" : item.verification_status === "confirmed" ? "Benar" : "Ditolak",
          ])}
        />
      </Section>

      <Section title="Per zona" empty={recap.by_zone.length === 0}>
        <Table
          head={["Zona", "Analisis", "Satwa", "Ancaman", "Wajah tidak dikenal"]}
          numeric={[1, 2, 3, 4]}
          rows={recap.by_zone.map((item) => [item.zone, item.detections, item.animals, item.threats, item.unknown_faces])}
        />
      </Section>

      <footer className="border-t border-line pt-4 text-xs leading-5 text-muted">
        Model: {recap.models.length > 0 ? recap.models.join(", ") : "-"}. Dicetak {formatDateTime(new Date().toISOString())}.
        Hasil AI bersifat bantuan; angka yang belum diverifikasi petugas dapat berubah.
      </footer>
    </article>
  );
}

const mediaMix = (byType: Record<string, number>) => {
  const names: Record<string, string> = { image: "foto", video: "video", audio: "audio" };
  return Object.entries(byType)
    .map(([type, count]) => `${count} ${names[type] ?? type}`)
    .join(", ");
};

function Figure({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="border-l-2 border-natural-muted pl-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums text-forest-black">{number.format(value)}</dd>
      {note ? <dd className="text-xs text-muted">{note}</dd> : null}
    </div>
  );
}

/** Satu kolom per hari: tinggi = jumlah analisis, tanda gelap di bawah = hari dengan ancaman. */
function DailyStrip({ days }: { days: AiRecap["daily"] }) {
  const max = Math.max(1, ...days.map((day) => day.analyzed));
  const threatDays = days.filter((day) => day.threats > 0).length;
  const labelEvery = Math.max(1, Math.ceil(days.length / 10));

  const summary = useMemo(
    () =>
      threatDays === 0
        ? "Tidak ada hari dengan ancaman pada periode ini."
        : `${threatDays} dari ${days.length} hari memiliki ancaman.`,
    [threatDays, days.length],
  );

  return (
    <section aria-labelledby="recap-daily" className="break-inside-avoid">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="recap-daily" className="text-base font-bold text-ink">Analisis per hari</h3>
        <p className="text-xs text-muted">{summary}</p>
      </div>
      <div className="flex h-40 items-end gap-[3px] border-b border-line-strong" aria-hidden="true">
        {days.map((day) => (
          <div key={day.date} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
            <div
              className="w-full rounded-t-[2px] bg-forest-primary/80 print:bg-forest-primary"
              style={{ height: `${(day.analyzed / max) * 100}%`, minHeight: day.analyzed > 0 ? 3 : 0 }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-forest-black px-2 py-1 text-[11px] text-white group-hover:block">
              {formatDate(day.date)}: {day.analyzed} analisis, {day.threats} ancaman
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-[3px]" aria-hidden="true">
        {days.map((day) => (
          <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className={day.threats > 0 ? "h-1.5 w-full bg-forest-black" : "h-1.5 w-full"} />
            {days.indexOf(day) % labelEvery === 0 ? (
              <span className="text-[10px] tabular-nums text-muted">{day.date.slice(8, 10)}/{day.date.slice(5, 7)}</span>
            ) : null}
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>Analisis dan ancaman per hari</caption>
        <thead>
          <tr><th>Tanggal</th><th>Analisis</th><th>Satwa</th><th>Ancaman</th></tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}><td>{day.date}</td><td>{day.analyzed}</td><td>{day.animals}</td><td>{day.threats}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Section({ title, empty, children }: { title: string; empty: boolean; children: ReactNode }) {
  return (
    <section className="min-w-0 break-inside-avoid">
      <h3 className="mb-3 text-base font-bold text-ink">{title}</h3>
      {empty ? <p className="text-sm text-muted">Tidak ada data pada periode ini.</p> : children}
    </section>
  );
}

function Table({ head, rows, numeric = [] }: { head: string[]; rows: ReactNode[][]; numeric?: number[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line-strong text-left text-xs text-muted">
            {head.map((cell, index) => (
              <th key={cell} scope="col" className={`py-2 pr-3 font-semibold ${numeric.includes(index) ? "text-right" : ""}`}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-line align-top">
              {row.map((cell, index) => (
                <td key={index} className={`py-2 pr-3 text-ink-soft ${numeric.includes(index) ? "text-right tabular-nums" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
