import { api, unwrapData } from "@/services/api";

import type { ApiResponse } from "@/types/api.type";
import type {
  GeoZoneAnimal,
  GeoZoneDevice,
  GeoZone,
  GeoZoneCreatePayload,
  GeoZoneListParams,
  GeoZoneUpdatePayload,
} from "@/types/geo-zone.type";

const toApiParams = (params?: GeoZoneListParams) => ({
  search: params?.search,
  zone_type: params?.zone_type ?? params?.zoneType,
  sort_by: params?.sort_by,
  sort_dir: params?.sort_dir,
  page: params?.page,
  per_page: params?.per_page,
});

export const getGeoZones = async (
  params?: GeoZoneListParams,
): Promise<GeoZone[]> => {
  const response = await api.get<ApiResponse<GeoZone[]>>("/geo-zones", {
    params: toApiParams(params),
  });

  const payload = unwrapData(response);
  return Array.isArray(payload) ? payload : [];
};

export const getGeoZoneById = async (
  id: number,
): Promise<GeoZone | null> => {
  const response = await api.get<ApiResponse<GeoZone>>(
    `/geo-zones/${id}`,
  );

  return unwrapData(response) ?? null;
};

export const getGeoZoneAnimals = async (
  id: number,
  history = false,
): Promise<GeoZoneAnimal[]> => {
  const response = await api.get<ApiResponse<GeoZoneAnimal[]>>(
    `/geo-zones/${id}/animals`,
    { params: history ? { history: 1 } : undefined },
  );

  return unwrapData(response) ?? [];
};

export const getGeoZoneVisits = async (
  id: number,
): Promise<unknown[]> => {
  const response = await api.get<ApiResponse<unknown[]>>(
    `/geo-zones/${id}/visits`,
  );

  return unwrapData(response) ?? [];
};

export const getGeoZoneDevices = async (
  id: number,
): Promise<GeoZoneDevice[]> => {
  const response = await api.get<ApiResponse<GeoZoneDevice[]>>(
    `/geo-zones/${id}/devices`,
  );

  return unwrapData(response) ?? [];
};

export const locateGeoZones = async (
  lat: number,
  lon: number,
): Promise<GeoZone[]> => {
  const response = await api.get<ApiResponse<GeoZone[]>>(
    "/geo-zones/locate",
    { params: { lat, lon } },
  );

  return unwrapData(response) ?? [];
};

export const createGeoZone = async (
  payload: GeoZoneCreatePayload,
): Promise<GeoZone> => {
  const response = await api.post<ApiResponse<GeoZone>>("/geo-zones", {
    body: payload,
  });

  return unwrapData(response);
};

export const updateGeoZone = async (
  id: number,
  payload: GeoZoneUpdatePayload,
): Promise<GeoZone> => {
  const response = await api.put<ApiResponse<GeoZone>>(
    `/geo-zones/${id}`,
    { body: payload },
  );

  return unwrapData(response);
};

export const deleteGeoZone = async (id: number): Promise<void> => {
  await api.delete<ApiResponse<null>>(`/geo-zones/${id}`);
};
