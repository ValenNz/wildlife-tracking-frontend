import type { TYPE_PUBLIC_SHIFT } from "@/types/tourism.type";

export const POS_TZ = "Asia/Jakarta";

export const LATE_SALE_MINUTES = 30;


export const wibDate = (date: Date = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: POS_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

export const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T12:00:00+07:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return wibDate(date);
};


export const isSellable = (shift: TYPE_PUBLIC_SHIFT, now: number = Date.now()): boolean =>
  shift.remaining > 0 && Date.parse(`${shift.shift_date}T${shift.start_time}:00+07:00`) + LATE_SALE_MINUTES * 60_000 > now;


export const quickCash = (total: number): number[] => {
  const options = new Set<number>([total]);
  for (const step of [50_000, 100_000]) options.add(Math.ceil(total / step) * step);
  for (const note of [100_000, 200_000, 500_000, 1_000_000, 2_000_000]) if (note > total) options.add(note);
  return [...options].filter((value) => value >= total).sort((a, b) => a - b).slice(0, 6);
};

export const PAPER_KEY = "pos-paper-width";
