import QRCode from "qrcode";

import { POS_METHOD_LABELS, type TYPE_POS_SALE, type TYPE_POS_SESSION, type TYPE_POS_SUMMARY } from "@/types/pos.type";
import { PAYMENT_METHOD_LABELS, SHIFT_LABELS, VISITOR_TYPE_LABELS } from "@/types/tourism.type";


const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const rp = (value: number | null | undefined) => {
  const amount = Number(value ?? 0);
  return `${amount < 0 ? "−" : ""}Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.abs(amount))}`;
};

const TZ = "Asia/Jakarta";
const dateTime = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("id-ID", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
    : "-";
const longDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value.slice(0, 10)}T00:00:00`));

export type PaperWidth = "58mm" | "80mm";

const style = (paper: PaperWidth) => `
  @page { size: ${paper} auto; margin: 3mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 11px/1.35 ui-monospace, "Courier New", monospace; color: #000; background: #fff; }
  .r { width: calc(${paper} - 6mm); margin: 0 auto; padding: 4px 0; }
  .c { text-align: center; } .b { font-weight: 700; } .s { font-size: 10px; } .xl { font-size: 15px; }
  .hr { border-top: 1px dashed #000; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; gap: 6px; } .row > span:last-child { text-align: right; white-space: nowrap; }
  .qr { display: block; margin: 6px auto; width: 70%; max-width: 46mm; image-rendering: pixelated; }
  .void { border: 2px solid #000; padding: 4px; margin: 6px 0; text-align: center; font-size: 16px; font-weight: 700; letter-spacing: 4px; }
  ul { margin: 2px 0; padding-left: 14px; }
`;

const wrap = (paper: PaperWidth, title: string, body: string) =>
  `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${style(paper)}</style></head><body><div class="r">${body}</div></body></html>`;

const header = (counter: string | undefined, subtitle: string) => `
  <div class="c b">BALAI BESAR TAMAN NASIONAL<br>GUNUNG LEUSER</div>
  <div class="c s">${esc(counter ?? "Loket Wisata")}</div>
  <div class="c b" style="margin-top:4px">${esc(subtitle)}</div>
  <div class="hr"></div>`;

export async function buildSaleReceiptHtml(sale: TYPE_POS_SALE, paper: PaperWidth = "80mm"): Promise<string> {
  const payment = [...(sale.payments ?? [])].sort((a, b) => b.payment_id - a.payment_id)[0];
  const voided = sale.status === "cancelled";
  const qr = sale.qr_payload && !voided ? await QRCode.toDataURL(sale.qr_payload, { width: 320, margin: 1, errorCorrectionLevel: "M" }) : null;
  const pnbp = sale.price_lines.filter((line) => line.code !== "guide_fee").reduce((sum, line) => sum + line.subtotal, 0);

  const lines = sale.price_lines
    .map(
      (line) => `<div>${esc(line.label)}</div>
      <div class="row s"><span>${line.quantity} x ${rp(line.unit_price)}${line.days > 1 ? ` x ${line.days} hr` : ""}</span><span>${rp(line.subtotal)}</span></div>`,
    )
    .join("");

  const participants = (sale.participants ?? [])
    .map((participant) => `<li>${esc(participant.full_name)} (${esc(VISITOR_TYPE_LABELS[participant.visitor_type])})</li>`)
    .join("");

  const body = `
    ${header(sale.pos_session?.counter_name, "STRUK & TIKET MASUK")}
    ${voided ? '<div class="void">VOID</div>' : ""}
    <div class="row"><span>No.</span><span class="b">${esc(sale.booking_code)}</span></div>
    <div class="row s"><span>Waktu</span><span>${dateTime(payment?.paid_at ?? sale.created_at)} WIB</span></div>
    <div class="row s"><span>Kasir</span><span>${esc(sale.seller?.full_name ?? "-")}</span></div>
    <div class="hr"></div>
    <div class="b">${esc(sale.route?.name ?? "Tur")}</div>
    <div class="s">${esc(longDate(sale.visit_date))}</div>
    <div class="s">${sale.shift ? `${esc(SHIFT_LABELS[sale.shift.shift_type])} ${esc(String(sale.shift.start_time).slice(0, 5))} WIB` : ""}${sale.shift?.guide?.display_name ? ` · Pemandu ${esc(sale.shift.guide.display_name)}` : ""}</div>
    ${sale.route?.meeting_point ? `<div class="s">Kumpul: ${esc(sale.route.meeting_point)}</div>` : ""}
    <div class="hr"></div>
    ${lines}
    <div class="hr"></div>
    <div class="row b xl"><span>TOTAL</span><span>${rp(sale.total_amount)}</span></div>
    <div class="row"><span>${esc(payment ? (PAYMENT_METHOD_LABELS[payment.method] ?? payment.method) : "-")}</span><span>${rp(payment?.received_amount ?? sale.total_amount)}</span></div>
    ${payment?.change_amount ? `<div class="row b"><span>Kembali</span><span>${rp(payment.change_amount)}</span></div>` : ""}
    ${payment?.external_reference ? `<div class="row s"><span>Ref.</span><span>${esc(payment.external_reference)}</span></div>` : ""}
    <div class="s" style="margin-top:4px">Termasuk PNBP ${rp(pnbp)} (PP 36/2024), disetor ke kas negara.</div>
    <div class="hr"></div>
    <div class="s b">Peserta (${sale.participant_count}):</div>
    <ul class="s">${participants}</ul>
    ${qr ? `<img class="qr" src="${qr}" alt="QR tiket"><div class="c s">Tunjukkan QR ini ke petugas.<br>Berlaku 1x pada tanggal kunjungan.</div>` : ""}
    ${sale.status === "checked_in" ? '<div class="c b">SUDAH CHECK-IN</div>' : ""}
    <div class="hr"></div>
    <div class="c s">Jaga jarak min. 10 m dari satwa · Dilarang memberi makan satwa · Bawa pulang sampahmu</div>
    <div class="c s" style="margin-top:4px">Terima kasih telah menjaga Leuser.</div>`;

  return wrap(paper, `Struk ${sale.booking_code}`, body);
}

const summaryBlock = (summary: TYPE_POS_SUMMARY) => `
  <div class="row"><span>Transaksi sah</span><span>${summary.transactions}</span></div>
  <div class="row"><span>Void</span><span>${summary.voided}</span></div>
  <div class="row"><span>Pengunjung</span><span>${summary.visitors.total}</span></div>
  <div class="row s"><span>&nbsp;WNI / Pelajar / WNA</span><span>${summary.visitors.wni} / ${summary.visitors.pelajar} / ${summary.visitors.wna}</span></div>
  <div class="row s"><span>&nbsp;Drone</span><span>${summary.visitors.drone}</span></div>
  <div class="hr"></div>
  ${Object.entries(summary.by_method)
    .map(([method, amount]) => `<div class="row"><span>${esc(POS_METHOD_LABELS[method as keyof typeof POS_METHOD_LABELS] ?? PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] ?? method)}</span><span>${rp(amount)}</span></div>`)
    .join("")}
  <div class="row b"><span>Total</span><span>${rp(summary.gross)}</span></div>
  <div class="row s"><span>&nbsp;PNBP (setor kas negara)</span><span>${rp(summary.pnbp)}</span></div>
  <div class="row s"><span>&nbsp;Jasa pemandu</span><span>${rp(summary.guide_fee)}</span></div>`;


export function buildSessionReportHtml(session: TYPE_POS_SESSION, paper: PaperWidth = "80mm"): string {
  const closed = !session.is_open;
  const body = `
    ${header(session.counter_name, closed ? "LAPORAN TUTUP KAS (Z)" : "LAPORAN SEMENTARA (X)")}
    <div class="row s"><span>Sesi</span><span>#${session.session_id}</span></div>
    <div class="row s"><span>Kasir</span><span>${esc(session.cashier?.full_name ?? "-")}</span></div>
    <div class="row s"><span>Buka</span><span>${dateTime(session.opened_at)}</span></div>
    <div class="row s"><span>Tutup</span><span>${closed ? dateTime(session.closed_at) : "-"}</span></div>
    <div class="hr"></div>
    ${summaryBlock(session.summary)}
    <div class="hr"></div>
    <div class="row"><span>Modal awal</span><span>${rp(session.opening_cash)}</span></div>
    <div class="row"><span>Kas seharusnya</span><span>${rp(closed ? session.expected_cash : session.expected_cash_now)}</span></div>
    ${closed ? `<div class="row"><span>Kas dihitung</span><span>${rp(session.counted_cash)}</span></div>
    <div class="row b"><span>Selisih</span><span>${(session.cash_difference ?? 0) > 0 ? "+" : ""}${rp(session.cash_difference)}</span></div>` : ""}
    ${session.closing_note ? `<div class="s">Catatan: ${esc(session.closing_note)}</div>` : ""}
    <div class="hr"></div>
    <div class="s" style="margin-top:18px">Kasir: ____________ &nbsp; Supervisor: ____________</div>
    <div class="c s" style="margin-top:6px">Dicetak ${dateTime(new Date().toISOString())} WIB</div>`;

  return wrap(paper, `Sesi kas #${session.session_id}`, body);
}
