import type { FilterField, FilterValues } from "@/components/filter";

export type ThreatFilterValues = FilterValues & {
  min_level: string;
  analysis_type: string;
  start_date: string;
};

export const THREAT_INITIAL_FILTERS: ThreatFilterValues = {
  min_level: "medium",
  analysis_type: "all",
  start_date: "",
};

export const THREAT_FILTER_FIELDS: FilterField[] = [
  {
    key: "min_level",
    kind: "select",
    label: "Tingkat Minimum",
    options: [
      { label: "Rendah ke atas", value: "low" },
      { label: "Sedang ke atas", value: "medium" },
      { label: "Tinggi ke atas", value: "high" },
      { label: "Kritis saja", value: "critical" },
    ],
  },
  {
    key: "analysis_type",
    kind: "select",
    label: "Sumber",
    options: [
      { label: "Foto, Video, dan Audio", value: "all" },
      { label: "Foto & Video", value: "image" },
      { label: "Audio", value: "audio" },
    ],
  },
  { key: "start_date", kind: "date", label: "Sejak Tanggal" },
];
