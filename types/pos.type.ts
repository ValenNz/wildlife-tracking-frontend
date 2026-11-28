import type { TYPE_BOOKING, TYPE_PARTICIPANT, TYPE_VISITOR_TYPE } from "@/types/tourism.type";

export type TYPE_POS_METHOD = "cash" | "qris" | "edc";

export type TYPE_POS_SUMMARY = {
  transactions: number;
  voided: number;
  visitors: { wni: number; wna: number; pelajar: number; drone: number; total: number };
  gross: number;
  pnbp: number;
  guide_fee: number;
  by_method: Partial<Record<string, number>>;
  by_channel: Partial<Record<"online" | "pos", { transactions: number; amount: number }>>;
};

export type TYPE_POS_SESSION = {
  session_id: number;
  cashier_id: number;
  counter_name: string;
  opened_at: string;
  opening_cash: number;
  closed_at: string | null;
  expected_cash: number | null;
  counted_cash: number | null;
  cash_difference: number | null;
  closing_note: string | null;
  is_open: boolean;
  expected_cash_now: number | null;
  summary: TYPE_POS_SUMMARY;
  cashier?: { user_id: number; full_name: string } | null;
  transactions_count?: number;
  sales?: TYPE_POS_SALE[];
};

export type TYPE_POS_SALE = TYPE_BOOKING & { qr_payload?: string | null };

export type TYPE_POS_SALE_PAYLOAD = {
  route_id: number;
  shift_id: number;
  wni_count: number;
  wna_count: number;
  student_count: number;
  drone_count: number;
  contact_name: string;
  contact_phone?: string;
  notes?: string;
  participants?: { full_name: string; visitor_type: TYPE_VISITOR_TYPE; age?: TYPE_PARTICIPANT["age"] }[];
  payment_method: TYPE_POS_METHOD;
  received_amount?: number | null;
  external_reference?: string;
  check_in_now?: boolean;
};

export type TYPE_POS_DAILY_REPORT = {
  date: string;
  timezone: string;
  summary: TYPE_POS_SUMMARY;
  sessions: TYPE_POS_SESSION[];
};

export const POS_METHOD_LABELS: Record<TYPE_POS_METHOD, string> = {
  cash: "Tunai",
  qris: "QRIS",
  edc: "Kartu (EDC)",
};
