import type { TYPE_META_PAGGINATION } from "@/types/meta.type";

export type TYPE_ZONE_VISIT = {
  visit_id: number;
  animal_id: number;
  zone_id: number;
  entry_reading_id: number | null;
  entered_at: string;
  exited_at: string | null;
  is_inside: boolean;
  animal?: {
    animal_id: number;
    name_animal: string;
    species?: { species_id: number; common_name: string } | null;
  } | null;
  zone?: { zone_id: number; zone_name: string; zone_type: string } | null;
};

export type TYPE_ZONE_VISIT_PAYLOAD = {
  animal_id: number;
  zone_id: number;
  entered_at: string;
  entry_reading_id?: number | null;
};

export type TYPE_ZONE_VISIT_PARAMS = {
  animal_id?: number;
  zone_id?: number;
  active?: 0 | 1;
  start_date?: string;
  end_date?: string;
};

export type TYPE_ZONE_VISIT_GET_ALL_RESPONSE = {
  items: TYPE_ZONE_VISIT[];
  meta: TYPE_META_PAGGINATION;
};
