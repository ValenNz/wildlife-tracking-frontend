
"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTrackingDevices,
  getTrackingDeviceById,
  getDeviceAlerts,
  createTrackingDevice,
  updateTrackingDevice,
  deleteTrackingDevice,
  assignAnimalToDevice,
  unassignAnimalFromDevice,
  updateDeviceCondition,
  updateDeviceStatus,
  updateDeviceTelemetry,
  getDeviceCaptures,
  uploadDeviceCapture,
} from "@/services/device.service";

import type { DeviceCondition } from "@/types/device.type";
import type {
  DeviceAlert,
  TrackingDevice,
  TrackingDeviceListParams,
  TYPE_TRACKING_DEVICE_PAYLOAD,
  TYPE_TRACKING_DEVICE_UPDATE_PAYLOAD,
} from "@/types/device.type";

import type { ApiResponse } from "@/types/api.type";

type TrackingDeviceApiResponse = ApiResponse<TrackingDevice[]>;

const invalidateTrackingDeviceQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ["tracking-devices"],
    }),
    queryClient.invalidateQueries({
      queryKey: ["tracking-devices-infinite"],
    }),
    queryClient.invalidateQueries({
      queryKey: ["device-alerts"],
    }),
  ]);
};

export const useTrackingDevices = (
  params?: TrackingDeviceListParams,
) => {
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
      getTrackingDevices({
        ...params,
        page: pageParam as number,
      } as TrackingDeviceListParams),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;

      if (!meta) return undefined;

      return meta.page < meta.total_pages ? meta.page + 1 : undefined;
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

export const useTrackingDeviceCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_TRACKING_DEVICE_PAYLOAD) =>
      createTrackingDevice(payload),

    onSuccess: async () => {
      await invalidateTrackingDeviceQueries(queryClient);
    },
  });
};

export const useTrackingDeviceUpdate = (deviceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_TRACKING_DEVICE_UPDATE_PAYLOAD) =>
      updateTrackingDevice(deviceId, payload),

    onSuccess: async () => {
      await Promise.all([
        invalidateTrackingDeviceQueries(queryClient),
        queryClient.invalidateQueries({
          queryKey: ["tracking-devices", deviceId],
        }),
      ]);
    },
  });
};

export const useTrackingDeviceDelete = (deviceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTrackingDevice(deviceId),

    onSuccess: async () => {
      await Promise.all([
        invalidateTrackingDeviceQueries(queryClient),
        queryClient.removeQueries({
          queryKey: ["tracking-devices", deviceId],
        }),
      ]);
    },
  });
};

const invalidateDeviceQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
  deviceId: number,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["tracking-devices"] }),
    queryClient.invalidateQueries({ queryKey: ["device-captures", deviceId] }),
    queryClient.invalidateQueries({ queryKey: ["animals"] }),
  ]);
};

export const useDeviceAssignAnimal = (deviceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ animalId, force = false }: { animalId: number; force?: boolean }) =>
      assignAnimalToDevice(deviceId, animalId, force),
    onSuccess: () => invalidateDeviceQueries(queryClient, deviceId),
  });
};

export const useDeviceUnassignAnimal = (deviceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unassignAnimalFromDevice(deviceId),
    onSuccess: () => invalidateDeviceQueries(queryClient, deviceId),
  });
};

export const useDeviceConditionUpdate = (deviceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (condition: DeviceCondition) => updateDeviceCondition(deviceId, condition),
    onSuccess: () => invalidateDeviceQueries(queryClient, deviceId),
  });
};

export const useDeviceStatusUpdate = (deviceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isActive: boolean) => updateDeviceStatus(deviceId, isActive),
    onSuccess: () => invalidateDeviceQueries(queryClient, deviceId),
  });
};

export const useDeviceTelemetryUpdate = (deviceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { battery_level?: number; signal_strength?: number }) =>
      updateDeviceTelemetry(deviceId, payload),
    onSuccess: () => invalidateDeviceQueries(queryClient, deviceId),
  });
};

export const useDeviceCaptures = (deviceId: number) =>
  useQuery({
    queryKey: ["device-captures", deviceId],
    queryFn: () => getDeviceCaptures(deviceId),
    enabled: deviceId > 0,
  });

export const useDeviceCaptureUpload = (deviceId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadDeviceCapture(deviceId, file),
    onSuccess: async () => {
      await Promise.all([
        invalidateDeviceQueries(queryClient, deviceId),
        queryClient.invalidateQueries({ queryKey: ["ai-predictions"] }),
        queryClient.invalidateQueries({ queryKey: ["ai-media-uploads"] }),
      ]);
    },
  });
};
