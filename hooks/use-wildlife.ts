"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { WILDLIFE_SERVICE } from "@/services/wildlife.service";
import type { TYPE_MODEL_SOURCE, TYPE_SPECIES_PROFILE_PAYLOAD, TYPE_WILDLIFE_PARAMS } from "@/types/wildlife.type";

const WILDLIFE_KEY = ["wildlife"] as const;

export const useWildlifeSpecies = (params?: TYPE_WILDLIFE_PARAMS) =>
  useQuery({
    queryKey: [...WILDLIFE_KEY, "list", params],
    queryFn: () => WILDLIFE_SERVICE.GET_ALL(params),
    select: (response) => response.data,
  });

export const useWildlifeSpeciesDetail = (id: number, staff = false) =>
  useQuery({
    queryKey: [...WILDLIFE_KEY, "detail", id, staff],
    queryFn: () => (staff ? WILDLIFE_SERVICE.GET_FOR_STAFF(id) : WILDLIFE_SERVICE.GET_BY_ID(id)),
    select: (response) => response.data,
    enabled: id > 0,
  });

export const useSpeciesModelUrl = (id: number, enabled: boolean, version: string, staff = false) => {
  const query = useQuery({
    queryKey: [...WILDLIFE_KEY, "model", id, version, staff],
    queryFn: async () => (await WILDLIFE_SERVICE.GET_MODEL(id, staff)).blob,
    enabled: enabled && id > 0,
    staleTime: 30 * 60 * 1000,
  });
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data) return;
    const objectUrl = URL.createObjectURL(query.data);
    queueMicrotask(() => setUrl(objectUrl));
    return () => URL.revokeObjectURL(objectUrl);
  }, [query.data]);

  return { url: query.data ? url : null, isLoading: query.isLoading, error: query.error };
};

const useInvalidateWildlife = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: WILDLIFE_KEY }),
      queryClient.invalidateQueries({ queryKey: ["species"] }),
    ]);
};

export const useSpeciesProfileUpdate = () => {
  const invalidate = useInvalidateWildlife();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TYPE_SPECIES_PROFILE_PAYLOAD }) => WILDLIFE_SERVICE.UPDATE_PROFILE(id, payload),
    onSuccess: invalidate,
  });
};

export const useSpeciesModelUpload = () => {
  const invalidate = useInvalidateWildlife();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; file: File; model_source: TYPE_MODEL_SOURCE; model_credit: string }) =>
      WILDLIFE_SERVICE.UPLOAD_MODEL(id, payload),
    onSuccess: invalidate,
  });
};

export const useSpeciesModelDelete = () => {
  const invalidate = useInvalidateWildlife();
  return useMutation({ mutationFn: WILDLIFE_SERVICE.DELETE_MODEL, onSuccess: invalidate });
};
