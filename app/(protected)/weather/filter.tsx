import type { FilterField, FilterValues } from "@/components/filter";

export type WeatherFilterValues = FilterValues & {
  start_date: string;
  end_date: string;
};

export const WEATHER_INITIAL_FILTERS: WeatherFilterValues = {
  start_date: "",
  end_date: "",
};

export const WEATHER_FILTER_FIELDS: FilterField[] = [
  { key: "start_date", kind: "date", label: "Dari Tanggal" },
  { key: "end_date", kind: "date", label: "Sampai Tanggal" },
];
