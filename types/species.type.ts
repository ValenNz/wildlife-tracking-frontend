import { TYPE_META_PAGGINATION } from "@/types/meta.type";

export type TYPE_CONSERVATION_STATUS =
  | "Critically Endangered"
  | "Endangered"
  | "Vulnerable";

export type TYPE_SPECIES = {
  species_id: number;
  common_name: string;
  scientific_name: string;
  conservation_status: TYPE_CONSERVATION_STATUS;
  animal_count?: number;
  created_at: string;
  updated_at: string;
};

export type TYPE_SPECIES_PAYLOAD = {
  common_name: string;
  scientific_name: string;
  conservation_status: TYPE_CONSERVATION_STATUS;
};

export type TYPE_SPECIES_GET_ALL_RESPONSE = {
  items: TYPE_SPECIES[];
  meta: TYPE_META_PAGGINATION;
};

export type TYPE_SPECIES_GET_BY_ID_RESPONSE = {
  items: TYPE_SPECIES | null;
  meta: null;
};

export const TYPE_CONSERVATION_STATUS_LABELS: Record<
  TYPE_CONSERVATION_STATUS,
  string
> = {
  "Critically Endangered": "Kritis (Critically Endangered)",
  Endangered: "Terancam (Endangered)",
  Vulnerable: "Rentan (Vulnerable)",
};

export const TYPE_CONSERVATION_STATUSES: TYPE_CONSERVATION_STATUS[] = [
  "Critically Endangered",
  "Endangered",
  "Vulnerable",
];