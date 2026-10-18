import { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type { TYPE_SPECIES_SUMMARY } from "@/types/wildlife/species.type";

export type TYPE_ANIMAL_GENDER = "Jantan" | "Betina" | "Tidak Diketahui";

export type TYPE_ANIMAL = {
  animal_id: number;
  species_id: number;
  animal_code: string;
  birth_date: string | null;
  gender: TYPE_ANIMAL_GENDER;
  is_active: boolean;
  species_name?: string;
  species_scientific_name?: string;
  conservation_status?: string;
  created_at: string;
};

export type TYPE_ANIMAL_GET_ALL_RESPONSE = {
  items: TYPE_ANIMAL[];
  meta: TYPE_META_PAGGINATION;
};

export type TYPE_ANIMAL_DETAIL = {
  animal_id: number;
  species_id: number;
  animal_code: string;
  birth_date: string | null;
  gender: TYPE_ANIMAL_GENDER;
  is_active: boolean;
  species?: TYPE_SPECIES_SUMMARY | null;
  gps_reading_count: number;
  incident_report_count: number;
  created_at: string;
  updated_at: string;
};

export type TYPE_ANIMAL_GET_BY_ID_RESPONSE = {
  items: TYPE_ANIMAL_DETAIL[];
  meta: null;
};

export type TYPE_ANIMAL_CREATE_PAYLOAD = {
  species_id: number;
  animal_code: string;
  birth_date: string | null;
  gender: TYPE_ANIMAL_GENDER;
  is_active: boolean;
};

export type TYPE_ANIMAL_UPDATE_PAYLOAD = Partial<TYPE_ANIMAL_CREATE_PAYLOAD>;

export type TYPE_ANIMAL_LIST_PARAMS = {
  species_id?: number;
  is_active?: boolean;
  gender?: TYPE_ANIMAL_GENDER;
};