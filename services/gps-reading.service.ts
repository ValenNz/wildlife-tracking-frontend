
import { USE_MOCK_DATA } from "@/services/data-source";
import { GPS_READING_MOCK_SERVICE } from "@/services/gps-reading-mock.service";
import { api, unwrapData } from "@/services/api-client";
import { API_ENDPOINT, WILDLIFE_BASE_PATH } from "@/services/endpoint";

import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type {
  GpsReading,
  GpsReadingListParams,
} from "@/types/gps-reading";

const sortByRecordedAt = (readings: GpsReading[]): GpsReading[] =>
  [...readings].sort(
    (left, right) =>
      new Date(right.recorded_at).getTime() -
      new Date(left.recorded_at).getTime(),
  );

export const getGpsReadings = async (
  params?: Partial<QUERY_PARAMS_API_GET_ALL> & GpsReadingListParams,
): Promise<ApiResponse<GpsReading[]>> => {
  if (USE_MOCK_DATA) {
    return GPS_READING_MOCK_SERVICE.GET_ALL(params);
  }

  const response = await api.get<ApiResponse<GpsReading[]>>(
    `${WILDLIFE_BASE_PATH}${API_ENDPOINT.WILDLIFE.GPS_READINGS.GET_ALL(params)}`,
  );

  const readings = unwrapData(response);

  return {
    success: true,
    message: "OK",
    data: sortByRecordedAt(readings),
  };
};

export const getGpsReadingsByAnimal = async (
  animalId: number,
): Promise<ApiResponse<GpsReading[]>> => {
  if (USE_MOCK_DATA) {
    return GPS_READING_MOCK_SERVICE.GET_BY_ANIMAL(animalId);
  }

  // Ambil seluruh pembacaan GPS dari backend
  const response = await getGpsReadings();

  // Filter berdasarkan ID satwa melalui relasi device
  const readings = response.data.filter(
    (reading) =>
      Number(reading.device?.animal?.animal_id) === Number(animalId),
  );

  return {
    success: true,
    message: "OK",
    data: sortByRecordedAt(readings),
  };
};

export const getGpsReadingsByDevice = async (
  deviceId: number,
): Promise<ApiResponse<GpsReading[]>> => {
  if (USE_MOCK_DATA) {
    return GPS_READING_MOCK_SERVICE.GET_BY_DEVICE(deviceId);
  }

  const response = await getGpsReadings();

  const readings = response.data.filter(
    (reading) => Number(reading.device_id) === Number(deviceId),
  );

  return {
    success: true,
    message: "OK",
    data: sortByRecordedAt(readings),
  };
};
