"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getGeoZones,
  getGeoZoneById,
} from "@/services/geo-zone.service";

import type { GeoZoneListParams } from "@/types/geo-zone";

export function useGeoZones(params?: GeoZoneListParams) {
  return useQuery({
    queryKey: ["geo-zones", params],
    queryFn: () => getGeoZones(params),
  });
}

export function useGeoZoneById(id: number) {
  return useQuery({
    queryKey: ["geo-zones", id],
    queryFn: () => getGeoZoneById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}