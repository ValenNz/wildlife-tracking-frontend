import { api, unwrapData } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.type";
import type { GeoZone, GeoZoneListParams } from "@/types/geo-zone";

const BASE = "/api/wildlife";

const filterZones = (zones: GeoZone[], params?: GeoZoneListParams): GeoZone[] => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  return zones.filter((zone) => {
    const matchesSearch =
      search.length === 0 || zone.zone_name.toLowerCase().includes(search);

    const matchesType =
      params?.zoneType === undefined || zone.zone_type === params.zoneType;

    return matchesSearch && matchesType;
  });
};

export const getGeoZones = async (params?: GeoZoneListParams): Promise<GeoZone[]> => {
  const response = await api.get<ApiResponse<GeoZone[]>>(`${BASE}/geo-zones`);
  const payload = unwrapData(response);
  const zones = Array.isArray(payload) ? (payload as GeoZone[]) : [];

  return filterZones(zones, params).sort(
    (left, right) => left.zone_id - right.zone_id,
  );
};

export const getRiskZones = async (): Promise<GeoZone[]> => {
  const zones = await getGeoZones();

  return zones.filter((zone) => zone.zone_type !== "corridor");
};