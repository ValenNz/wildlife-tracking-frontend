
import type { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type { TYPE_SPECIES } from "@/types/species.type";

export type TYPE_ANIMAL_GENDER =
  | "Jantan"
  | "Betina"
  | "Tidak Diketahui";

export type TYPE_TRACKING_DEVICE = {
  device_id: number;
  animal_id: number;
  model: string;
  installation_date: string | null;
  battery_life_months: number;
  is_active: boolean;
  device_condition: string;
  battery_level: number;
  signal_strength: number;
  last_recorded_at: string | null;
};

export type TYPE_ANIMAL = {
  animal_id: number;
  species_id: number;
  animal_code: string;
  birth_date: string | null;
  gender: TYPE_ANIMAL_GENDER;
  is_active: boolean;
  species?: TYPE_SPECIES | null;
  tracking_device?: TYPE_TRACKING_DEVICE | null;
  created_at: string;
  updated_at: string;
};

export type TYPE_ANIMAL_PAYLOAD = {
  species_id: number;
  animal_code: string;
  birth_date: string | null;
  gender: TYPE_ANIMAL_GENDER;
  is_active: boolean;
};

export type TYPE_ANIMAL_GET_ALL_RESPONSE = {
  items: TYPE_ANIMAL[];
  meta: TYPE_META_PAGGINATION;
};

export type TYPE_ANIMAL_GET_BY_ID_RESPONSE = {
  items: TYPE_ANIMAL | null;
  meta: null;
};

export const TYPE_ANIMAL_GENDER_LABELS: Record<
  TYPE_ANIMAL_GENDER,
  string
> = {
  Jantan: "Jantan",
  Betina: "Betina",
  "Tidak Diketahui": "Tidak Diketahui",
};

export const TYPE_ANIMAL_GENDER_GLYPHS: Record<
  TYPE_ANIMAL_GENDER,
  string
> = {
  Jantan: "♂",
  Betina: "♀",
  "Tidak Diketahui": "?",
};
