"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ANIMAL_SERVICE } from "@/services/animal.service";
import type { ApiResponse } from "@/types/api.type";
import type { QUERY_PARAMS_API_GET_ALL_FILTERS } from "@/types/endpoint.type";
import type {
  TYPE_ANIMAL,
  TYPE_ANIMAL_CREATE_PAYLOAD,
  TYPE_ANIMAL_GET_ALL_RESPONSE,
  TYPE_ANIMAL_UPDATE_PAYLOAD,
} from "@/types/wildlife/animal.type";
import type { TYPE_ANIMAL_QUERY_PARAMS } from "@/services/animal.service";

const QUERY_KEY_ROOT = "wildlife-animals";

export const useAnimals = (params: TYPE_ANIMAL_QUERY_PARAMS = {}) =>
  useQuery({
    queryKey: [QUERY_KEY_ROOT, params],
    queryFn: () => ANIMAL_SERVICE.GET_ALL(params),
  });

export const useInfiniteAnimals = (params: TYPE_ANIMAL_QUERY_PARAMS = {}) =>
  useInfiniteQuery({
    queryKey: [`${QUERY_KEY_ROOT}-infinite`, params],
    queryFn: ({ pageParam }) =>
      ANIMAL_SERVICE.GET_ALL({
        ...params,
        page: (pageParam as number) ?? 1,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: ApiResponse<TYPE_ANIMAL_GET_ALL_RESPONSE>) => {
      const meta = lastPage.data?.meta;

      if (!meta) return undefined;

      return meta.page < meta.total_pages ? meta.page + 1 : undefined;
    },
  });

export const useAnimalById = (id: number) =>
  useQuery({
    queryKey: [`${QUERY_KEY_ROOT}-detail`, id],
    queryFn: () => ANIMAL_SERVICE.GET_BY_ID(id),
    enabled: Number.isFinite(id) && id > 0,
  });

export const useAllAnimals = (
  params: QUERY_PARAMS_API_GET_ALL_FILTERS = {},
) =>
  useQuery({
    queryKey: [`${QUERY_KEY_ROOT}-all`, params],
    queryFn: async () => {
      const first = await ANIMAL_SERVICE.GET_ALL({
        ...params,
        page: 1,
        per_page: 100,
        order: params.order ?? "asc",
      });

      const totalPages = first.data?.meta?.total_pages ?? 1;

      const rest = await Promise.all(
        Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) =>
          ANIMAL_SERVICE.GET_ALL({
            ...params,
            page: index + 2,
            per_page: 100,
            order: params.order ?? "asc",
          }),
        ),
      );

      const items: TYPE_ANIMAL[] = [
        ...(first.data?.items ?? []),
        ...rest.flatMap((page) => page.data?.items ?? []),
      ];

      return { items, meta: first.data?.meta ?? null };
    },
  });

export const useCreateAnimal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TYPE_ANIMAL_CREATE_PAYLOAD) =>
      ANIMAL_SERVICE.CREATE(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ROOT] });
    },
  });
};

export const useUpdateAnimal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: TYPE_ANIMAL_UPDATE_PAYLOAD;
    }) => ANIMAL_SERVICE.UPDATE(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ROOT] });
    },
  });
};

export const useDeleteAnimal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ANIMAL_SERVICE.DELETE(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ROOT] });
    },
  });
};
