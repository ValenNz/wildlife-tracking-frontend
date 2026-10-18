export type GeoZoneType = "settlement" | "road" | "plantation" | "corridor";

export type GeoZone = {
  zone_id: number;
  zone_name: string;
  zone_type: string;
  center_lat: number | string | null;
  center_lon: number | string | null;
  radius_km: number | string | null;
  polygon_geojson: string | Record<string, unknown> | null;
  created_by: number | null;
  created_at: string | null;
};

export type GeoZoneListParams = {
  zoneType?: string;
  search?: string;
};