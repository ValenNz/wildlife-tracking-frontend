"use client";

import { useCallback } from "react";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { getGeoZones } from "@/services/geo-zone.service";
import type { AsyncResource } from "@/hooks/useAsyncResource";
import type { GeoZone, GeoZoneListParams } from "@/types/geo-zone";

const EMPTY_ZONES: GeoZone[] = [];

export const useGeoZones = (
  params?: GeoZoneListParams,
): AsyncResource<GeoZone[]> => {
  const { zoneType, search } = params ?? {};

  const load = useCallback(
    () => getGeoZones({ zoneType, search }),
    [zoneType, search],
  );

  return useAsyncResource(load, EMPTY_ZONES, (zones) => zones.length === 0);
};