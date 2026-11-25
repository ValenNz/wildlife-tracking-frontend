import type { FilterField, FilterValues } from "@/components/filter";

export type MediaFilterValues = FilterValues & {
  media_type: string;
  start_date: string;
  end_date: string;
};

export const MEDIA_INITIAL_FILTERS: MediaFilterValues = {
  media_type: "all",
  start_date: "",
  end_date: "",
};

export const MEDIA_FILTER_FIELDS: FilterField[] = [
  {
    key: "media_type",
    kind: "select",
    label: "Jenis Media",
    options: [
      { label: "Semua Jenis", value: "all" },
      { label: "Foto", value: "image" },
      { label: "Video", value: "video" },
      { label: "Audio", value: "audio" },
    ],
  },
  { key: "start_date", kind: "date", label: "Dari Tanggal" },
  { key: "end_date", kind: "date", label: "Sampai Tanggal" },
];
