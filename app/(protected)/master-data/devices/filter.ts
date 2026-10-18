import type { FilterOption, FilterValues } from "@/components/ui/data-filters";
import type { DeviceCondition } from "@/types/tracking-device";

export type DeviceConditionFilter = "all" | "normal" | "damaged" | "lost";

export type DeviceFilterValues = FilterValues & {
  search: string;
  device_condition: DeviceConditionFilter;
  only_active: string;
};

export const DEFAULT_DEVICE_FILTERS: DeviceFilterValues = {
  search: "",
  device_condition: "all",
  only_active: "all",
};

export const CONDITION_OPTIONS: FilterOption[] = [
  { label: "Semua kondisi", value: "all" },
  { label: "Normal", value: "normal" },
  { label: "Rusak", value: "damaged" },
  { label: "Hilang", value: "lost" },
];

export const ACTIVE_OPTIONS: FilterOption[] = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "true" },
  { label: "Tidak Aktif", value: "false" },
];

export const toDeviceCondition = (
  value: string,
): DeviceCondition | undefined =>
  value === "all" || value === "" ? undefined : (value as DeviceCondition);

export const toOnlyActiveDevice = (value: string): boolean | undefined => {
  if (value === "all" || value === "") return undefined;

  return value === "true";
};