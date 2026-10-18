"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { SPECIES_SERVICE } from "@/services/species.service";
import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL_FILTERS } from "@/types/endpoint.type";
import type {
  TYPE_SPECIES,
  TYPE_SPECIES_CREATE_PAYLOAD,
  TYPE_SPECIES_GET_ALL_RESPONSE,
  TYPE_SPECIES_UPDATE_PAYLOAD,
} from "@/types/wildlife/species.type";
import type { TYPE_SPECIES_QUERY_PARAMS } from "@/services/species.service";

const QUERY_KEY_ROOT = "wildlife-species";

export const useSpecies = (params: TYPE_SPECIES_QUERY_PARAMS = {}) =>
  useQuery({
    queryKey: [QUERY_KEY_ROOT, params],
    queryFn: () => SPECIES_SERVICE.GET_ALL(params),
  });

export const useInfiniteSpecies = (params: TYPE_SPECIES_QUERY_PARAMS = {}) =>
  useInfiniteQuery({
    queryKey: [`${QUERY_KEY_ROOT}-infinite`, params],
    queryFn: ({ pageParam }) =>
      SPECIES_SERVICE.GET_ALL({
        ...params,
        page: (pageParam as number) ?? 1,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: ApiResponse<TYPE_SPECIES_GET_ALL_RESPONSE>) => {
      const meta = lastPage.data?.meta;

      if (!meta) return undefined;

      return meta.page < meta.total_pages ? meta.page + 1 : undefined;
    },
  });

export const useSpeciesById = (id: number) =>
  useQuery({
    queryKey: [`${QUERY_KEY_ROOT}-detail`, id],
    queryFn: () => SPECIES_SERVICE.GET_BY_ID(id),
    enabled: Number.isFinite(id) && id > 0,
  });

export const useAllSpecies = (
  params: QUERY_PARAMS_API_GET_ALL_FILTERS = {},
) =>
  useQuery({
    queryKey: [`${QUERY_KEY_ROOT}-all`, params],
    queryFn: async () => {
      const first = await SPECIES_SERVICE.GET_ALL({
        ...params,
        page: 1,
        per_page: 100,
        order: params.order ?? "asc",
      });

      const totalPages = first.data?.meta?.total_pages ?? 1;

      const rest = await Promise.all(
        Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) =>
          SPECIES_SERVICE.GET_ALL({
            ...params,
            page: index + 2,
            per_page: 100,
            order: params.order ?? "asc",
          }),
        ),
      );

      const items: TYPE_SPECIES[] = [
        ...(first.data?.items ?? []),
        ...rest.flatMap((page) => page.data?.items ?? []),
      ];

      return { items, meta: first.data?.meta ?? null };
    },
  });

export const useCreateSpecies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_SPECIES_CREATE_PAYLOAD) =>
      SPECIES_SERVICE.CREATE(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ROOT] });
    },
  });
};

export const useUpdateSpecies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: TYPE_SPECIES_UPDATE_PAYLOAD;
    }) => SPECIES_SERVICE.UPDATE(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ROOT] });
    },
  });
};

export const useDeleteSpecies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => SPECIES_SERVICE.DELETE(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ROOT] });
    },
  });
};
