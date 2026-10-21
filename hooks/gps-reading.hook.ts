"use client";

import { useCallback } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getGpsReadings, getGpsReadingsByAnimal, getGpsReadingsByDevice } from "@/services/gps-reading.service";
import type { GpsReading, GpsReadingListParams } from "@/types/gps-reading";
import type { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type { ApiResponse } from "@/types/api.type";

type GpsReadingGetAllResponse = {
  items: GpsReading[];
  meta: TYPE_META_PAGGINATION;
};

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
      getGpsReadings({ ...params, page: pageParam as number } as GpsReadingListParams),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // The backend doesn't provide pagination meta for gps-readings
      // This is a limitation - we'll stop after first page
      return undefined;
    },
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