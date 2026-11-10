
import { getDummyGpsReadings } from "@/constant/gps-readings/dummy-gps-readings";
import type {
  GpsReading,
  GpsReadingListParams,
} from "@/types/gps-reading";
import type { ApiResponse } from "@/types/api.type";

const filterReadings = (
  readings: GpsReading[],
  params?: GpsReadingListParams,
): GpsReading[] => {
  let result = [...readings];

  if (params?.animalId !== undefined) {
    result = result.filter(
      (reading) =>
        reading.trackingDevice?.animal?.animal_id === params.animalId,
    );
  }

  if (params?.deviceId !== undefined) {
    result = result.filter(
      (reading) => reading.device_id === params.deviceId,
    );
  }

  result.sort(
    (a, b) =>
      new Date(b.recorded_at).getTime() -
      new Date(a.recorded_at).getTime(),
  );

  if (params?.limit !== undefined) {
    result = result.slice(0, Math.max(0, params.limit));
  }

  return result;
};

export const GPS_READING_MOCK_SERVICE = {
  GET_ALL: async (
    params?: GpsReadingListParams,
  ): Promise<ApiResponse<GpsReading[]>> => ({
    success: true,
    message: "OK - Data simulasi GPS",
    data: filterReadings(getDummyGpsReadings(), params),
  }),

  GET_BY_ANIMAL: async (
    animalId: number,
  ): Promise<ApiResponse<GpsReading[]>> => ({
    success: true,
    message: "OK - Data simulasi GPS",
    data: filterReadings(getDummyGpsReadings(), { animalId }),
  }),

  GET_BY_DEVICE: async (
    deviceId: number,
  ): Promise<ApiResponse<GpsReading[]>> => ({
    success: true,
    message: "OK - Data simulasi GPS",
    data: filterReadings(getDummyGpsReadings(), { deviceId }),
  }),
};
