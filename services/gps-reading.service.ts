import { api } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";
import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type { GpsReading, GpsReadingListParams } from "@/types/gps-reading";

const sortByRecordedAt = (readings: GpsReading[]): GpsReading[] =>
  [...readings].sort(
    (left, right) =>
      new Date(right.recorded_at).getTime() - new Date(left.recorded_at).getTime(),
  );

export const getGpsReadings = async (
  params?: Partial<QUERY_PARAMS_API_GET_ALL> & GpsReadingListParams,
): Promise<ApiResponse<GpsReading[]>> => {
  const response = await api.get<GpsReading[]>(
    `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.GPS_READINGS.GET_ALL(params)}`,
  );

  const readings = Array.isArray(response) ? (response as GpsReading[]) : [];

  return {
    success: true,
    message: "OK",
    data: sortByRecordedAt(readings),
  };
};

export const getGpsReadingsByAnimal = async (
  animalId: number,
): Promise<ApiResponse<GpsReading[]>> => {
  const response = await api.get<GpsReading[]>(
    `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.GPS_READINGS.GET_BY_ANIMAL(animalId)}`,
  );

  const readings = Array.isArray(response) ? (response as GpsReading[]) : [];

  return {
    success: true,
    message: "OK",
    data: sortByRecordedAt(readings),
  };
};

export const getGpsReadingsByDevice = async (
  deviceId: number,
): Promise<ApiResponse<GpsReading[]>> => {
  const response = await getGpsReadings({ deviceId });
  return response;
};