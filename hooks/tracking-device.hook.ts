"use client";

import { useCallback } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getTrackingDevices, getTrackingDeviceById, getDeviceAlerts } from "@/services/tracking-device.service";
import type { TrackingDevice, DeviceAlert, TrackingDeviceListParams } from "@/types/tracking-device.type";
import type { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type { ApiResponse } from "@/types/api.type";

type TrackingDeviceGetAllResponse = {
  items: TrackingDevice[];
  meta: TYPE_META_PAGGINATION;
};

type TrackingDeviceApiResponse = ApiResponse<TrackingDevice[]>;

export const useTrackingDevices = (params?: TrackingDeviceListParams) => {
  return useQuery<TrackingDeviceApiResponse>({
    queryKey: ["tracking-devices", params],
    queryFn: () => getTrackingDevices(params),
  });
};

export const useInfiniteTrackingDevices = (
  params: Omit<TrackingDeviceListParams, "page">,
) => {
  return useInfiniteQuery<TrackingDeviceApiResponse>({
    queryKey: ["tracking-devices-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getTrackingDevices({ ...params, page: pageParam as number } as TrackingDeviceListParams),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // The backend doesn't provide pagination meta for tracking-devices
      return undefined;
    },
  });
};

export const useTrackingDeviceById = (id: number) => {
  return useQuery<ApiResponse<TrackingDevice | null>>({
    queryKey: ["tracking-devices", id],
    queryFn: () => getTrackingDeviceById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useDeviceAlerts = () => {
  return useQuery<ApiResponse<DeviceAlert[]>>({
    queryKey: ["device-alerts"],
    queryFn: () => getDeviceAlerts(),
  });
};