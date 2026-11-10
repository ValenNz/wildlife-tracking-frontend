
"use client";

import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import {
  getGpsReadings,
  getGpsReadingsByAnimal,
  getGpsReadingsByDevice,
} from "@/services/gps-reading.service";

import type {
  GpsReading,
  GpsReadingListParams,
} from "@/types/gps-reading";

import type { ApiResponse } from "@/types/api.type";

type GpsReadingApiResponse = ApiResponse<GpsReading[]>;

export const useGpsReadings = (params?: GpsReadingListParams) => {
  return useQuery<GpsReadingApiResponse>({
    queryKey: ["gps-readings", params],
    queryFn: () => getGpsReadings(params),
  });
};

export const useInfiniteGpsReadings = (
  params: Omit<GpsReadingListParams, "page">,
) => {
  return useInfiniteQuery<GpsReadingApiResponse>({
    queryKey: ["gps-readings-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getGpsReadings({
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
  });
};

export const useGpsReadingsByAnimal = (animalId: number) => {
  return useQuery<GpsReadingApiResponse>({
    queryKey: ["gps-readings", "animal", animalId],
    queryFn: () => getGpsReadingsByAnimal(animalId),
    enabled: Number.isFinite(animalId) && animalId > 0,
  });
};

export const useGpsReadingsByDevice = (deviceId: number) => {
  return useQuery<GpsReadingApiResponse>({
    queryKey: ["gps-readings", "device", deviceId],
    queryFn: () => getGpsReadingsByDevice(deviceId),
    enabled: Number.isFinite(deviceId) && deviceId > 0,
  });
};
