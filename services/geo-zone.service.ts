
import { api, unwrapData } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type {
  GeoZone,
  GeoZoneListParams,
} from "@/types/geo-zone";

const filterZones = (
  zones: GeoZone[],
  params?: GeoZoneListParams,
): GeoZone[] => {
  const search = params?.search?.trim().toLowerCase() ?? "";

  return zones.filter((zone) => {
    const matchesSearch =
      search.length === 0 ||
      zone.zone_name.toLowerCase().includes(search);

    const matchesType =
      params?.zoneType === undefined ||
      zone.zone_type === params.zoneType;

    return matchesSearch && matchesType;
  });
};

export const getGeoZones = async (
  params?: GeoZoneListParams,
): Promise<GeoZone[]> => {
  const response = await api.get<ApiResponse<GeoZone[]>>(
    `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.GEO_ZONES.GET_ALL()}`,
  );

  const payload = unwrapData(response);

  const zones = Array.isArray(payload)
    ? payload
    : [];

  return filterZones(zones, params).sort(
    (left, right) => left.zone_id - right.zone_id,
  );
};

export const getGeoZoneById = async (
  id: number,
): Promise<GeoZone | null> => {
  const response = await api.get<ApiResponse<GeoZone>>(
    `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.GEO_ZONES.GET_BY_ID(id)}`,
  );

  const payload = unwrapData(response);

  return payload ?? null;
};

export const getRiskZones = async (): Promise<GeoZone[]> => {
  const zones = await getGeoZones();

  return zones.filter(
    (zone) => zone.zone_type !== "koridor_ekologis"
  );
};
