"use client";

import { useCallback } from "react";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { getTrackingDeviceById, getTrackingDevices } from "@/services/tracking-device.service";
import type { AsyncResource } from "@/hooks/useAsyncResource";
import type { TrackingDevice, TrackingDeviceListParams } from "@/types/tracking-device.type";

const EMPTY_DEVICES: TrackingDevice[] = [];
const EMPTY_DEVICE: TrackingDevice | null = null;

export const useTrackingDevices = (
  params?: TrackingDeviceListParams,
): AsyncResource<TrackingDevice[]> => {
  const { animalId, onlyActive, deviceCondition } = params ?? {};

  const load = useCallback(
    () => getTrackingDevices({ animalId, onlyActive, deviceCondition }),
    [animalId, onlyActive, deviceCondition],
  );

  return useAsyncResource(
    load,
    EMPTY_DEVICES,
    (devices) => devices.length === 0,
  );
};

export const useTrackingDevice = (
  deviceId: number,
): AsyncResource<TrackingDevice | null> => {
  const load = useCallback(() => getTrackingDeviceById(deviceId), [deviceId]);

  return useAsyncResource(load, EMPTY_DEVICE, (device) => device === null);
};