"use client";

import { useCallback } from "react";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import {
  getGpsReadings,
  getGpsReadingsByAnimal,
  getGpsReadingsByDevice,
} from "@/services/gps-reading.service";
import type { AsyncResource } from "@/hooks/useAsyncResource";
import type { GpsReading } from "@/types/gps-reading";

const EMPTY_READINGS: GpsReading[] = [];

export const useGPSReadings = (): AsyncResource<GpsReading[]> => {
  const load = useCallback(() => getGpsReadings(), []);

  return useAsyncResource(
    load,
    EMPTY_READINGS,
    (readings) => readings.length === 0,
  );
};

export const useGPSReadingsByAnimal = (
  animalId: number,
): AsyncResource<GpsReading[]> => {
  const load = useCallback(() => getGpsReadingsByAnimal(animalId), [animalId]);

  return useAsyncResource(
    load,
    EMPTY_READINGS,
    (readings) => readings.length === 0,
  );
};

export const useGPSReadingsByDevice = (
  deviceId: number,
): AsyncResource<GpsReading[]> => {
  const load = useCallback(() => getGpsReadingsByDevice(deviceId), [deviceId]);

  return useAsyncResource(
    load,
    EMPTY_READINGS,
    (readings) => readings.length === 0,
  );
};