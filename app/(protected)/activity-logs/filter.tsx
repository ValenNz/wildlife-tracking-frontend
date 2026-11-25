import type { FilterField, FilterValues } from "@/components/filter";

export type ActivityLogFilterValues = FilterValues & {
  action: string;
  start_date: string;
  end_date: string;
};

export const ACTIVITY_LOG_INITIAL_FILTERS: ActivityLogFilterValues = {
  action: "",
  start_date: "",
  end_date: "",
};

export const ACTIVITY_LOG_FILTER_FIELDS: FilterField[] = [
  {
    key: "action",
    kind: "search",
    label: "Aksi",
    placeholder: "Contoh: LOGIN, POST /api/incidents...",
  },
  { key: "start_date", kind: "date", label: "Dari Tanggal" },
  { key: "end_date", kind: "date", label: "Sampai Tanggal" },
];
