export type GeoZoneType =
  | "permukiman"
  | "perkebunan"
  | "jalan_raya"
  | "koridor_ekologis"
  | "hutan_lindung"
  | "zona_inti";

export type GeoZonePolygon = Record<string, unknown>;

export type GeoZone = {
  zone_id: number;
  zone_name: string;
  zone_type: string;
  center_lat: number | string | null;
  center_lon: number | string | null;
  radius_km: number | string | null;
  polygon_geojson: GeoZonePolygon | null;
  created_by: number | null;
  active_visits_count?: number;
  creator?: {
    user_id: number;
    username?: string;
    full_name?: string;
  } | null;
  devices?: unknown[];
  created_at: string | null;
  updated_at?: string | null;
};

export type GeoZoneListParams = {
  zone_type?: GeoZoneType | string;
  zoneType?: GeoZoneType | string;
  search?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
};

export type GeoZoneCreatePayload = {
  zone_name: string;
  zone_type: string;
  center_lat?: number | null;
  center_lon?: number | null;
  radius_km?: number | null;
  polygon_geojson?: string | GeoZonePolygon | null;
};

export type GeoZoneUpdatePayload = Partial<GeoZoneCreatePayload>;

export const GEO_ZONE_TYPES: GeoZoneType[] = [
  "permukiman",
  "perkebunan",
  "jalan_raya",
  "koridor_ekologis",
  "hutan_lindung",
  "zona_inti",
];

export const GEO_ZONE_TYPE_LABELS: Record<GeoZoneType, string> = {
  permukiman: "Permukiman",
  perkebunan: "Perkebunan",
  jalan_raya: "Jalan Raya",
  koridor_ekologis: "Koridor Ekologis",
  hutan_lindung: "Hutan Lindung",
  zona_inti: "Zona Inti",
};

/** Satwa yang sedang (atau pernah) berada di zona: GET /geo-zones/{id}/animals. */
export type GeoZoneAnimal = {
  animal_id: number;
  name_animal: string;
  species?: { species_id: number; common_name: string } | null;
};

/** Perangkat yang dipasang di zona: GET /geo-zones/{id}/devices. */
export type GeoZoneDevice = {
  device_id: number;
  device_type: string;
  model: string;
  animal?: { animal_id: number; name_animal: string } | null;
};
