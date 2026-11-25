"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ZONE_VISIT_SERVICE } from "@/services/zone-visit.service";
import type {
  TYPE_ZONE_VISIT_PARAMS,
  TYPE_ZONE_VISIT_PAYLOAD,
} from "@/types/zone-visit.type";

const ZONE_VISITS_KEY = ["zone-visits"] as const;

export const useZoneVisits = (params?: TYPE_ZONE_VISIT_PARAMS) =>
  useQuery({
    queryKey: [...ZONE_VISITS_KEY, params],
    queryFn: () => ZONE_VISIT_SERVICE.GET_ALL(params),
  });

export const useAnimalZoneVisits = (animalId: number) =>
  useQuery({
    queryKey: [...ZONE_VISITS_KEY, "animal", animalId],
    queryFn: () => ZONE_VISIT_SERVICE.GET_BY_ANIMAL(animalId),
    enabled: animalId > 0,
  });

export const useGeoZoneVisits = (zoneId: number) =>
  useQuery({
    queryKey: [...ZONE_VISITS_KEY, "zone", zoneId],
    queryFn: () => ZONE_VISIT_SERVICE.GET_BY_ZONE(zoneId),
    enabled: zoneId > 0,
  });

export const useZoneVisitCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_ZONE_VISIT_PAYLOAD) => ZONE_VISIT_SERVICE.CREATE(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ZONE_VISITS_KEY });
    },
  });
};

export const useZoneVisitExit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ZONE_VISIT_SERVICE.EXIT(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ZONE_VISITS_KEY });
    },
  });
};
