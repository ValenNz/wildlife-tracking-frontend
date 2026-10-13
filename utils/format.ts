type DateValue = string | null | undefined;
type NumberValue = number | null | undefined;
type CodeValue = string | number | null | undefined;

const getValidDate = (value: DateValue) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatCurrency = (value: NumberValue) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value ?? 0);

export const formatNumber = (value: NumberValue) =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const formatCoaAccount = (...codes: CodeValue[]) =>
  codes
    .filter((code) => code !== null && code !== undefined && code !== "")
    .join("");

export const formatDate = (value: DateValue) => {
  if (!value) return "-";

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;

  const date = getValidDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatShortDate = (value: DateValue) => {
  if (!value) return "-";

  const date = getValidDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatAmountInput = (value: NumberValue) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num) || num === 0) return "";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};


export const parseAmountInput = (value: string | number | null | undefined) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;

  const cleaned = String(value).replace(/[^\d,]/g, "");
  if (!cleaned) return 0;

  const [intPart, decPart] = cleaned.split(",");
  const normalized =
    decPart !== undefined
      ? `${intPart || "0"}.${decPart.slice(0, 2)}`
      : intPart;

  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};