import { TYPE_META_PAGGINATION } from "@/types/meta.type";

export type TYPE_CONSERVATION_STATUS =
  | "Critically Endangered"
  | "Endangered"
  | "Vulnerable";

export type TYPE_SPECIES_SUMMARY = {
  species_id: number;
  common_name: string;
  scientific_name: string;
  conservation_status: TYPE_CONSERVATION_STATUS;
};

export type TYPE_SPECIES = {
  species_id: number;
  common_name: string;
  scientific_name: string;
  conservation_status: TYPE_CONSERVATION_STATUS;
  animal_count?: number;
  created_at: string;
};

export type TYPE_SPECIES_GET_ALL_RESPONSE = {
  items: TYPE_SPECIES[];
  meta: TYPE_META_PAGGINATION;
};

export type TYPE_SPECIES_DETAIL = {
  species_id: number;
  common_name: string;
  scientific_name: string;
  conservation_status: TYPE_CONSERVATION_STATUS;
  animal_count: number;
  recent_animals: TYPE_SPECIES_SUMMARY[];
  created_at: string;
  updated_at: string;
};

export type TYPE_SPECIES_GET_BY_ID_RESPONSE = {
  items: TYPE_SPECIES_DETAIL[];
  meta: null;
};

export type TYPE_SPECIES_CREATE_PAYLOAD = {
  common_name: string;
  scientific_name: string;
  conservation_status: TYPE_CONSERVATION_STATUS;
};

export type TYPE_SPECIES_UPDATE_PAYLOAD = Partial<TYPE_SPECIES_CREATE_PAYLOAD>;

export type TYPE_SPECIES_LIST_PARAMS = {
  conservation_status?: TYPE_CONSERVATION_STATUS;
};