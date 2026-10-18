import type { FilterOption, FilterValues } from "@/components/ui/data-filters";

export type AnimalStatusFilter = "all" | "active" | "inactive";

export type AnimalFilterValues = FilterValues & {
  search: string;
  species_id: string;
  status: AnimalStatusFilter;
};

export const DEFAULT_ANIMAL_FILTERS: AnimalFilterValues = {
  search: "",
  species_id: "all",
  status: "all",
};

export const STATUS_OPTIONS: FilterOption[] = [
  { label: "Semua status", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Tidak Aktif", value: "inactive" },
];

export const toSpeciesId = (value: string): number | undefined => {
  if (value === "all" || value === "") return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

export const toOnlyActive = (status: AnimalStatusFilter): boolean | undefined =>
  status === "all" ? undefined : status === "active";