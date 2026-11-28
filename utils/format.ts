type DateValue = string | null | undefined;

const getValidDate = (value: DateValue) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getIntlLocale = () =>
  typeof document !== "undefined" && document.documentElement.lang === "en"
    ? "en-US"
    : "id-ID";

export const formatDate = (value: DateValue) => {
  if (!value) return "-";

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;

  const date = getValidDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat(getIntlLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatDateTime = (value: DateValue) => {
  const date = getValidDate(value);
  if (!date) return value ?? "-";

  return new Intl.DateTimeFormat(getIntlLocale(), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatDisplayValue = (
  value: number | string | null | undefined,
) => {
  if (value === null || value === undefined || value === "") return "—";

  return String(value);
};

export const formatGeoJson = (
  value: string | Record<string, unknown> | null | undefined,
) => {
  if (value === null || value === undefined) return "—";

  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value, null, 2);
};

export const formatRupiah = (value: number | string | null | undefined): string => {
  const raw = Number(value ?? 0);
  const amount = Number.isFinite(raw) ? raw : 0;
  return `${amount < 0 ? "−" : ""}Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.abs(amount))}`;
};

export const formatLongDate = (value: string | null | undefined): string => {
  if (!value) return "-";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(getIntlLocale(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
};

export const toLocalDateInput = (date: Date = new Date()): string => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};
