import type { FilterField, FilterValues } from "@/components/filter";
import type { GeoZone } from "@/types/geo-zone.type";

export type ZoneVisitFilterValues = FilterValues & {
  zone_id: string;
  active: string;
  start_date: string;
};

export const ZONE_VISIT_INITIAL_FILTERS: ZoneVisitFilterValues = {
  zone_id: "all",
  active: "all",
  start_date: "",
};

export const getZoneVisitFilterFields = (zones: GeoZone[]): FilterField[] => [
  {
    key: "zone_id",
    kind: "select",
    label: "Zona",
    options: [
      { label: "Semua Zona", value: "all" },
      ...zones.map((zone) => ({ label: zone.zone_name, value: String(zone.zone_id) })),
    ],
  },
  {
    key: "active",
    kind: "select",
    label: "Status",
    options: [
      { label: "Semua Status", value: "all" },
      { label: "Masih di dalam zona", value: "1" },
      { label: "Sudah keluar", value: "0" },
    ],
  },
  { key: "start_date", kind: "date", label: "Masuk Sejak" },
];
