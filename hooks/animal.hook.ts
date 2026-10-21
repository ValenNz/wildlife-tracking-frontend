"use client";

import { useCallback } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ANIMAL_SERVICE } from "@/services/animal.service";
import type { QUERY_PARAMS_API_GET_ALL } from "@/types/endpoint.type";
import type { TYPE_ANIMAL_PAYLOAD } from "@/types/animal.type";
import type { TYPE_ANIMAL } from "@/types/animal.type";
import type { TYPE_META_PAGGINATION } from "@/types/meta.type";
import type { ApiResponse } from "@/types/api.type";
import type {
  TYPE_ANIMAL_GET_ALL_RESPONSE,
  TYPE_ANIMAL_GET_BY_ID_RESPONSE,
} from "@/types/animal.type";

export const useAnimals = (params?: QUERY_PARAMS_API_GET_ALL) => {
  return useQuery<ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE>>({
    queryKey: ["animals", params],
    queryFn: () => ANIMAL_SERVICE.GET_ALL(params),
  });
};

export const useInfiniteAnimals = (
  params: Omit<QUERY_PARAMS_API_GET_ALL, "page">,
) => {
  return useInfiniteQuery<ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE>>({
    queryKey: ["animals-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      ANIMAL_SERVICE.GET_ALL({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;

      if (!meta) return undefined;

      return meta.page < meta.total_pages ? meta.page + 1 : undefined;
    },
  });
};

export const useAnimalById = (id: number) => {
  return useQuery<ApiResponse<TYPE_ANIMAL_GET_BY_ID_RESPONSE>>({
    queryKey: ["animals", id],
    queryFn: () => ANIMAL_SERVICE.GET_BY_ID(id),
    enabled: Number.isFinite(id) && id > 0,
  });
};

export const useAnimalCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_ANIMAL_PAYLOAD) => ANIMAL_SERVICE.CREATE(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
    },
  });
};

export const useAnimalUpdate = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_ANIMAL_PAYLOAD) =>
      ANIMAL_SERVICE.UPDATE(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["animals", id] });
    },
  });
};

export const useAnimalDelete = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ANIMAL_SERVICE.DELETE(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      queryClient.invalidateQueries({ queryKey: ["animals", id] });
    },
  });
};