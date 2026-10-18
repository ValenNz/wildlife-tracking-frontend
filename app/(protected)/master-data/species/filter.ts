import type { FilterOption, FilterValues } from "@/components/ui/data-filters";
import type { TYPE_CONSERVATION_STATUS } from "@/types/wildlife/species.type";

export type SpeciesStatusFilter = "all" | TYPE_CONSERVATION_STATUS;

export type SpeciesFilterValues = FilterValues & {
  search: string;
  conservation_status: SpeciesStatusFilter;
};

export const DEFAULT_SPECIES_FILTERS: SpeciesFilterValues = {
  search: "",
  conservation_status: "all",
};

export const CONSERVATION_OPTIONS: FilterOption[] = [
  { label: "Semua status", value: "all" },
  { label: "Critically Endangered", value: "Critically Endangered" },
  { label: "Endangered", value: "Endangered" },
  { label: "Vulnerable", value: "Vulnerable" },
];