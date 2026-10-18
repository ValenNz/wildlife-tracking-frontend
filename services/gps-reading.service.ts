import { api, unwrapData } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.type";
import type { GpsReading } from "@/types/gps-reading";

const BASE = "/api/wildlife";

const sortByRecordedAt = (readings: GpsReading[]): GpsReading[] =>
  [...readings].sort(
    (left, right) =>
      new Date(right.recorded_at).getTime() - new Date(left.recorded_at).getTime(),
  );

export const getGpsReadings = async (): Promise<GpsReading[]> => {
  const response = await api.get<ApiResponse<GpsReading[]>>(`${BASE}/gps-readings`);
  const payload = unwrapData(response);

  return sortByRecordedAt(Array.isArray(payload) ? (payload as GpsReading[]) : []);
};

export const getGpsReadingsByAnimal = async (
  animalId: number,
): Promise<GpsReading[]> => {
  const response = await api.get<ApiResponse<GpsReading[]>>(
    `${BASE}/gps-readings/${animalId}`,
  );
  const payload = unwrapData(response);

  return sortByRecordedAt(Array.isArray(payload) ? (payload as GpsReading[]) : []);
};

export const getGpsReadingsByDevice = async (
  deviceId: number,
): Promise<GpsReading[]> => {
  const readings = await getGpsReadings();

  return readings.filter((reading) => reading.device_id === deviceId);
};