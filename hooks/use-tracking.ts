
"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getGpsReadings,
  getGpsReadingsByAnimal,
  getGpsReadingsByDevice,
  createGpsReading,
} from "@/services/tracking.service";

import type {
  GpsReadingCreatePayload,
  GpsReading,
  GpsReadingListParams,
} from "@/types/tracking.type";

import type { ApiResponse } from "@/types/api.type";

type GpsReadingApiResponse = ApiResponse<GpsReading[]>;

export const useGpsReadings = (
  params?: GpsReadingListParams,
  options?: { refetchInterval?: number | false },
) => {
  return useQuery<GpsReadingApiResponse>({
    queryKey: ["gps-readings", params],
    queryFn: () => getGpsReadings(params),
    refetchInterval: options?.refetchInterval,
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
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;

      if (!meta) return undefined;

      return meta.page < meta.total_pages ? meta.page + 1 : undefined;
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

export const useGpsReadingCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GpsReadingCreatePayload) => createGpsReading(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gps-readings"] });
    },
  });
};
