
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getGeoZones,
  getGeoZoneById,
  createGeoZone,
  updateGeoZone,
  deleteGeoZone,
  getGeoZoneAnimals,
  getGeoZoneDevices,
  locateGeoZones,
} from "@/services/geo-zone.service";

import type {
  GeoZoneCreatePayload,
  GeoZoneListParams,
  GeoZoneUpdatePayload,
} from "@/types/geo-zone.type";

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

export function useGeoZoneCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GeoZoneCreatePayload) =>
      createGeoZone(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["geo-zones"],
      });
    },
  });
}

export function useGeoZoneUpdate(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GeoZoneUpdatePayload) =>
      updateGeoZone(id, payload),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["geo-zones"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["geo-zones", id],
        }),
      ]);
    },
  });
}

export function useGeoZoneDelete(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteGeoZone(id),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["geo-zones"],
        }),
        queryClient.removeQueries({
          queryKey: ["geo-zones", id],
        }),
      ]);
    },
  });
}

export function useGeoZoneAnimals(id: number) {
  return useQuery({
    queryKey: ["geo-zones", id, "animals"],
    queryFn: () => getGeoZoneAnimals(id),
    enabled: id > 0,
  });
}

export function useGeoZoneDevices(id: number) {
  return useQuery({
    queryKey: ["geo-zones", id, "devices"],
    queryFn: () => getGeoZoneDevices(id),
    enabled: id > 0,
  });
}

export function useLocateGeoZones(point: { lat: number; lon: number } | null) {
  return useQuery({
    queryKey: ["geo-zones", "locate", point],
    queryFn: () => locateGeoZones(point!.lat, point!.lon),
    enabled: point !== null,
  });
}
