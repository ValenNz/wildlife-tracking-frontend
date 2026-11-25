import type { FilterField, FilterValues } from "@/components/filter";
import { BOOKING_STATUS_LABELS } from "@/types/tourism.type";

export type AdminBookingFilterValues = FilterValues & { status: string; visit_date: string; search: string };

export const ADMIN_BOOKING_INITIAL_FILTERS: AdminBookingFilterValues = { status: "all", visit_date: "", search: "" };

export const ADMIN_BOOKING_FILTER_FIELDS: FilterField[] = [
  { key: "search", kind: "search", label: "Cari", placeholder: "Kode atau nama kontak" },
  {
    key: "status",
    kind: "select",
    label: "Status",
    options: [
      { label: "Semua Status", value: "all" },
      ...Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => ({ label, value })),
    ],
  },
  { key: "visit_date", kind: "date", label: "Tanggal Kunjungan" },
];
